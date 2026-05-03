#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { generateMCP } = require('./generators/mcp');
const { generateA2A } = require('./generators/a2a');
const { generateAgentJson } = require('./generators/agent-json');

const program = new Command();

program
  .name('pickaxe-scaffold')
  .description('Generate MCP Server + A2A Agent + agent.json from one config. By Pickaxe Tools.')
  .version('0.1.0');

program
  .command('init')
  .description('Create a new agent project with agent.json spec')
  .argument('<name>', 'Agent name')
  .option('-d, --description <desc>', 'Agent description', '')
  .option('-o, --output <dir>', 'Output directory', '.')
  .action((name, options) => {
    const dir = path.join(options.output, name);
    fs.mkdirSync(dir, { recursive: true });
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });

    const spec = {
      name: name,
      version: '0.1.0',
      description: options.description || `${name} AI agent`,
      protocols: {
        mcp: { enabled: true, transport: 'stdio' },
        a2a: { enabled: true },
        agentJson: { enabled: true }
      },
      tools: [],
      capabilities: ['text-generation', 'tool-use'],
      author: '',
      license: 'Apache-2.0'
    };

    fs.writeFileSync(path.join(dir, 'agent.config.json'), JSON.stringify(spec, null, 2));
    console.log(`\n✅ Created ${name}/agent.config.json`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${name}`);
    console.log(`  Edit agent.config.json to add tools and capabilities`);
    console.log(`  npx agent-scaffold generate\n`);
  });

program
  .command('generate')
  .description('Generate MCP + A2A + agent.json from agent.config.json')
  .option('-c, --config <path>', 'Config file path', 'agent.config.json')
  .option('-o, --output <dir>', 'Output directory', '.')
  .option('--mcp-only', 'Generate MCP server only')
  .option('--a2a-only', 'Generate A2A agent only')
  .option('--agent-json-only', 'Generate agent.json only')
  .action((options) => {
    const configPath = path.resolve(options.config);
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Config not found: ${configPath}`);
      console.error(`Run 'agent-scaffold init <name>' first`);
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const outDir = path.resolve(options.output);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`\n🔨 Generating from ${config.name} v${config.version}...\n`);

    if (options.agentJsonOnly) {
      generateAgentJson(config, outDir);
    } else if (options.a2aOnly) {
      generateA2A(config, outDir);
    } else if (options.mcpOnly) {
      generateMCP(config, outDir);
    } else {
      // Generate all protocols
      const protocols = config.protocols || {};
      if (protocols.mcp?.enabled !== false) generateMCP(config, outDir);
      if (protocols.a2a?.enabled !== false) generateA2A(config, outDir);
      if (protocols.agentJson?.enabled !== false) generateAgentJson(config, outDir);
    }

    console.log(`\n✅ Generation complete!\n`);
  });

program
  .command('validate')
  .description('Validate an agent.config.json file')
  .argument('<config>', 'Config file path')
  .action((configPath) => {
    const resolved = path.resolve(configPath);
    if (!fs.existsSync(resolved)) {
      console.error(`❌ File not found: ${resolved}`);
      process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(resolved, 'utf8'));
    const errors = [];
    if (!config.name) errors.push('Missing required field: name');
    if (!config.version) errors.push('Missing required field: version');
    if (!config.description) errors.push('Missing required field: description');

    if (errors.length > 0) {
      console.error(`\n❌ Validation failed:`);
      errors.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }

    console.log(`\n✅ ${config.name} v${config.version} — Valid`);
    console.log(`   Protocols: ${Object.entries(config.protocols || {}).filter(([,v]) => v.enabled !== false).map(([k]) => k).join(', ') || 'none'}`);
    console.log(`   Tools: ${(config.tools || []).length}`);
    console.log(`   Capabilities: ${(config.capabilities || []).join(', ')}\n`);
  });

program.parse();
