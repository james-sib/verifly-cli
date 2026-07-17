# @verifly/cli

## Free email tools & API

- [Catch-all email verifier](https://verifly.email/tools/catch-all-checker) — check if a domain is accept-all
- [Disposable email checker](https://verifly.email/tools/disposable-email-checker)
- [Bulk email verification API](https://verifly.email/bulk-email-verification-api) — clean CSV lists
- [Email verification API for developers](https://verifly.email/email-verification-api-for-developers) — pay-as-you-go, 100 free credits, no monthly fee

Agent-friendly command line tools for Verifly email verification and list hygiene.

## Install

~~~bash
npm install -g @verifly/cli
npx @verifly/cli --help
~~~

Until npm publishing is unblocked, download the package from https://verifly.email/downloads/verifly-agent-kit.zip.

## Configure

~~~bash
export VERIFLY_API_KEY="vf_your_key"
~~~

PowerShell:

~~~powershell
$env:VERIFLY_API_KEY="vf_your_key"
~~~

## Commands

~~~bash
verifly verify lead@example.com --format json
verifly batch leads.csv --out results.json
verifly clean leads.csv --format csv --out clean.csv
verifly extract scraped.txt --out emails.json
verifly domain example.com --format json
verifly credits
verifly usage
~~~

## CI Exit Codes

- 0: command completed successfully.
- 1: invalid arguments, missing API key, or Verifly/API failure.

Use JSON output by default for AI agents. Use CSV output for spreadsheet, CRM, or mailing-list handoffs.
