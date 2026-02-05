---
name: test-move
description: Run Move tests with filtering, coverage, and gas profiling options
argument-hint: "[test-filter] [--coverage] [--gas-profile]"
allowed-tools:
  - Bash
  - Read
  - Glob
---

# Test Move Contracts

Run Move test suite with options for filtering specific tests, coverage analysis, and gas profiling. Provides formatted output and actionable insights.

## What This Command Does

1. Locates Move package
2. Parses command arguments for filters and options
3. Runs `sui move test` with appropriate flags
4. Formats and presents results
5. Provides coverage or gas analysis if requested

## Instructions

### Step 1: Locate Package

Check for Move.toml:

```bash
# Current directory
if [ -f "Move.toml" ]; then
  PACKAGE_PATH="."
# Or find in subdirectories
else
  find . -name "Move.toml" -maxdepth 3
fi
```

If multiple packages found, ask user which to test.

### Step 2: Parse Arguments

Extract from arguments:

**Test filter** (optional):
- Specific test function name
- Module name pattern
- Example: `test_create`, `my_module::test_*`

**Flags:**
- `--coverage` or `-c`: Enable coverage reporting
- `--gas-profile` or `-g`: Enable gas profiling
- Both can be combined

### Step 3: Run Basic Tests

**Without filter:**

```bash
cd [PACKAGE_PATH]
sui move test
```

**With filter:**

```bash
sui move test [FILTER]
```

Examples:
- `sui move test test_create_nft` - Run specific test
- `sui move test my_module` - Run all tests in module

### Step 4: Format Test Results

**Parse output for:**
- Total tests run
- Passed tests
- Failed tests
- Test names and durations

**Present formatted summary:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Test Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Tests:    15
Passed:         14 ✓
Failed:         1 ✗
Duration:       2.3s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If all tests pass:**
```
✅ All tests passed!
```

**If tests fail:**
```
❌ Tests failed

Failed:
  • test_invalid_input (my_module)
    Expected: 0, Got: 1

Review failures and fix before deploying.
```

### Step 5: Coverage Analysis

If `--coverage` flag provided:

```bash
sui move test --coverage
```

**Parse coverage output:**
- Lines covered/total
- Coverage percentage by module
- Uncovered lines

**Present coverage summary:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Coverage Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall:        87.5% (175/200 lines)

By Module:
  my_module:    92.3% (60/65 lines)
  helpers:      78.9% (45/57 lines)
  utils:        89.7% (70/78 lines)

Uncovered Lines:
  my_module.move:45-47
  helpers.move:23
  helpers.move:89-92

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Provide recommendations:**
- If coverage < 80%: "Consider adding more tests"
- If coverage > 90%: "Excellent coverage! ✓"
- List uncovered critical paths (if any)

### Step 6: Gas Profiling

If `--gas-profile` flag provided:

```bash
sui move test --gas-profile
```

**Parse gas profile:**
- Gas used per test
- Most expensive operations
- Gas by module/function

**Present gas analysis:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⛽ Gas Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Gas:      1,245,890 MIST

Most Expensive Tests:
  1. test_create_nft         245,678 MIST
  2. test_batch_transfer     189,234 MIST
  3. test_marketplace_buy     95,432 MIST

