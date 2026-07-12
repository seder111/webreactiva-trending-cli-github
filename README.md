# github-trending-cli

CLI to fetch and display trending repositories from [GitHub Trending](https://github.com/trending). No API key required — scrapes the public HTML with native `fetch` + Cheerio.

```
npx github-trending-cli --lang javascript --since weekly --limit 5
```

## Features

- Scrapes `github.com/trending` — no tokens, no API
- Three output formats: colored cards, compact table, raw JSON
- Filter by language and time period (daily / weekly / monthly)
- In-memory cache (5 min TTL) to avoid repeated requests
- Configurable timeout

## Install

```bash
# Global install (use as 'trending' command)
npm install -g github-trending-cli

# Or run directly
npx github-trending-cli
```

Requires **Node.js >= 22** (native fetch).

## Usage

```bash
# Default: top 10 repos today
trending

# Filter by language
trending --lang python

# Weekly trending, JavaScript
trending --lang javascript --since weekly

# Top 3, monthly
trending --limit 3 --since monthly

# JSON output (great for piping / cron)
trending --lang go --json
```

### Options

| Option                 | Description                                   | Default |
| ---------------------- | --------------------------------------------- | ------- |
| `-l, --lang <lang>`    | Language filter (e.g. `python`, `javascript`) | all     |
| `-s, --since <period>` | Period: `daily`, `weekly`, `monthly`          | `daily` |
| `-n, --limit <n>`      | Number of repos (1–50)                        | `10`    |
| `-t, --timeout <ms>`   | Request timeout                               | `15000` |
| `-j, --json`           | JSON output (no spinner, no colors)           | —       |
| `--table`              | Table format using cli-table3                 | —       |
| `-V, --version`        | Show version                                  | —       |
| `-h, --help`           | Show help                                     | —       |

## Output Formats

### Cards (default)

```
 1. user/repo
    ★ 18,622  +3,728 today
    ● TypeScript
    Description text here
    https://github.com/user/repo
```

### Table

```
#  Repository                  Language     Stars    +Period
1  user/repo                   ● TypeScript 18.6k    +3,728
2  user/repo                   ● Python     75.8k    +2,582
```

### JSON

```json
[
  {
    "rank": 1,
    "name": "user/repo",
    "description": "...",
    "language": "TypeScript",
    "totalStars": 18622,
    "periodStars": 3728,
    "periodLabel": "today",
    "url": "https://github.com/user/repo"
  }
]
```

## Use in cron

Save a daily snapshot as JSON and serve it on your website:

```bash
0 6 * * * cd /path/to/trending-cli && /path/to/node bin/trending.js --json > /var/www/html/trending.json
```

With language filter:

```bash
0 6 * * * cd /path/to/trending-cli && node bin/trending.js --lang python --json > /var/www/html/trending-python.json
15 6 * * * cd /path/to/trending-cli && node bin/trending.js --lang javascript --json > /var/www/html/trending-js.json
```

> **Note:** Cron runs in a minimal environment. If `node` is managed via `nvm`, use the full path from `which node`.

## Project Structure

```
src/
├── cli.js             # Commander options & orchestration
├── fetcher.js         # HTML scraping (fetch + cheerio)
├── formatter.js       # Card / table / JSON output
├── language-colors.js # Language → hex color mapping
└── cache.js           # In-memory TTL cache
bin/
└── trending.js        # Entry point
```

## How it works

GitHub doesn't provide a public API for trending data. The CLI scrapes `github.com/trending` HTML using native `fetch` and Cheerio, extracts repository information, and presents it in the requested format. Results are cached in memory for 5 minutes to avoid hitting GitHub on every invocation.

## License

MIT
