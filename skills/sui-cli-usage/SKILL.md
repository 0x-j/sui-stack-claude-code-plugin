---
name: Sui CLI Usage
description: This skill should be used when the user asks to "use Sui CLI", "sui client command", "deploy with sui", "check objects", "sui keytool", "switch network", "call Move function from CLI", or mentions sui command-line tools. Provides guidance for essential Sui CLI commands and workflows.
version: 0.1.0
---

# Sui CLI Usage

Provides expert guidance for using the Sui command-line interface (CLI) for development workflows, network management, object inspection, and contract interaction.

## Overview

The Sui CLI is the primary tool for interacting with Sui networks from the command line. It handles key management, network configuration, contract deployment, and transaction execution.

**Core commands:**
- `sui client` - Interact with Sui network
- `sui move` - Build, test, and publish Move packages
- `sui keytool` - Manage cryptographic keys
- `sui console` - Interactive Sui shell

## Installation

### Install Sui CLI

```bash
# Using Homebrew (macOS/Linux)
brew install sui

# Using cargo (any platform)
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui
```

### Verify Installation

```bash
sui --version
# Output: sui 1.x.x
```

## Network Management

### View Active Network

```bash
# Show current network configuration
sui client active-env

# List all configured networks
sui client envs
```

### Switch Networks

```bash
# Switch to testnet
sui client switch --env testnet

# Switch to mainnet
sui client switch --env mainnet

# Switch to devnet
sui client switch --env devnet

# Switch to local network
sui client switch --env localnet
```

### Add Custom Network

```bash
# Add custom RPC endpoint
sui client new-env --alias custom --rpc https://custom-rpc.example.com:443

# Switch to custom network
sui client switch --env custom
```

## Key Management

### Create New Address

```bash
# Generate new address (ed25519)
sui client new-address ed25519

# Generate new address (secp256k1)
sui client new-address secp256k1

# Generate new address (secp256r1)
sui client new-address secp256r1
```

### List Addresses

```bash
# Show all addresses in keystore
sui keytool list

# Show active address
sui client active-address
```

### Switch Active Address

```bash
# Switch to specific address
sui client switch --address 0x...
```

### Export/Import Keys

```bash
# Export private key
sui keytool export --key-identity 0x...

# Import private key from mnemonic
sui keytool import "word1 word2 ... word12" ed25519
```

## Getting SUI Tokens

### Request Testnet Tokens

```bash
# Request SUI on testnet (faucet)
sui client faucet

# Request tokens for specific address
sui client faucet --address 0x...
```

### Check Balance

```bash
# View gas objects and balances
sui client gas

# View all owned objects
sui client objects
```

## Object Inspection

### View Object Details

```bash
# Get object by ID
sui client object 0x...

# Get object with full content
sui client object 0x... --json
```

### Query Objects by Owner

```bash
# List objects owned by active address
sui client objects

# List objects owned by specific address
sui client objects --owner 0x...
```

### View Transaction

```bash
# Get transaction details
sui client tx-block <DIGEST>

# Get transaction with effects
sui client tx-block <DIGEST> --json
```

## Move Package Operations

### Build Package

```bash
# Build Move package in current directory
sui move build

# Build with specific path
sui move build --path /path/to/package

# Build with additional checks
sui move build --lint
```

### Test Package

```bash
# Run all tests
sui move test

# Run specific test
sui move test test_function_name

# Run with coverage
sui move test --coverage

# Run with gas profiling
sui move test --gas-profile
```

### Publish Package

```bash
# Publish to active network
sui client publish --gas-budget 100000000

# Publish with specific gas object
sui client publish --gas-budget 100000000 --gas 0x...

# Publish from specific path
sui client publish /path/to/package --gas-budget 100000000
```

**Important:** Save the package ID and upgrade capability from publish output.

### Upgrade Package

```bash
# Upgrade package (requires upgrade capability)
sui client upgrade --gas-budget 100000000 --upgrade-capability 0x...

# Upgrade with authorization
sui client upgrade --gas-budget 100000000 --upgrade-capability 0x... --authorize-upgrade
```

## Calling Move Functions

### Call Entry Function

```bash
# Call function with arguments
sui client call \
  --package 0xPACKAGE_ID \
  --module module_name \
  --function function_name \
  --args arg1 arg2 arg3 \
  --gas-budget 10000000

# Call with object arguments
sui client call \
  --package 0xPACKAGE_ID \
  --module my_module \
  --function transfer_item \
  --args 0xOBJECT_ID @0xRECIPIENT \
  --gas-budget 10000000
```

**Argument formats:**
- Object: `0x...` (object ID)
- Address: `@0x...` (prefix with @)
- Number: `100` (raw number)
- Bool: `true` or `false`
- String: `hello` (raw text)
- Vector: `[1,2,3]` (JSON array)

### Transfer Objects

```bash
# Transfer SUI to address
sui client transfer-sui \
  --to 0xRECIPIENT \
  --sui-coin-object-id 0xCOIN_ID \
  --gas-budget 1000000 \
  --amount 1000000000

# Transfer custom object
sui client transfer \
  --object-id 0xOBJECT_ID \
  --to 0xRECIPIENT \
  --gas-budget 1000000
```

### Merge and Split Coins

```bash
# Merge coins
sui client merge-coin \
  --primary-coin 0xCOIN1 \
  --coin-to-merge 0xCOIN2 \
  --gas-budget 1000000

# Split coin
sui client split-coin \
  --coin-id 0xCOIN_ID \
  --amounts 100000000 200000000 \
  --gas-budget 1000000
```

## Package Management

