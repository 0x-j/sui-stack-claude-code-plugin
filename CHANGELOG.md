# Changelog

All notable changes to the Sui Stack Developer Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-05

### Added

#### Skills (6 total)
- **sui-move-development** - Comprehensive Move contract development guide
  - Module structure and patterns
  - Object lifecycle management
  - Testing with test_scenario
  - Common design patterns
  - Examples: simple-nft.move, capability-pattern.move
  - Reference: sui-patterns.md

- **sui-cli-usage** - Essential Sui CLI commands and workflows
  - Network management
  - Key management
  - Object inspection
  - Package operations (build, test, publish, upgrade)
  - Transaction building

- **sui-typescript-sdk** - TypeScript SDK integration guide
  - SuiClient setup and configuration
  - Transaction building patterns
  - Query hooks and data fetching
  - Key management
  - Error handling

- **sui-wallet-integration** - dApp Kit and wallet connection
  - Provider setup for React/Next.js
  - ConnectButton and wallet hooks
  - Transaction signing patterns
  - Protected routes
  - Multi-wallet support

- **walrus-storage** - Decentralized storage with Walrus
  - Upload relay vs publisher patterns
  - Storage epochs and cost management
  - React integration examples
  - **Important**: Next.js client-side WASM compatibility warning
  - NFT integration patterns

- **seal-encryption** - Decentralized secrets management with Sui-based access control
  - Sui-based access control policies
  - Storage agnostic (Walrus, IPFS, onchain, offchain)
  - Symmetric and asymmetric encryption
  - Policy-based access management
  - Decentralized key management patterns
  - Private NFT and confidential data sharing examples

#### Commands (3 total)
- **init-dapp** - Initialize new Sui dApp project
  - Wraps `npm create @mysten/dapp`
  - Template selection (React, Next.js, Vue)
  - Framework-specific guidance
  - Environment setup

- **deploy-contract** - Interactive Move package deployment
  - Pre-deployment validation
  - Build and test checks
  - Network confirmation
  - Gas estimation
  - Deployment record keeping

- **test-move** - Run Move tests with analysis
  - Test filtering support
  - Coverage reporting
  - Gas profiling
  - Formatted output
  - Optimization recommendations

#### Agents (2 total)
- **move-contract-reviewer** - Security and optimization analysis
  - Security vulnerability detection
  - Gas optimization opportunities
  - Best practice compliance
  - Code quality review
  - Detailed report with severity levels

- **sui-integration-helper** - SDK integration for existing projects
  - Framework detection (React, Next.js, Vue)
  - Dependency installation
  - Provider configuration
  - Wallet connection setup
  - Example transaction implementation

#### Documentation
- Comprehensive README with installation, usage, and troubleshooting
- Settings template (.claude/sui-stack-dev.local.md.example)
- MIT License
- This changelog

### Documentation References
- Official Sui Documentation: https://docs.sui.io/
- Move Book: https://move-book.com/
- Sui TypeScript SDK: https://sdk.mystenlabs.com/sui
- dApp Kit: https://sdk.mystenlabs.com/dapp-kit
- Walrus: https://docs.wal.app/
- Seal: https://seal-docs.wal.app/

### Known Issues
- Some referenced documentation files not yet created (move-book.md, framework-apis.md, cli-commands.md, ptb-guide.md)
- These are optional enhancements and don't affect core functionality

### Notes
- Plugin defaults to testnet for safety
- All examples use latest SDK versions (@mysten/sui, @mysten/dapp-kit, @mysten/walrus, @mysten/seal)
- Designed to evolve with Sui stack updates

[0.1.0]: https://github.com/0x-j/sui-stack-claude-code-plugin/releases/tag/v0.1.0
