# verifly-cli

The **cheapest** email verification tool. Verify emails from your terminal.

Powered by [Verifly.email](https://verifly.email) — $5/10k verifications.

## Install

```bash
npm install -g verifly-cli
```

## Quick Start

```bash
# Set your API key (get free at https://verifly.email/signup)
verifly config --key vf_your_api_key

# Verify an email
verifly verify user@example.com

# Bulk verify from CSV
verifly verify-csv emails.csv -o results.csv

# Quick offline check (no API needed)
verifly offline user@example.com
```

## Commands

| Command | Description |
|---------|-------------|
| `verifly verify <email>` | Verify a single email address |
| `verifly verify-csv <file>` | Bulk verify emails from a CSV file |
| `verifly config --key <key>` | Save your API key |
| `verifly stats` | View your usage statistics |
| `verifly offline <email>` | Offline format + disposable check |

## Features

- ✅ **Single email verification** — instant results
- 📋 **Bulk CSV verification** — process thousands of emails
- 🔒 **Offline mode** — basic validation without API
- 🗑️ **Disposable detection** — catch throwaway emails
- 👤 **Role account detection** — flag info@, admin@, etc.
- 💰 **Cheapest on the market** — $5 per 10,000 verifications

## Output

```
╔═══════════════════════════════════════╗
║  Verifly CLI v1.0.0                   ║
║  The cheapest email verification API  ║
╚═══════════════════════════════════════╝

Email: user@example.com
Status: deliverable
```

## API Key

Get your free API key at [verifly.email/signup](https://verifly.email/signup).

- **Free tier**: 100 verifications/month
- **Paid**: Starting at $5/10k — the cheapest email verification API

## CSV Format

Input CSV should have one email per line:

```
user1@example.com
user2@example.com
admin@company.com
```

Output includes verification status:

```csv
email,status,disposable
user1@example.com,deliverable,false
user2@example.com,undeliverable,false
admin@company.com,deliverable,false
```

## License

MIT — [Verifly.email](https://verifly.email)
