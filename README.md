# pickaxe-scaffold

**Generate MCP Server + A2A Agent + agent.json from one config.**

One config → three protocols. Stop writing boilerplate for every agent protocol.

```bash
npx pickaxe-scaffold init my-agent
```

## Why?

AI agent protocols are fragmenting:
- **MCP** (Anthropic) — tool connectivity
- **A2A** (Google) — agent-to-agent communication
- **agent.json** — universal agent manifest

Each requires different code, different schemas, different boilerplate. `agent-scaffold` generates all three from a single config file.

## Install

```bash
# Use directly with npx (no install needed)
npx github:HOTAgithub/agent-scaffold init my-agent
```

Or clone:
```bash
git clone https://github.com/HOTAgithub/agent-scaffold.git
cd agent-scaffold && npm install
node src/cli.js init my-agent
```

## Quick Start

```bash
# 1. Create a new agent project
agent-scaffold init my-agent --description "My awesome agent"

# 2. Edit the config
cd my-agent
# Edit agent.config.json to add your tools

# 3. Generate all protocols
agent-scaffold generate
```

Output:
```
my-agent/
├── agent.config.json    # Your single source of truth
├── agent.json           # Universal agent manifest
├── mcp/
│   ├── server.js        # MCP Server (stdio transport)
│   ├── package.json
│   └── README.md
└── a2a/
    ├── agent-card.json  # A2A Agent Card
    ├── handler.js       # A2A Task handler (Express)
    ├── package.json
    └── README.md
```

## Commands

### `init <name>`
Create a new agent project with `agent.config.json`.

```bash
agent-scaffold init my-agent -d "Does cool stuff"
```

### `generate`
Generate MCP + A2A + agent.json from config.

```bash
agent-scaffold generate                    # All protocols
agent-scaffold generate --mcp-only         # MCP only
agent-scaffold generate --a2a-only         # A2A only
agent-scaffold generate --agent-json-only  # agent.json only
```

### `validate <config>`
Validate an agent config file.

```bash
agent-scaffold validate agent.config.json
```

## Config File (agent.config.json)

```json
{
  "name": "my-agent",
  "version": "1.0.0",
  "description": "What this agent does",
  "protocols": {
    "mcp": { "enabled": true, "transport": "stdio" },
    "a2a": { "enabled": true },
    "agentJson": { "enabled": true }
  },
  "tools": [
    {
      "name": "search",
      "description": "Search the web",
      "parameters": {
        "type": "object",
        "properties": {
          "query": { "type": "string", "description": "Search query" }
        }
      }
    }
  ],
  "capabilities": ["text-generation", "tool-use"]
}
```

## Related

- [agent.json spec](https://github.com/HOTAgithub/agent-json) — Universal agent manifest format
- [AQG (Agent Quality Graph)](https://datatracker.ietf.org/doc/draft-hori-agent-quality-graph/) — PageRank for agents (IETF Draft)
- [MCP](https://modelcontextprotocol.io/) — Model Context Protocol by Anthropic
- [A2A](https://github.com/a2aproject/A2A) — Agent-to-Agent Protocol by Google

## License

Apache-2.0
