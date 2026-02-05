# Sui-Specific Design Patterns

Advanced patterns for building robust and efficient Sui Move contracts.

## Capability Pattern

Use capability objects to represent permissions and access control.

### Basic Capability

```move
module my_package::admin {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    /// Capability that grants admin privileges
    public struct AdminCap has key, store {
        id: UID,
    }

    /// One-time initialization
    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            AdminCap { id: object::new(ctx) },
            tx_context::sender(ctx)
        );
    }

    /// Admin-only function
    public fun admin_action(_cap: &AdminCap, /* other params */) {
        // _cap proves caller has admin rights
        // Perform privileged action
    }
}
```

### Hierarchical Capabilities

```move
public struct SuperAdminCap has key, store { id: UID }
public struct ModeratorCap has key, store { id: UID }
public struct UserCap has key, store { id: UID }

// SuperAdmin can create ModeratorCaps
public fun create_moderator(
    _cap: &SuperAdminCap,
    recipient: address,
    ctx: &mut TxContext
) {
    transfer::transfer(
        ModeratorCap { id: object::new(ctx) },
        recipient
    );
}
```

## Witness Pattern

Use one-time witnesses for initialization and type uniqueness guarantees.

### One-Time Witness (OTW)

```move
module my_package::my_coin {
    use sui::coin::{Self, TreasuryCap};
    use sui::tx_context::TxContext;

    /// OTW - must be named after module in uppercase
    public struct MY_COIN has drop {}

    fun init(witness: MY_COIN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9, // decimals
            b"MYCOIN",
            b"My Coin",
            b"Description",
            option::none(),
            ctx
        );

        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }
}
```

### Witness for Type Registration

```move
use sui::package;

public struct MY_MODULE has drop {}

fun init(witness: MY_MODULE, ctx: &mut TxContext) {
    let publisher = package::claim(witness, ctx);
    // Use publisher for transfer policies, display, etc.
    transfer::public_transfer(publisher, tx_context::sender(ctx));
}
```

## Collection Patterns

### Registry Pattern

Maintain a shared registry of objects:

```move
use sui::table::{Self, Table};
use std::string::String;

public struct Registry has key {
    id: UID,
    items: Table<String, ID>, // name -> object ID
}

public fun create_registry(ctx: &mut TxContext) {
    let registry = Registry {
        id: object::new(ctx),
        items: table::new(ctx),
    };
    transfer::share_object(registry);
}

public fun register(
    registry: &mut Registry,
    name: String,
    object_id: ID
) {
    table::add(&mut registry.items, name, object_id);
}

public fun lookup(registry: &Registry, name: String): &ID {
    table::borrow(&registry.items, name)
}
```

### Dynamic Field Collections

Store heterogeneous items on an object:

```move
use sui::dynamic_field as df;
use sui::dynamic_object_field as dof;

public struct Container has key {
    id: UID,
    // Fields stored dynamically
}

// Store value type
public fun add_metadata(container: &mut Container, key: String, value: u64) {
    df::add(&mut container.id, key, value);
}

// Store object type
public fun add_child_object<T: key + store>(
    container: &mut Container,
    key: String,
    child: T
) {
    dof::add(&mut container.id, key, child);
}
```

## Treasury and Minting Patterns

### Controlled Minting

```move
use sui::coin::{Self, Coin, TreasuryCap};

public fun mint(
    cap: &mut TreasuryCap<MY_COIN>,
    amount: u64,
    ctx: &mut TxContext
): Coin<MY_COIN> {
    coin::mint(cap, amount, ctx)
}

public fun burn(cap: &mut TreasuryCap<MY_COIN>, coin: Coin<MY_COIN>) {
    coin::burn(cap, coin);
}
```

### Supply Cap Pattern

Limit total supply:

```move
public struct SupplyCap has key, store {
    id: UID,
    max_supply: u64,
    current_supply: u64,
}

public fun mint_with_cap(
    supply_cap: &mut SupplyCap,
    treasury: &mut TreasuryCap<MY_COIN>,
    amount: u64,
    ctx: &mut TxContext
): Coin<MY_COIN> {
    assert!(
        supply_cap.current_supply + amount <= supply_cap.max_supply,
        EExceedsMaxSupply
    );
    supply_cap.current_supply = supply_cap.current_supply + amount;
    coin::mint(treasury, amount, ctx)
}
```

