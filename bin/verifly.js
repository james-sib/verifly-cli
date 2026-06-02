#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'

const DEFAULT_API_BASE = 'https://verifly.email/api/v1'
const PUBLIC_BASE = 'https://verifly.email'
const [, , command, ...rawArgs] = process.argv

function help() {
  console.log([
    'Verifly CLI', '',
    'Usage:',
    '  verifly verify <email> [--format json|text] [--out file]',
    '  verifly batch <file> [--format json|csv] [--out file] [--limit 100]',
    '  verifly clean <file> [--format json|csv] [--out file]',
    '  verifly extract <file> [--format json|csv] [--out file]',
    '  verifly domain <domain-or-email> [--format json|text]',
    '  verifly credits',
    '  verifly usage', '',
    'Options:',
    '  --api-key <key>       Overrides VERIFLY_API_KEY.',
    '  --base <url>          Overrides VERIFLY_API_BASE.',
    '  --format <format>     json, csv, or text depending on command.',
    '  --out <file>          Write output to a file.',
    '  --limit <n>           Limit batch size before API call.', '',
    'Environment:',
    '  VERIFLY_API_KEY       Required for verify, batch, clean, extract, credits, usage.',
    '  VERIFLY_API_BASE      Optional. Defaults to https://verifly.email/api/v1.'
  ].join('\n'))
}

function parseArgs(args) {
  const options = { format: 'json', out: '', apiKey: process.env.VERIFLY_API_KEY || '', base: process.env.VERIFLY_API_BASE || DEFAULT_API_BASE, limit: 100 }
  const rest = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--format') options.format = args[++i] || 'json'
    else if (arg === '--out') options.out = args[++i] || ''
    else if (arg === '--api-key') options.apiKey = args[++i] || ''
    else if (arg === '--base') options.base = (args[++i] || DEFAULT_API_BASE).replace(/\/$/, '')
    else if (arg === '--limit') options.limit = Number(args[++i] || 100)
    else rest.push(arg)
  }
  return { options, rest }
}

function requireKey(options) { if (!options.apiKey) throw new Error('Missing VERIFLY_API_KEY or --api-key.') }
function parseEmails(text) { const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []; return [...new Set(matches.map((value) => value.trim().toLowerCase()))] }

function toCsv(rows) {
  const array = Array.isArray(rows) ? rows : rows?.results || rows?.emails || rows?.clean || []
  if (!Array.isArray(array) || array.length === 0) return ''
  const normalized = array.map((item) => typeof item === 'string' ? { email: item } : item)
  const headers = [...new Set(normalized.flatMap((row) => Object.keys(row)))]
  const quote = (value) => '"' + String(value ?? '').replace(/"/g, '""') + '"'
  return [headers.join(','), ...normalized.map((row) => headers.map((key) => quote(row[key])).join(','))].join('\n') + '\n'
}

async function request(options, route, init = {}) {
  requireKey(options)
  const response = await fetch(options.base + route, { ...init, headers: { Authorization: 'Bearer ' + options.apiKey, 'Content-Type': 'application/json', ...(init.headers || {}) } })
  const text = await response.text()
  let data
  try { data = text ? JSON.parse(text) : {} } catch { data = { raw: text } }
  if (!response.ok) throw new Error('Verifly API ' + response.status + ': ' + (data?.error || data?.message || response.statusText))
  return data
}

async function publicRequest(route) {
  const response = await fetch(PUBLIC_BASE + route)
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || response.statusText)
  return data
}

function textSummary(data) {
  if (data?.domain && typeof data.score !== 'undefined') return ['Domain: ' + data.domain, 'Score: ' + data.score, 'MX records: ' + (data.mx?.length || 0), 'SPF: ' + (data.spf?.found ? 'found' : 'missing'), 'DMARC: ' + (data.dmarc?.policy || (data.dmarc?.found ? 'found' : 'missing'))].join('\n') + '\n'
  return JSON.stringify(data, null, 2) + '\n'
}

async function output(data, options) {
  const text = options.format === 'csv' ? toCsv(data) : options.format === 'text' ? textSummary(data) : JSON.stringify(data, null, 2) + '\n'
  if (options.out) { await writeFile(options.out, text, 'utf8'); console.error('Wrote ' + options.out) } else { process.stdout.write(text) }
}

async function main() {
  if (!command || command === '--help' || command === '-h') return help()
  const { options, rest } = parseArgs(rawArgs)
  if (command === 'verify') { const email = rest[0]; if (!email) throw new Error('Usage: verifly verify <email>'); return output(await request(options, '/verify?email=' + encodeURIComponent(email)), options) }
  if (command === 'batch') { const file = rest[0]; if (!file) throw new Error('Usage: verifly batch <file>'); const emails = parseEmails(await readFile(file, 'utf8')).slice(0, options.limit); if (emails.length > 100) throw new Error('The /verify/batch endpoint accepts up to 100 emails per request.'); return output(await request(options, '/verify/batch', { method: 'POST', body: JSON.stringify({ emails }) }), options) }
  if (command === 'clean') { const file = rest[0]; if (!file) throw new Error('Usage: verifly clean <file>'); const emails = parseEmails(await readFile(file, 'utf8')); return output(await request(options, '/clean', { method: 'POST', body: JSON.stringify({ emails }) }), options) }
  if (command === 'extract') { const file = rest[0]; if (!file) throw new Error('Usage: verifly extract <file>'); const text = await readFile(file, 'utf8'); return output(await request(options, '/extract', { method: 'POST', body: JSON.stringify({ text, options: { deduplicate: true, lowercase: true } }) }), options) }
  if (command === 'domain') { const value = rest[0]; if (!value) throw new Error('Usage: verifly domain <domain-or-email>'); return output(await publicRequest('/api/tools/domain-health?domain=' + encodeURIComponent(value)), options) }
  if (command === 'credits') return output(await request(options, '/credits'), options)
  if (command === 'usage') return output(await request(options, '/usage'), options)
  throw new Error('Unknown command: ' + command)
}

main().catch((error) => { console.error(error.message); process.exitCode = 1 })
