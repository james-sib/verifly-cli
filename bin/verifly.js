#!/usr/bin/env node
/**
 * Verifly CLI - Email Verification Tool
 * 
 * Usage:
 *   verifly verify user@example.com
 *   verifly verify-csv input.csv -o output.csv
 *   verifly config --key YOUR_API_KEY
 *   verifly stats
 * 
 * Powered by Verifly.email - The cheapest email verification API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

// Configuration
const CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.verifly');
const API_BASE = 'api.verifly.email';
const VERSION = '1.0.0';

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m'
};

// Load config
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (e) {}
  return {};
}

// Save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// Make API request
function apiRequest(endpoint, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': `verifly-cli/${VERSION}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid API response'));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Verify single email
async function verifyEmail(email, apiKey) {
  try {
    const result = await apiRequest(`/v1/verify?email=${encodeURIComponent(email)}`, apiKey);
    return result;
  } catch (err) {
    return { error: err.message };
  }
}

// Offline regex validation (basic)
function offlineValidate(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = regex.test(email);
  
  // Check for common disposable domains
  const disposableDomains = ['mailinator.com', 'guerrillamail.com', 'tempmail.com', 'yopmail.com', '10minutemail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  const isDisposable = disposableDomains.includes(domain);
  
  return {
    email,
    format: isValid ? 'valid' : 'invalid',
    disposable: isDisposable,
    offline: true
  };
}

// Print result
function printResult(result) {
  const statusColor = result.result === 'valid' ? colors.green 
    : result.result === 'invalid' ? colors.red 
    : colors.yellow;
  
  console.log(`\n${colors.blue}Email:${colors.reset} ${result.email}`);
  console.log(`${colors.blue}Status:${colors.reset} ${statusColor}${result.result || result.format}${colors.reset}`);
  
  if (result.disposable) {
    console.log(`${colors.yellow}⚠ Disposable email detected${colors.reset}`);
  }
  if (result.role) {
    console.log(`${colors.yellow}⚠ Role account (info@, admin@, etc.)${colors.reset}`);
  }
  if (result.offline) {
    console.log(`${colors.dim}(Offline validation - use API for full check)${colors.reset}`);
  }
}

// Main CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Show banner
  console.log(`
${colors.blue}╔═══════════════════════════════════════╗
║  Verifly CLI v${VERSION}                     ║
║  The cheapest email verification API  ║
╚═══════════════════════════════════════╝${colors.reset}
`);

  if (!command || command === '--help' || command === '-h') {
    console.log(`
${colors.blue}Usage:${colors.reset}
  verifly verify <email>           Verify a single email
  verifly verify-csv <file>        Verify emails from CSV
  verifly config --key <API_KEY>   Set your API key
  verifly stats                    Show usage statistics
  verifly offline <email>          Quick offline validation

${colors.blue}Options:${colors.reset}
  -o, --output <file>    Output file for CSV verification
  -k, --key <key>        Use specific API key (override config)
  --offline              Use offline validation only (no API)

${colors.blue}Examples:${colors.reset}
  verifly verify user@example.com
  verifly verify-csv emails.csv -o results.csv
  verifly config --key vf_xxxxxxxxxxxxx

${colors.blue}Get your free API key:${colors.reset}
  https://verifly.email/signup (1000 free verifications/month)

${colors.dim}Powered by Verifly.email - $5/10k emails${colors.reset}
`);
    return;
  }

  const config = loadConfig();
  
  // Handle commands
  switch (command) {
    case 'config':
      if (args[1] === '--key' && args[2]) {
        config.apiKey = args[2];
        saveConfig(config);
        console.log(`${colors.green}✓ API key saved${colors.reset}`);
        console.log(`${colors.dim}Config stored at: ${CONFIG_PATH}${colors.reset}`);
      } else {
        console.log(`Current API key: ${config.apiKey ? '****' + config.apiKey.slice(-4) : 'Not set'}`);
        console.log(`\nTo set: verifly config --key YOUR_API_KEY`);
      }
      break;

    case 'verify':
      const email = args[1];
      if (!email) {
        console.error(`${colors.red}Error: Please provide an email address${colors.reset}`);
        console.log('Usage: verifly verify user@example.com');
        process.exit(1);
      }
      
      if (args.includes('--offline') || !config.apiKey) {
        const result = offlineValidate(email);
        printResult(result);
        if (!config.apiKey) {
          console.log(`\n${colors.yellow}Tip: Set API key for full verification:${colors.reset}`);
          console.log('  verifly config --key YOUR_API_KEY');
          console.log('  Get free key: https://verifly.email/signup');
        }
      } else {
        console.log('Verifying...');
        const result = await verifyEmail(email, config.apiKey);
        printResult(result);
      }
      break;

    case 'offline':
      const offEmail = args[1];
      if (!offEmail) {
        console.error(`${colors.red}Error: Please provide an email address${colors.reset}`);
        process.exit(1);
      }
      const offResult = offlineValidate(offEmail);
      printResult(offResult);
      break;

    case 'verify-csv':
      const csvFile = args[1];
      if (!csvFile) {
        console.error(`${colors.red}Error: Please provide a CSV file${colors.reset}`);
        process.exit(1);
      }
      
      if (!fs.existsSync(csvFile)) {
        console.error(`${colors.red}Error: File not found: ${csvFile}${colors.reset}`);
        process.exit(1);
      }
      
      const outputIndex = args.indexOf('-o') !== -1 ? args.indexOf('-o') : args.indexOf('--output');
      const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : csvFile.replace('.csv', '-verified.csv');
      
      console.log(`Input: ${csvFile}`);
      console.log(`Output: ${outputFile}`);
      console.log('Processing...\n');
      
      const content = fs.readFileSync(csvFile, 'utf8');
      const emails = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && line.includes('@'));
      
      const results = [];
      let valid = 0, invalid = 0, risky = 0;
      
      for (const email of emails) {
        const result = config.apiKey 
          ? await verifyEmail(email, config.apiKey)
          : offlineValidate(email);
        
        results.push(`${email},${result.result || result.format},${result.disposable || false}`);
        
        if (result.result === 'valid' || result.format === 'valid') valid++;
        else if (result.result === 'invalid' || result.format === 'invalid') invalid++;
        else risky++;
        
        process.stdout.write(`\rProcessed: ${results.length}/${emails.length}`);
      }
      
      fs.writeFileSync(outputFile, 'email,status,disposable\n' + results.join('\n'));
      
      console.log(`\n\n${colors.green}✓ Done!${colors.reset}`);
      console.log(`\nResults:`);
      console.log(`  ${colors.green}Valid:${colors.reset}   ${valid}`);
      console.log(`  ${colors.red}Invalid:${colors.reset} ${invalid}`);
      console.log(`  ${colors.yellow}Risky:${colors.reset}   ${risky}`);
      console.log(`\nOutput saved to: ${outputFile}`);
      break;

    case 'stats':
      if (!config.apiKey) {
        console.error(`${colors.red}Error: API key not set${colors.reset}`);
        console.log('Set with: verifly config --key YOUR_API_KEY');
        process.exit(1);
      }
      
      console.log('Fetching stats...');
      const stats = await apiRequest('/v1/stats', config.apiKey);
      
      console.log(`\n${colors.blue}Account Statistics:${colors.reset}`);
      console.log(`  Used this month: ${stats.used || 0}`);
      console.log(`  Remaining: ${stats.remaining || 'N/A'}`);
      console.log(`  Plan: ${stats.plan || 'Free'}`);
      break;

    default:
      console.error(`${colors.red}Unknown command: ${command}${colors.reset}`);
      console.log('Run "verifly --help" for usage');
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