## NFT Patterns

### Basic NFT

```move
use std::string::String;
use sui::url::{Self, Url};
use sui::display;

public struct MyNFT has key, store {
    id: UID,
    name: String,
    description: String,
    image_url: Url,
}

public fun mint_nft(
    name: String,
    description: String,
    image_url: vector<u8>,
    ctx: &mut TxContext
): MyNFT {
    MyNFT {
        id: object::new(ctx),
        name,
        description,
        image_url: url::new_unsafe_from_bytes(image_url),
    }
}
```

### NFT with Display Standard

```move
use sui::package::Publisher;
use sui::display;

fun init(witness: MY_MODULE, ctx: &mut TxContext) {
    let publisher = package::claim(witness, ctx);
    let mut display = display::new<MyNFT>(&publisher, ctx);

    display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
    display::add(&mut display, string::utf8(b"description"), string::utf8(b"{description}"));
    display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{image_url}"));

    display::update_version(&mut display);

    transfer::public_transfer(publisher, tx_context::sender(ctx));
    transfer::public_transfer(display, tx_context::sender(ctx));
}
```

## Marketplace Patterns

### Basic Listing

```move
public struct Listing<T: key + store> has key {
    id: UID,
    item: T,
    price: u64,
    seller: address,
}

public fun create_listing<T: key + store>(
    item: T,
    price: u64,
    ctx: &mut TxContext
) {
    let listing = Listing {
        id: object::new(ctx),
        item,
        price,
        seller: tx_context::sender(ctx),
    };
    transfer::share_object(listing);
}

public fun purchase<T: key + store>(
    listing: Listing<T>,
    payment: Coin<SUI>,
    ctx: &mut TxContext
): T {
    let Listing { id, item, price, seller } = listing;

    assert!(coin::value(&payment) == price, EInvalidPayment);

    transfer::public_transfer(payment, seller);
    object::delete(id);

    item
}
```

### Marketplace with Fees

```move
public struct Marketplace has key {
    id: UID,
    fee_percentage: u64, // basis points (e.g., 250 = 2.5%)
    fee_recipient: address,
}

public fun purchase_with_fee<T: key + store>(
    marketplace: &Marketplace,
    listing: Listing<T>,
    mut payment: Coin<SUI>,
    ctx: &mut TxContext
): T {
    let Listing { id, item, price, seller } = listing;

    assert!(coin::value(&payment) == price, EInvalidPayment);

    // Calculate and take fee
    let fee_amount = (price * marketplace.fee_percentage) / 10000;
    let fee = coin::split(&mut payment, fee_amount, ctx);

    transfer::public_transfer(fee, marketplace.fee_recipient);
    transfer::public_transfer(payment, seller);

    object::delete(id);
    item
}
```

## Hot Potato Pattern

Force specific execution flow by using types without abilities:

```move
/// Type without abilities - must be consumed
public struct Request {
    value: u64,
}

public fun create_request(value: u64): Request {
    Request { value }
}

/// Must be called to consume Request
public fun fulfill_request(request: Request): u64 {
    let Request { value } = request;
    value
}

/// Usage pattern - request MUST be fulfilled
public fun do_action(value: u64): u64 {
    let request = create_request(value);
    // Must fulfill request before function ends
    fulfill_request(request)
}
```

## Shared Object Patterns

### Epoch-Based Access Control

```move
use sui::tx_context::epoch;

public struct TimeLocked has key {
    id: UID,
    unlock_epoch: u64,
    contents: u64,
}

public fun create_time_locked(
    unlock_epoch: u64,
    contents: u64,
    ctx: &mut TxContext
) {
    let locked = TimeLocked {
        id: object::new(ctx),
        unlock_epoch,
        contents,
    };
    transfer::share_object(locked);
}

public fun unlock(locked: &mut TimeLocked, ctx: &TxContext): u64 {
    assert!(epoch(ctx) >= locked.unlock_epoch, ENotUnlocked);
    locked.contents
}
```

### Multi-Sig Pattern

