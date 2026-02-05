---
name: deploy-contract
description: Interactively deploy a Move package to Sui network with pre-deployment checks
argument-hint: "[package-path]"
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
  - Glob
---

# Deploy Move Contract

Interactively guide the deployment of a Move package to a Sui network. This command performs pre-deployment checks, shows gas estimates, confirms network, and handles the publish process.

## What This Command Does

1. Locates the Move package (from argument or current directory)
2. Validates package structure and builds
3. Runs tests to ensure contract works
4. Checks network configuration
5. Verifies sufficient gas balance
6. Shows estimated costs
7. Publishes package with confirmation
8. Saves deployment info

## Instructions

### Step 1: Locate Package

If package path provided as argument, use it. Otherwise:

1. Check if current directory has `Move.toml`
2. If not, search for Move packages in subdirectories
3. If multiple found, ask user which to deploy
4. If none found, explain Move package structure and ask for path

### Step 2: Validate Package

**Check Move.toml exists:**

```bash
cat [PACKAGE_PATH]/Move.toml
```

**Verify basic structure:**
- Has `[package]` section with name
- Has `[dependencies]` with Sui framework
- Has `sources/` directory with `.move` files

**Read Move.toml to extract:**
- Package name
- Dependencies
- Named addresses

### Step 3: Build Package

Run build to check for compilation errors:

```bash
cd [PACKAGE_PATH]
sui move build
```

**If build fails:**
- Show error messages
- Suggest user fix compilation errors
- Abort deployment

**If build succeeds:**
- Note: Build successful ✓
- Proceed to testing

### Step 4: Run Tests

Execute test suite:

```bash
sui move test
```

**If tests fail:**
- Show which tests failed
- Ask user: "Tests failed. Deploy anyway? (Not recommended)"
- If no, abort deployment
- If yes, proceed with warning

**If tests pass:**
- Note: All tests passed ✓
- Proceed to network check

### Step 5: Check Network Configuration

Get active network:

```bash
sui client active-env
```

**Show network to user and confirm:**
- "About to deploy to [NETWORK] (testnet/mainnet/devnet)"
- "Is this correct? [Yes/No]"

**If incorrect network:**
- Show available networks: `sui client envs`
- Ask which network to use
- Switch: `sui client switch --env [NETWORK]`

**Network recommendations:**
- Testnet: Default for development
- Mainnet: For production (warn about real costs)
- Devnet: For experimental features (unstable)

### Step 6: Check Gas Balance

Get gas objects:

```bash
sui client gas
```

**Check if sufficient balance:**
- Parse output for available SUI
- Need at least 0.1 SUI for deployment (100,000,000 MIST)

**If insufficient balance:**
- Show current balance
- If testnet: "Get tokens with: sui client faucet"
- If mainnet: "Need to acquire SUI from exchange"
- Ask: "Continue anyway? [Yes/No]"

### Step 7: Estimate and Confirm

**Show deployment summary:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Deployment Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Package:     [PACKAGE_NAME]
Path:        [PACKAGE_PATH]
Network:     [NETWORK]
Gas Budget:  100,000,000 MIST (0.1 SUI)
Est. Cost:   ~50,000,000 MIST (0.05 SUI)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Ask for final confirmation:**
- "Deploy package? [Yes/No]"

**If no:** Abort

### Step 8: Deploy Package

Execute publish command:

```bash
cd [PACKAGE_PATH]
sui client publish --gas-budget 100000000
```

**Monitor output for:**
- Transaction digest
- Package ID (0x...)
- Upgrade capability object ID
- Published objects
- Gas used

### Step 9: Parse and Save Results

**Extract key information from output:**
- Package ID: `0x...`
- Upgrade Cap: `0x...`
- Transaction Digest: `...`
- Gas Used: `... MIST`

**Create deployment record:**

Save to `[PACKAGE_PATH]/deployment.json`:

```json
{
  "network": "testnet",
  "packageId": "0x...",
  "upgradeCapId": "0x...",
  "transactionDigest": "...",
  "deployedAt": "2024-01-15T10:30:00Z",
  "gasUsed": "45000000"
}
```

### Step 10: Provide Next Steps

**Show success message:**

```
✅ Package deployed successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Deployment Info
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Package ID:      0x...
Upgrade Cap:     0x...
Transaction:     [EXPLORER_URL]
Gas Used:        45,000,000 MIST (0.045 SUI)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Next steps:**

1. **Update Move.toml** with published address:
   ```toml
   [addresses]
   package_name = "0x..."
   ```

2. **Save upgrade capability** - Transfer to secure address:
   ```bash
   sui client transfer --object-id 0x... --to 0x...
   ```

3. **Test deployed contract:**
   ```bash
   sui client call --package 0x... --module MODULE --function FUNCTION
   ```

4. **Share package ID** with frontend or users

5. **View on explorer:**
   - Testnet: https://suiscan.xyz/testnet/object/0x...
   - Mainnet: https://suiscan.xyz/mainnet/object/0x...

## Advanced Options

### Custom Gas Budget

If user needs different gas budget:

```bash
sui client publish --gas-budget [AMOUNT]
```

Typical ranges:
- Simple contracts: 50,000,000 MIST
- Complex contracts: 200,000,000 MIST
- Very large: 500,000,000 MIST

### Specific Gas Object

If user has preferred gas object:

```bash
sui client publish --gas-budget 100000000 --gas 0xGAS_OBJECT_ID
```

### With Unpublished Dependencies

If package depends on other local packages:

```bash
sui client publish --gas-budget 100000000 --with-unpublished-dependencies
```

## Error Handling

### Build Errors

**"address X not found"**
- Check Move.toml has all required addresses
- Add missing addresses to `[addresses]` section

**"conflicting names for module"**
- Ensure module names are unique
- Check for duplicate module declarations

### Publish Errors

**"Insufficient gas"**
- Increase gas budget
- Get more SUI tokens

**"Package verification failed"**
- Check Sui CLI version matches network
- Update Sui dependencies in Move.toml

**"Transaction timeout"**
- Network congestion
- Retry with higher gas budget

## Examples

### Basic Usage

```
User: /sui-stack-dev:deploy-contract

Claude: Finds Move.toml in current directory
Claude: Builds, tests, checks network
Claude: Shows summary, asks confirmation
Claude: Deploys and saves results
```

### With Path Argument

```
User: /sui-stack-dev:deploy-contract ./contracts/my-nft

Claude: Uses specified path
Claude: Runs full deployment workflow
```

### Multiple Packages

```
User: /sui-stack-dev:deploy-contract

Claude: Finds multiple Move.toml files
Claude: Lists options, asks which to deploy
Claude: Proceeds with selected package
```

## Best Practices

**Before Deployment:**
- Always run tests (`sui move test`)
- Review code for security issues
- Check gas costs
- Verify correct network

**After Deployment:**
- Save package ID in Move.toml
- Secure upgrade capability
- Test deployed functions
- Document deployment in README

**Mainnet Deployment:**
- Test thoroughly on testnet first
- Review code by external auditor if handling value
- Use higher gas budget for safety
- Double-check network before confirming

## Settings Integration

If project has `.claude/sui-stack-dev.local.md`, read network preference:

```yaml
---
network: testnet
---
```

Use as default but allow user to override.

## Documentation References

- **Publishing Packages**: https://docs.sui.io/guides/developer/first-app/publish.md
- **Sui Client Reference**: https://docs.sui.io/references/cli/client.md
- **Upgrade Packages**: https://docs.sui.io/guides/developer/advanced/upgrade-packages.md

---

Focus on safe, guided deployment with proper validation at each step. Provide clear feedback and next steps.
