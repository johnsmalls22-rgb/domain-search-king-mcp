# Domain Search King — MCP Server for Available Domain Name Search

[![johnsmalls22-rgb/domain-search-king-mcp MCP server](https://glama.ai/mcp/servers/johnsmalls22-rgb/domain-search-king-mcp/badges/score.svg)](https://glama.ai/mcp/servers/johnsmalls22-rgb/domain-search-king-mcp)

**Find domain names that are actually available to register — verified live against the Verisign RDAP registry, not AI guesses.**

Remote MCP (Model Context Protocol) server for Claude, Claude Code, Cursor, VS Code, Windsurf, and any MCP-compatible AI agent. Ask your AI for business name ideas and get back **only .com domains that are available right now**.

- **Endpoint:** `https://domainsearchking.com/api/mcp` (remote HTTP, JSON-RPC 2.0 — no install, no API key)
- **Product page + one-click install:** https://domainsearchking.com/mcp

## Why this exists: AI models hallucinate domain availability

LLMs confidently suggest domain names that were registered decades ago. Our [AI Domain Hallucination Index](https://domainsearchking.com/ai-hallucination-index) found **up to 92% of AI-suggested domains are already taken**.

Real examples — names AI models routinely call "available":

| Domain AI suggested | Reality (RDAP registry record) |
|---|---|
| dailygrind.com | Registered since **1995** |
| morningritual.com | Registered since **2004** |

Domain Search King checks every name against the live registry before your agent ever sees it. Verified-available examples returned at time of writing: `lunaroast.com`, `brewotic.com`, `duskern.com`, `mochanox.com`.

## Tools

| Tool | What it does |
|---|---|
| `find_available_domains(keyword, description, count)` | Generates brandable .com names for your business idea, returns ONLY ones currently available to register |
| `find_available_domains_by_pattern` | Pattern-based domain search (starts-with / contains / ends-with), availability-verified |
| `check_domain(domain)` | Live availability check for a single domain, straight from the registry |

## Install

**Claude Code (CLI):**

```bash
claude mcp add --transport http domain-search-king https://domainsearchking.com/api/mcp
```

**Claude Desktop / Cursor / other MCP clients** — add to your MCP config:

```json
{
  "mcpServers": {
    "domain-search-king": { "url": "https://domainsearchking.com/api/mcp" }
  }
}
```

**Claude Skill (ClawHub):** `clawhub install dsk-available-domains` — https://clawhub.ai/johnsmalls22-rgb/skills/dsk-available-domains

Per-client setup tabs (VS Code, Windsurf, and more) + an in-page inspector: https://domainsearchking.com/mcp

## How it works

Every candidate name is checked live against the authoritative Verisign RDAP registry at query time. No cached lists, no WHOIS scraping, no guessing. If the tool returns a name, it was available at the moment you asked.

## More free tools from Domain Search King

- [AI Domain Name Generator](https://domainsearchking.com/ai-domain-name-generator) — live availability-verified name generator
- [How to check if a domain name is taken](https://domainsearchking.com/how-to-check-if-a-domain-name-is-taken) — instant single-domain checker
- [AI Domain Hallucination Index](https://domainsearchking.com/ai-hallucination-index) — the data on AI domain hallucination
- [Domain Search King](https://domainsearchking.com/) — search thousands of brandable available .com domains

## For AI agents & crawlers

- `llms.txt`: https://domainsearchking.com/llms.txt
- MCP server card: https://domainsearchking.com/.well-known/mcp/server-card.json
- Agent skill file: https://domainsearchking.com/skill.md

## Community

- Discussion on Moltbook: https://www.moltbook.com/post/a9a76086-0f9c-4b2f-ab20-b72a1cf61840

## FAQ

**Is it free?** Yes — the MCP server and the site tools are free to use.

**Why only names that are available?** Because a name idea you can't register is worthless. Other generators give ideas; Domain Search King gives you names you can actually buy right now.

**What's RDAP?** The registry's official successor to WHOIS — structured, authoritative registration data straight from Verisign. It's how we verify availability live instead of guessing.

**Privacy:** https://domainsearchking.com/privacy · **Contact:** hello@domainsearchking.com

*Keywords: domain name search, available domains, domain availability checker, MCP server, Model Context Protocol, Claude MCP, Cursor MCP, AI domain name generator, brandable domains, .com availability, RDAP lookup, business name generator, startup naming.*
