# Sui Stack Developer Plugin

A comprehensive Claude Code plugin for building on the Sui blockchain ecosystem. Provides expert guidance, best practices, and tooling for the entire Sui stack.

## Features

### 📚 Expert Skills

Six comprehensive skills covering the complete Sui development stack:

- **Sui Move Development** - Smart contract development, testing, and patterns
- **Sui CLI Usage** - Command-line workflows and network management
- **Sui TypeScript SDK** - Transaction building and chain interaction
- **Sui Wallet Integration** - dApp Kit and wallet connection patterns
- **Walrus Storage** - Decentralized storage layer usage
- **Seal Secrets Management** - Decentralized secrets management with Sui-based access control

### 🔧 Commands

Quick-start commands for common workflows:

- `/sui-stack-dev:init-dapp` - Scaffold new Sui dApp project
- `/sui-stack-dev:deploy-contract` - Interactive contract deployment
- `/sui-stack-dev:test-move` - Run Move tests with filtering and coverage

### 🤖 Agents

Specialized agents for code analysis and project setup:

- **move-contract-reviewer** - Security, gas optimization, and best practice analysis
- **sui-integration-helper** - Integrate Sui into existing projects

## Installation

### From Marketplace (Recommended)

First, add the Sui Stack marketplace:

```bash
/plugin marketplace add 0x-j/sui-stack-claude-code-plugin
```

Then install the plugin:

```bash
/plugin install sui-stack-dev@sui-stack-plugins
```

Or combine both steps by adding the marketplace URL directly:

```bash
/plugin marketplace add https://github.com/0x-j/sui-stack-claude-code-plugin
/plugin install sui-stack-dev@sui-stack-plugins
```

## Prerequisites

- **Sui CLI** - Install from https://docs.sui.io/guides/developer/getting-started/sui-install
- **Node.js** (v18+) - For TypeScript SDK and dApp development
- **npm or pnpm** - Package manager

## Context Usage & Memory Footprint

### How the Plugin Uses Context

This plugin is designed to be **context-efficient** through lazy-loading:

**Always in Context (Minimal):**

- Plugin metadata (~100 words)
- Skill descriptions only (~600 words for all 6 skills)
- Command names and descriptions
- Agent trigger patterns

**Loaded On-Demand (When Needed):**

- Full skill content (~2,000 words each)
- Command instructions
- Agent system prompts

### Memory Impact

Even though this plugin contains 6 comprehensive skills, **only relevant content loads into context**:

| Scenario                 | Context Used | Example                               |
| ------------------------ | ------------ | ------------------------------------- |
| No Sui questions asked   | ~700 words   | Plugin metadata + descriptions        |
| Ask about Move contracts | ~2,700 words | Metadata + sui-move-development skill |
| Ask about CLI + Wallet   | ~4,700 words | Metadata + 2 skills                   |
| Use a command            | ~1,500 words | Command instructions only             |
| Agent triggered          | ~2,000 words | Agent system prompt only              |

**Bottom line:** Installing the full plugin doesn't mean everything loads at once. Claude intelligently loads only what's relevant to your current question.

### When Skills Activate

Skills automatically activate based on your questions:

```
You: "How do I write a Move contract?"
→ sui-move-development loads

You: "Deploy my contract with Sui CLI"
→ sui-cli-usage loads

You: "Connect wallet in my React app"
→ sui-wallet-integration loads

You: "Upload files to Walrus"
→ walrus-storage loads

You: "Manage secrets with Seal"
→ seal-encryption loads
```

Multiple skills can load if your question spans multiple areas.

## Configuration

Create `.claude/sui-stack-dev.local.md` in your project for custom settings:

```yaml
---
network: testnet
rpc_endpoint: https://fullnode.testnet.sui.io:443
active_address: 0x...
gas_budget: 10000000
walrus_enabled: true
walrus_endpoint: https://testnet-publisher.walrus.space
explorer: suiscan
---
# Project Notes

Add project-specific notes, deployed contract addresses, and configuration details here.
```

### Settings Reference

**Required:**

- `network` - Network to use (mainnet, testnet, devnet)
- `rpc_endpoint` - Sui RPC endpoint URL
- `active_address` - Default address for transactions
- `gas_budget` - Default gas budget in MIST

**Optional:**

- `walrus_enabled` - Enable Walrus features (true/false)
- `walrus_endpoint` - Walrus publisher endpoint
- `explorer` - Preferred block explorer (suiscan, suivision)

## Usage

### Skills (Automatic Activation)

Skills activate automatically based on your queries:

```
You: "How do I write a Move contract for an NFT?"
→ Activates sui-move-development skill

You: "How to connect a wallet in my React app?"
→ Activates sui-wallet-integration skill

You: "Upload files to Walrus"
→ Activates walrus-storage skill
```

