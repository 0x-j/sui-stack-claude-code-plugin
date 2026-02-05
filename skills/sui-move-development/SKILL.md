---
name: Sui Move Development
description: This skill should be used when the user asks to "write a Move contract", "create a Sui Move module", "how to test Move code", "Move syntax", "Sui smart contract", "Move resources", "Move generics", "deploy Move package", or mentions Move-specific concepts like abilities, objects, or transfer policies. Provides comprehensive guidance for developing smart contracts on Sui using the Move programming language.
version: 0.1.0
---

# Sui Move Development

Provides expert guidance for developing smart contracts on Sui using the Move programming language. This skill covers Move syntax, Sui-specific patterns, module structure, testing, and deployment workflows.

## Overview

Sui Move is a variant of the Move programming language designed specifically for the Sui blockchain. It emphasizes safety, composability, and expressiveness for defining digital assets and their behavior.

**Key concepts:**
- **Objects** - The fundamental unit of storage on Sui, owned by addresses or shared
- **Abilities** - Type properties (copy, drop, store, key) that control how types can be used
- **Generics** - Parameterized types for reusable, type-safe code
- **One-time witnesses** - Pattern for creating unique types for initialization
- **Transfer policies** - Programmable rules for asset transfers

## Module Structure

A typical Sui Move package follows this structure:

```
my-package/
├── Move.toml           # Package manifest
├── sources/            # Move source files
│   ├── my_module.move
│   └── helpers.move
├── tests/              # Test files
│   └── my_module_tests.move
└── examples/           # Example transactions (optional)
```

### Move.toml Configuration

The package manifest defines dependencies and metadata:

```toml
[package]
name = "MyPackage"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/mainnet" }

[addresses]
my_package = "0x0"
```

**Important fields:**
- `edition` - Use "2024.beta" for latest features
- `dependencies` - Always include Sui framework
- `addresses` - Named addresses for the package (0x0 for templates, replaced at publish)

### Module Declaration

Every Move file starts with a module declaration:

```move
module my_package::my_module {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    // Module contents
}
```

**Best practices:**
- Use `package_name::module_name` format
- Import only what you need from other modules
- Group imports by framework (sui::, std::, custom)

## Core Sui Move Patterns

### Defining Objects

Objects are structs with the `key` ability and a `UID` field:

```move
public struct MyObject has key, store {
    id: UID,
    name: String,
    value: u64,
}
```

**Abilities:**
- `key` - Can be stored in global storage (required for objects)
- `store` - Can be stored inside other objects
- `copy` - Can be copied (rarely used for objects)
- `drop` - Can be dropped/destroyed implicitly

### Creating Objects

Use `object::new` to create a UID, then transfer or share:

```move
public fun create_object(name: String, value: u64, ctx: &mut TxContext) {
    let obj = MyObject {
        id: object::new(ctx),
        name,
        value,
    };
    transfer::transfer(obj, tx_context::sender(ctx));
}
```

**Transfer patterns:**
- `transfer::transfer(obj, recipient)` - Transfer to specific address (owned object)
- `transfer::share_object(obj)` - Make object shared (anyone can use)
- `transfer::freeze_object(obj)` - Make object immutable
- `transfer::public_transfer(obj, recipient)` - Transfer with `store` ability

### Modifying Objects

Functions that modify objects take them by mutable reference:

```move
public fun update_value(obj: &mut MyObject, new_value: u64) {
    obj.value = new_value;
}
```

**Entry functions:**
```move
public entry fun update_value_entry(obj: &mut MyObject, new_value: u64) {
    obj.value = new_value;
}
```

Entry functions can be called directly from transactions.

### Deleting Objects

Destroy objects by unpacking and deleting the UID:

```move
public fun delete_object(obj: MyObject) {
    let MyObject { id, name: _, value: _ } = obj;
    object::delete(id);
}
```

Use `_` to ignore fields you don't need.

### One-Time Witness Pattern

Create unique types for module initialization:

```move
public struct MY_MODULE has drop {}

fun init(witness: MY_MODULE, ctx: &mut TxContext) {
    // witness guarantees this runs exactly once
    // Use for creating unique capabilities, registries, etc.
}
```

The `init` function runs automatically when the package is published.

### Using Generics

Create reusable code with type parameters:

```move
public struct Container<T: store> has key, store {
    id: UID,
    value: T,
}

public fun create_container<T: store>(value: T, ctx: &mut TxContext): Container<T> {
    Container {
        id: object::new(ctx),
        value,
    }
}
```

**Phantom type parameters:**
```move
public struct Coin<phantom T> has key, store {
    id: UID,
    balance: u64,
}
```

Use `phantom` when the type parameter doesn't appear in fields.

## Testing Move Code

### Test Module Structure

Create test files in `tests/` directory:

```move
#[test_only]
module my_package::my_module_tests {
    use sui::test_scenario;
    use my_package::my_module;

    #[test]
    fun test_create_object() {
        let owner = @0xA;
        let mut scenario = test_scenario::begin(owner);

        {
            let ctx = test_scenario::ctx(&mut scenario);
            my_module::create_object(b"Test".to_string(), 100, ctx);
        };

        test_scenario::next_tx(&mut scenario, owner);

        {
            let obj = test_scenario::take_from_sender<MyObject>(&scenario);
            assert!(obj.value == 100, 0);
            test_scenario::return_to_sender(&scenario, obj);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = my_module::EInvalidValue)]
    fun test_invalid_value() {
        // Test expected failures
    }
}
```

**Key testing functions:**
- `test_scenario::begin(address)` - Start test scenario
- `test_scenario::next_tx()` - Move to next transaction
- `test_scenario::take_from_sender()` - Take object from sender
- `test_scenario::return_to_sender()` - Return object to sender
- `test_scenario::end()` - Clean up scenario

