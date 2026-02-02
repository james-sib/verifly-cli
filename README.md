# Verifly CLI 📧

Email verification from your terminal. Powered by [Verifly.email](https://verifly.email) — the cheapest email verification API.

## Installation

```bash
npm install -g verifly-cli
```

## Quick Start

```bash
# Verify a single email
verifly verify user@example.com

# Offline validation (no API needed)
verifly offline user@example.com

# Verify a CSV file
verifly verify-csv emails.csv -o results.csv
```

## Setup

Get your free API key at [verifly.email/signup](https://verifly.email/signup) (1000 free verifications/month).

```bash
verifly config --key vf_your_api_key_here
```

## Commands

### `verifly verify <email>`

Verify a single email address using the API.

```bash
$ verifly verify test@gmail.com

Email: test@gmail.com
Status: valid
```

### `verifly offline <email>`

Quick offline validation (regex + disposable domain check). No API key required.

```bash
$ verifly offline spam@mailinator.com

Email: spam@mailinator.com
Status: valid
⚠ Disposable email detected
(Offline validation - use API for full check)
```

### `verifly verify-csv <file>`

Bulk verify emails from a CSV file.

```bash
$ verifly verify-csv contacts.csv -o verified.csv

Input: contacts.csv
Output: verified.csv
Processing...

Processed: 100/100

✓ Done!

Results:
  Valid:   78
  Invalid: 15
  Risky:   7

Output saved to: verified.csv
```

### `verifly stats`

Check your API usage.

```bash
$ verifly stats

Account Statistics:
  Used this month: 247
  Remaining: 753
  Plan: Free
```

### `verifly config`

Manage your configuration.

```bash
# Set API key
verifly config --key vf_xxxxx

# View current config
verifly config
```

## Pricing

| Plan | Price | Verifications |
|------|-------|---------------|
| Free | $0 | 1000/month |
| Starter | $5 | 10,000 |
| Growth | $40 | 100,000 |
| Scale | $200 | 1,000,000 |

Compare to competitors:
- ZeroBounce: $75/10k
- NeverBounce: $50/10k
- Bouncify: $19/10k
- **Verifly: $5/10k** ✅

## Why Verifly?

- 💰 **Cheapest option** — $5/10k vs $50-75 for competitors
- 🎁 **Generous free tier** — 1000/month vs 10-100 elsewhere
- ⚡ **Fast** — ~100ms response time
- 🎯 **99%+ accuracy** — Same as expensive alternatives
- 🛠️ **Simple API** — One endpoint, clear responses

## Contributing

Issues and PRs welcome at [github.com/james-sib/verifly-cli](https://github.com/james-sib/verifly-cli).

## License

MIT

---

Built with ❤️ by [Verifly.email](https://verifly.email) — The cheapest email verification API that doesn't suck.