### View Package Details

```bash
# Get package info
sui client object 0xPACKAGE_ID

# Get package modules
sui client verify-source --package 0xPACKAGE_ID
```

### Verify Package Source

```bash
# Verify on-chain bytecode matches local source
sui client verify-source \
  --package-path /path/to/package \
  --on-chain-package 0xPACKAGE_ID
```

## Transaction Building (Advanced)

### Programmable Transaction Blocks (PTBs)

```bash
# Build transaction with multiple commands
sui client ptb \
  --move-call 0xPACKAGE::module::function @0xARG \
  --transfer-objects [Result(0)] @0xRECIPIENT \
  --gas-budget 10000000
```

**PTB Commands:**
- `--move-call` - Call Move function
- `--transfer-objects` - Transfer objects
- `--split-coins` - Split coins
- `--merge-coins` - Merge coins
- `--make-move-vec` - Create vector
- `--publish` - Publish package

### Gas Budget Guidelines

**Typical operations:**
- Simple transfers: 1,000,000 MIST (0.001 SUI)
- Function calls: 10,000,000 MIST (0.01 SUI)
- Package publish: 100,000,000 MIST (0.1 SUI)
- Complex operations: 1,000,000,000 MIST (1 SUI)

Always set gas budget higher than estimated cost to avoid transaction failures.

## Configuration Files

### Client Config Location

```bash
# Default: ~/.sui/sui_config/client.yaml
cat ~/.sui/sui_config/client.yaml
```

### Config Structure

```yaml
keystore:
  File: ~/.sui/sui_config/sui.keystore
envs:
  - alias: mainnet
    rpc: "https://fullnode.mainnet.sui.io:443"
  - alias: testnet
    rpc: "https://fullnode.testnet.sui.io:443"
active_env: testnet
active_address: "0x..."
```

## Common Workflows

### Deploy New Contract

```bash
# 1. Build package
cd my-package
sui move build

# 2. Run tests
sui move test

# 3. Switch to testnet
sui client switch --env testnet

# 4. Get testnet tokens
sui client faucet

# 5. Publish package
sui client publish --gas-budget 100000000

# 6. Save package ID from output
# Package ID: 0x...
```

### Interact with Deployed Contract

```bash
# 1. View package
sui client object 0xPACKAGE_ID

# 2. Call entry function
sui client call \
  --package 0xPACKAGE_ID \
  --module my_module \
  --function create_item \
  --args "Item Name" 100 \
  --gas-budget 10000000

# 3. Check created object
sui client objects

# 4. View object details
sui client object 0xNEW_OBJECT_ID
```

### Upgrade Package

```bash
# 1. Make code changes
# Edit Move files...

# 2. Build updated package
sui move build

# 3. Test changes
sui move test

# 4. Upgrade package
sui client upgrade \
  --upgrade-capability 0xUPGRADE_CAP_ID \
  --gas-budget 100000000

# 5. Note new package ID
# New Package ID: 0x...
```

## Debugging

### Dry Run Transaction

```bash
# Simulate without executing
sui client call \
  --package 0xPACKAGE_ID \
  --module module_name \
  --function function_name \
  --args arg1 \
  --gas-budget 10000000 \
  --dry-run
```

### View Gas Usage

```bash
# Get gas profiling for tests
sui move test --gas-profile

# View transaction gas usage
sui client tx-block <DIGEST> --json | jq '.effects.gasUsed'
```

### Check Node Connection

```bash
# Test RPC connection
sui client active-env

# Get node info
sui client chain-identifier
```

## Interactive Console

### Launch Console

```bash
# Start interactive Sui shell
sui console

# In console, you can:
# - Call functions interactively
# - Inspect objects
# - Build transactions
```

### Console Commands

```rust
// In sui console
let package = 0xPACKAGE_ID;
let module = "my_module";
call package module "function_name" [arg1, arg2];

// Transfer object
transfer object_id recipient;

// View object
show object_id;
```

## Additional Resources

### Reference Files

Detailed CLI documentation:

- **`references/cli-commands.md`** - Complete CLI command reference
- **`references/ptb-guide.md`** - Programmable Transaction Block patterns

### Official Documentation

- **Sui CLI Reference** - https://docs.sui.io/references/cli (add .md for markdown)
- **Getting Started** - https://docs.sui.io/guides/developer/getting-started
- **Client PTB** - https://docs.sui.io/guides/developer/sui-101/building-ptb

## Quick Reference

### Essential Commands

```bash
# Setup
sui client active-env          # Check network
sui client switch --env testnet # Switch network
sui client faucet              # Get testnet tokens
sui client gas                 # Check balance

# Development
sui move build                 # Build package
sui move test                  # Run tests
sui client publish --gas-budget 100000000  # Publish

# Interaction
sui client call --package PKG --module MOD --function FN --args ARGS --gas-budget GAS
sui client objects             # List owned objects
sui client object 0x...        # View object

# Keys
sui keytool list               # List addresses
sui client switch --address 0x...  # Switch address
sui client new-address ed25519     # Create address
```

### Gas Budget Quick Reference

- Transfer: 1,000,000 (0.001 SUI)
- Function call: 10,000,000 (0.01 SUI)
- Publish: 100,000,000 (0.1 SUI)
- Complex: 1,000,000,000 (1 SUI)

### Default Networks

- **Mainnet**: https://fullnode.mainnet.sui.io:443
- **Testnet**: https://fullnode.testnet.sui.io:443
- **Devnet**: https://fullnode.devnet.sui.io:443

---

For complete command reference and advanced patterns, consult the reference files and official documentation.