### Running Tests

```bash
# Run all tests
sui move test

# Run specific test
sui move test test_create_object

# Run tests with coverage
sui move test --coverage

# Run tests with gas profiling
sui move test --gas-profile
```

**Best practices:**
- Test happy paths and error cases
- Use `#[expected_failure]` for error tests
- Test with multiple transactions and addresses
- Check gas costs for expensive operations

## Common Patterns

### Access Control with Capabilities

```move
public struct AdminCap has key, store {
    id: UID,
}

public fun admin_only_action(cap: &AdminCap, obj: &mut MyObject) {
    // cap proves caller has admin rights
    obj.value = 0;
}
```

### Dynamic Fields

Store heterogeneous data on objects:

```move
use sui::dynamic_field;

public fun add_metadata(obj: &mut MyObject, key: String, value: u64) {
    dynamic_field::add(&mut obj.id, key, value);
}

public fun get_metadata(obj: &MyObject, key: String): u64 {
    *dynamic_field::borrow(&obj.id, key)
}
```

### Events

Emit events for off-chain indexing:

```move
use sui::event;

public struct ObjectCreated has copy, drop {
    object_id: ID,
    creator: address,
    name: String,
}

public fun create_with_event(name: String, ctx: &mut TxContext) {
    let id = object::new(ctx);
    let object_id = object::uid_to_inner(&id);

    event::emit(ObjectCreated {
        object_id,
        creator: tx_context::sender(ctx),
        name,
    });

    let obj = MyObject { id, name, value: 0 };
    transfer::transfer(obj, tx_context::sender(ctx));
}
```

### Transfer Policies

Control how objects can be transferred:

```move
use sui::transfer_policy::{Self, TransferPolicy, TransferPolicyCap};
use sui::package::{Self, Publisher};

public fun create_transfer_policy(
    publisher: &Publisher,
    ctx: &mut TxContext
): (TransferPolicy<MyObject>, TransferPolicyCap<MyObject>) {
    transfer_policy::new<MyObject>(publisher, ctx)
}
```

## Building and Deploying

### Build Package

```bash
# Build package (checks for errors)
sui move build

# Build with specific address
sui move build --skip-fetch-latest-git-deps
```

### Deploy to Testnet

```bash
# Switch to testnet
sui client switch --env testnet

# Publish package
sui client publish --gas-budget 100000000

# Publish with upgradability
sui client publish --gas-budget 100000000 --with-unpublished-dependencies
```

**After publishing:**
- Note the package ID (0x...)
- Update Move.toml with published addresses
- Save upgrade capability object ID for future upgrades

### Upgrade Package

```move
// In your module, add version tracking
public struct Version has key {
    id: UID,
    value: u64,
}
```

```bash
# Upgrade package (requires upgrade capability)
sui client upgrade --gas-budget 100000000 --upgrade-capability UPGRADE_CAP_ID
```

## Error Handling

Define error constants:

```move
const EInvalidValue: u64 = 0;
const ENotAuthorized: u64 = 1;
const EInsufficientBalance: u64 = 2;

public fun do_something(value: u64) {
    assert!(value > 0, EInvalidValue);
    assert!(value < 1000, EInvalidValue);
    // ...
}
```

**Best practices:**
- Use descriptive constant names with `E` prefix
- Start numbering from 0
- Document error codes in comments
- Provide context in assertions

## Gas Optimization

**Efficient patterns:**
- Minimize storage operations (object creation/modification)
- Use references instead of copying when possible
- Batch operations in single transactions
- Avoid unnecessary dynamic fields
- Use vector operations efficiently

**Expensive operations:**
- Creating new objects (UID allocation)
- Cryptographic operations
- Large vector operations
- Deep dynamic field nesting

## Additional Resources

### Reference Files

Detailed documentation and examples:

- **`references/move-book.md`** - Complete Move language reference from https://move-book.com/
- **`references/sui-patterns.md`** - Common Sui-specific design patterns
- **`references/framework-apis.md`** - Key Sui framework module APIs

### Example Contracts

Working Move contracts in `examples/`:

- **`examples/simple-nft.move`** - Basic NFT implementation
- **`examples/marketplace.move`** - Simple marketplace contract
- **`examples/capability-pattern.move`** - Access control with capabilities

### Official Documentation

- **Move Book** - https://move-book.com/ (comprehensive Move language guide)
- **Sui Move Documentation** - https://docs.sui.io/guides/developer/first-app (add .md for markdown)
- **Move Bootcamp** - https://github.com/MystenLabs/sui-move-bootcamp
- **Sui Examples** - https://github.com/MystenLabs/sui/tree/main/examples
- **App Examples** - https://docs.sui.io/guides/developer/app-examples

## Quick Reference

### Common Imports

```move
use sui::object::{Self, UID, ID};
use sui::tx_context::{Self, TxContext};
use sui::transfer;
use sui::event;
use sui::package;
use std::string::String;
```

### Object Lifecycle

1. **Create** - `object::new(ctx)` → returns UID
2. **Transfer** - `transfer::transfer()`, `transfer::share_object()`, `transfer::freeze_object()`
3. **Modify** - Entry functions with `&mut` references
4. **Delete** - Unpack struct, `object::delete(id)`

### Testing Workflow

1. Create `#[test_only]` module in `tests/`
2. Use `test_scenario` for multi-transaction tests
3. Run with `sui move test`
4. Check coverage with `--coverage` flag

### Deployment Workflow

1. Build: `sui move build`
2. Test: `sui move test`
3. Publish: `sui client publish --gas-budget 100000000`
4. Save package ID and upgrade capability
5. Update Move.toml with published address

---

For deep dives into specific patterns, consult the reference files. For working examples, see the examples directory.