By Operation:
  Object creation:    456,789 MIST (36.7%)
  Transfer:          234,567 MIST (18.8%)
  Dynamic fields:    178,234 MIST (14.3%)
  Other:            376,300 MIST (30.2%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Provide gas optimization tips:**
- If creating many objects: "Consider batching operations"
- If high dynamic field usage: "Consider struct fields instead"
- If expensive transfers: "Use references where possible"

### Step 7: Combined Analysis

If both `--coverage` and `--gas-profile` provided:

Run tests once with both flags:

```bash
sui move test --coverage --gas-profile
```

Present both reports as shown above.

### Step 8: Next Steps Guidance

**If tests pass:**

1. **Ready to deploy:**
   ```bash
   /sui-stack-dev:deploy-contract
   ```

2. **Improve coverage** (if < 90%):
   - Add tests for uncovered lines
   - Test edge cases and error paths

3. **Optimize gas** (if high costs):
   - Review expensive operations
   - Consider algorithmic improvements

**If tests fail:**

1. **Fix failing tests** - Review error messages
2. **Re-run tests** - Verify fixes
3. **Add regression tests** - Prevent future failures

## Advanced Options

### Run Specific Test

```bash
sui move test test_function_name
```

### Run Tests in Specific Module

```bash
sui move test module_name::
```

### Test with Additional Output

```bash
sui move test --verbose
```

### Test with Compute Budget

```bash
sui move test --gas-limit 100000000
```

### Filter by Pattern

```bash
# All tests containing "transfer"
sui move test transfer

# All tests starting with "test_create"
sui move test test_create*
```

## Error Handling

### Build Errors Before Tests

**"address not found"**
- Check Move.toml addresses
- Ensure dependencies are correct

**"module not found"**
- Verify module paths
- Check imports in test files

### Test Runtime Errors

**"assertion failed"**
- Test logic incorrect
- Expected vs actual mismatch
- Review test and implementation

**"abort"**
- Function aborted with error code
- Check error constants in module
- Verify test inputs

**"out of gas"**
- Increase gas limit with --gas-limit
- Optimize expensive operations

### Coverage/Profile Errors

**"coverage not available"**
- Ensure Move.toml has coverage enabled
- Update Sui CLI version

**"gas profiling failed"**
- Check Sui CLI supports gas profiling
- Update to latest version

## Examples

### Basic Test Run

```
User: /sui-stack-dev:test-move

Claude: Locates Move package
Claude: Runs all tests
Claude: Shows formatted results
```

### Test with Coverage

```
User: /sui-stack-dev:test-move --coverage

Claude: Runs tests with coverage
Claude: Shows test results
Claude: Shows coverage report
```

### Test Specific Function

```
User: /sui-stack-dev:test-move test_create_nft

Claude: Runs only test_create_nft test
Claude: Shows result
```

### Full Analysis

```
User: /sui-stack-dev:test-move --coverage --gas-profile

Claude: Runs tests with both flags
Claude: Shows test results
Claude: Shows coverage report
Claude: Shows gas profile
Claude: Provides optimization recommendations
```

## Best Practices

**Testing Workflow:**

1. Run tests frequently during development
2. Aim for >90% coverage
3. Profile gas for expensive operations
4. Test error cases with `#[expected_failure]`
5. Use test scenarios for multi-transaction flows

**Before Deployment:**

```bash
# Full validation
/sui-stack-dev:test-move --coverage --gas-profile

# Ensure all pass and coverage is good
# Then deploy
```

**Test Organization:**

- Group related tests in `#[test_only]` modules
- Use descriptive test names
- Document test scenarios
- Test both success and failure paths

## Integration with Settings

Read project settings for test preferences:

```yaml
---
test_coverage_threshold: 90
gas_budget_limit: 100000000
---
```

Use these as defaults and warnings.

## Output Formatting

**Success (all tests pass):**
- Green checkmarks ✓
- Summary statistics
- Quick "ready to deploy" message

**Failure (tests fail):**
- Red X marks ✗
- Clear error messages
- Actionable fix suggestions

**Warnings:**
- Yellow warnings for low coverage
- Gas optimization suggestions
- Uncovered critical paths

## Documentation References

- **Testing Move**: https://docs.sui.io/guides/developer/first-app/write-tests.md
- **Move Testing Framework**: https://move-book.com/reference/testing.html
- **Test Scenarios**: https://docs.sui.io/references/framework/sui-framework/test-scenario.md

---

Focus on clear, actionable test results with helpful formatting. Guide users to fix issues or optimize based on analysis.