```move
use sui::vec_set::{Self, VecSet};

public struct MultiSig has key {
    id: UID,
    signers: VecSet<address>,
    threshold: u64,
    approvals: VecSet<address>,
}

public fun approve(multi_sig: &mut MultiSig, ctx: &TxContext) {
    let signer = tx_context::sender(ctx);
    assert!(vec_set::contains(&multi_sig.signers, &signer), ENotSigner);
    vec_set::insert(&mut multi_sig.approvals, signer);
}

public fun execute(multi_sig: &MultiSig): bool {
    vec_set::size(&multi_sig.approvals) >= multi_sig.threshold
}
```

## Upgrade Pattern

### Version Management

```move
public struct Version has key {
    id: UID,
    major: u64,
    minor: u64,
    patch: u64,
}

public fun check_version(version: &Version, min_major: u64) {
    assert!(version.major >= min_major, EVersionTooOld);
}

public fun upgrade_version(
    _cap: &AdminCap,
    version: &mut Version,
    major: u64,
    minor: u64,
    patch: u64
) {
    version.major = major;
    version.minor = minor;
    version.patch = patch;
}
```

## Event Patterns

### Structured Events

```move
use sui::event;

public struct ItemCreated has copy, drop {
    item_id: ID,
    creator: address,
    timestamp: u64,
}

public struct ItemTransferred has copy, drop {
    item_id: ID,
    from: address,
    to: address,
    timestamp: u64,
}

public fun create_with_event(ctx: &mut TxContext) {
    let id = object::new(ctx);
    let item_id = object::uid_to_inner(&id);

    event::emit(ItemCreated {
        item_id,
        creator: tx_context::sender(ctx),
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });

    // Create item...
}
```

## Gas Optimization Patterns

### Batch Operations

```move
public fun batch_transfer<T: key + store>(
    items: vector<T>,
    recipients: vector<address>
) {
    let len = vector::length(&items);
    assert!(len == vector::length(&recipients), ELengthMismatch);

    let mut i = 0;
    while (i < len) {
        let item = vector::pop_back(&mut items);
        let recipient = vector::pop_back(&mut recipients);
        transfer::public_transfer(item, recipient);
        i = i + 1;
    };

    vector::destroy_empty(items);
    vector::destroy_empty(recipients);
}
```

### Efficient Storage

```move
// BAD - creates new objects
public fun store_many_bad(ctx: &mut TxContext) {
    let mut i = 0;
    while (i < 100) {
        let obj = MyObject { id: object::new(ctx), value: i };
        transfer::share_object(obj);
        i = i + 1;
    };
}

// GOOD - uses vector in single object
public struct Container has key {
    id: UID,
    values: vector<u64>,
}

public fun store_many_good(ctx: &mut TxContext) {
    let mut values = vector::empty();
    let mut i = 0;
    while (i < 100) {
        vector::push_back(&mut values, i);
        i = i + 1;
    };

    let container = Container {
        id: object::new(ctx),
        values,
    };
    transfer::share_object(container);
}
```

## Security Patterns

### Reentrancy Protection

Sui's object ownership model prevents most reentrancy, but be careful with shared objects:

```move
public struct Vault has key {
    id: UID,
    balance: u64,
    locked: bool,
}

public fun withdraw(vault: &mut Vault, amount: u64): u64 {
    assert!(!vault.locked, EReentrancyDetected);
    vault.locked = true;

    assert!(vault.balance >= amount, EInsufficientBalance);
    vault.balance = vault.balance - amount;

    vault.locked = false;
    amount
}
```

### Integer Overflow Prevention

```move
public fun safe_add(a: u64, b: u64): u64 {
    let result = a + b;
    assert!(result >= a, EOverflow);
    result
}

public fun safe_multiply(a: u64, b: u64): u64 {
    if (a == 0 || b == 0) return 0;
    let result = a * b;
    assert!(result / a == b, EOverflow);
    result
}
```

### Access Control Checks

```move
public fun authorized_action(
    owner_cap: &OwnerCap,
    item: &mut Item,
    ctx: &TxContext
) {
    // Check ownership
    assert!(
        object::uid_to_address(&item.id) == object::uid_to_address(&owner_cap.id),
        ENotAuthorized
    );

    // Check sender
    assert!(
        tx_context::sender(ctx) == owner_cap.owner,
        ENotSender
    );

    // Perform action
}
```

---

These patterns cover most common use cases. Combine and adapt them for specific requirements. Always prioritize security and gas efficiency.
