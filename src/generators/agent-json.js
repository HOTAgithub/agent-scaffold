/**
 * agent.json Generator
 * Generates standardized agent.json manifest from agent config
 */

const fs = require('fs');
const path = require('path');

function generateAgentJson(config, outDir) {
  const tools = (config.tools || []).map(t => {
    if (typeof t === 'string') return { name: t, description: `${t} tool` };
    return { name: t.name, description: t.description || `${t.name} tool` };
  });

  // Build agent.json following the agent-json spec v0.1
  const agentJson = {
    // Required fields (agent-json spec)
    name: config.name,
    description: config.description,

    // Recommended fields
    version: config.version || '0.1.0',
    schema_version: '0.1.0',

    // Agent metadata
    author: config.author || '',
    license: config.license || 'Apache-2.0',
    homepage: config.homepage || '',
    repository: config.repository || '',

    // Capabilities
    capabilities: config.capabilities || ['text-generation', 'tool-use'],

    // Tools this agent provides
    tools: tools.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.parameters || { type: 'object', properties: {} }
    })),

    // Protocol endpoints
    endpoints: {},
    // Connection info for different protocols
    connections: {}
  };

  // Add MCP endpoint if enabled
  const protocols = config.protocols || {};
  if (protocols.mcp?.enabled !== false) {
    agentJson.endpoints.mcp = {
      transport: protocols.mcp?.transport || 'stdio',
      command: 'node',
      args: ['mcp/server.js']
    };
    agentJson.connections.mcp = {
      type: 'mcp',
      transport: protocols.mcp?.transport || 'stdio'
    };
  }

  // Add A2A endpoint if enabled
  if (protocols.a2a?.enabled !== false) {
    agentJson.endpoints.a2a = {
      url: `http://localhost:${protocols.a2a?.port || 3000}`,
      card_path: '/.well-known/agent-card.json'
    };
    agentJson.connections.a2a = {
      type: 'a2a',
      url: `http://localhost:${protocols.a2a?.port || 3000}`
    };
  }

  // Add quality metadata (AQG integration)
  agentJson.quality = {
    rating: null,
    trust_score: null,
    verified: false,
    last_evaluated: null
  };

  // Add runtime requirements
  agentJson.runtime = {
    language: 'javascript',
    runtime: 'node >= 18.0.0',
    memory: '256m',
    timeout: '30s'
  };

  // Write agent.json
  fs.writeFileSync(
    path.join(outDir, 'agent.json'),
    JSON.stringify(agentJson, null, 2)
  );

  console.log(`  📦 agent.json → ${outDir}/agent.json`);
  console.log(`     name: ${agentJson.name}`);
  console.log(`     version: ${agentJson.version}`);
  console.log(`     tools: ${agentJson.tools.length}`);
  console.log(`     protocols: ${Object.keys(agentJson.endpoints).join(', ')}`);
}

module.exports = { generateAgentJson };