### Commands (Explicit Invocation)

Use slash commands for specific actions:

```bash
# Create new dApp
/sui-stack-dev:init-dapp

# Deploy Move package
/sui-stack-dev:deploy-contract

# Run tests
/sui-stack-dev:test-move
```

### Agents (Proactive or On-Demand)

Agents work autonomously on complex tasks:

```
You: "Review my Move contract for security issues"
→ Launches move-contract-reviewer agent

You: "Add Sui SDK to my Next.js app"
→ Launches sui-integration-helper agent
```

## Documentation References

This plugin leverages official documentation:

- **Sui Documentation** - https://docs.sui.io/
- **Move Book** - https://move-book.com/
- **Sui TypeScript SDK** - https://sdk.mystenlabs.com/sui
- **dApp Kit** - https://sdk.mystenlabs.com/dapp-kit
- **Walrus Documentation** - https://docs.wal.app/
- **Walrus SDK** - https://sdk.mystenlabs.com/walrus
- **Seal Documentation** - https://seal-docs.wal.app/
- **Seal SDK** - https://sdk.mystenlabs.com/seal

## Example Workflows

### Starting a New dApp

```bash
# Initialize project
/sui-stack-dev:init-dapp

# Follow prompts to choose template (React, Next.js, Vue)
# Plugin provides guidance on wallet setup and SDK usage
```

### Deploying a Move Contract

```bash
# Navigate to your Move package
cd my-move-package

# Deploy interactively
/sui-stack-dev:deploy-contract

# Review contract before deployment
# Plugin shows gas estimates and confirms network
```

### Integrating Walrus Storage

```
You: "How do I upload files to Walrus from my React app?"

Claude:
- Activates walrus-storage skill
- Explains upload relay vs publisher approaches
- Warns about Next.js client-side WASM issues
- Provides code examples from local samples
- References Walrus SDK documentation
```

## Best Practices Highlights

### Move Development

- Use resource types for owned objects
- Test with `sui move test`
- Follow module naming conventions from Move Book

### TypeScript SDK

- Use `@mysten/sui` latest version
- Follow transaction builder patterns
- Handle errors gracefully

### Wallet Integration

- Use dApp Kit for standardized wallet connection
- Support multiple wallet providers automatically
- Test on testnet before mainnet

### Walrus Storage

- **Client-side apps**: Use upload relay (user pays storage)
- **Server-side apps**: Use publisher (app pays storage)
- **Next.js**: Avoid Walrus SDK on client-side due to WASM issues
- Use Vite for client-side upload relay implementations

### Seal Secrets Management

- Use Seal for decentralized secrets management with Sui-based access control
- Secure sensitive data on Walrus, onchain, or any offchain storage
- Define and validate access policies on Sui
- Key management and policy enforcement best practices

## Roadmap & Future Features

This plugin is actively evolving with the Sui ecosystem. Planned features and enhancements:

### 🔄 Coming Soon (v0.2.0)

- DeepBook Integration
- Nautilus Support
- Custom Indexer Development

### 📋 Community Requested

Want a feature added? Open an issue or submit a PR!

## Troubleshooting

### Plugin Not Loading

Ensure plugin is in the correct location:

- Project: `.claude-plugin/sui-stack-dev/`
- Global: `~/.claude/plugins/sui-stack-dev/`

Verify `plugin.json` is at `.claude-plugin/plugin.json`

### SSH Key Required for Installation

The plugin installation uses `git clone` with SSH under the hood, so you need to:

1. Set up SSH keys locally
2. Add the SSH key to your GitHub account

Follow GitHub's guide: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

Without proper SSH setup, the installation will fail during the git clone step.

### Skills Not Activating

Check that your query includes relevant keywords:

- Move, contract, smart contract
- CLI, command line, sui client
- SDK, TypeScript, transaction
- Wallet, dApp, frontend
- Walrus, storage, upload
- Seal, encrypt, decrypt

### Commands Not Found

Ensure plugin is enabled in Claude Code settings:

```bash
cc plugins list
cc plugins enable sui-stack-dev
```

## Version History

### 0.1.0 (Initial Release)

- Six comprehensive skills covering Sui stack
- Three essential commands (init, deploy, test)
- Two specialized agents (reviewer, integration helper)
- Project settings support
- Documentation references

## License

MIT License - See LICENSE file for details

## Support

- **Issues**: https://github.com/0x-j/sui-stack-claude-code-plugin/issues
- **Sui Discord**: https://discord.gg/sui
- **Documentation**: https://docs.sui.io/

---

Built with ❤️ for the Sui developer community
