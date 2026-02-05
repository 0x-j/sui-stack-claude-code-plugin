---
name: Sui TypeScript SDK
description: This skill should be used when the user asks about "Sui SDK", "send transaction TypeScript", "query Sui data", "@mysten/sui", "SuiClient", "Transaction builder", "RPC calls", or mentions TypeScript/JavaScript interactions with Sui. Provides comprehensive guidance for using the Sui TypeScript SDK for building applications.
version: 0.1.0
---

# Sui TypeScript SDK

Provides expert guidance for using the Sui TypeScript SDK (@mysten/sui) to build applications that interact with the Sui blockchain. This skill covers client setup, transaction building, data querying, and RPC operations.

## Overview

The Sui TypeScript SDK is the official library for interacting with Sui from JavaScript/TypeScript applications. It provides type-safe APIs for querying blockchain data, building transactions, and managing cryptographic operations.

**Key features:**
- **SuiClient** - Main interface for RPC calls and data queries
- **Transaction** - Builder API for programmable transaction blocks (PTBs)
- **Cryptography** - Key pair management and signing
- **Type safety** - Full TypeScript support with proper types
- **BCS** - Efficient binary serialization for on-chain data

**Official documentation:** https://sdk.mystenlabs.com/sui

## Installation

### Install SDK Package

```bash
# Using npm
npm install @mysten/sui

# Using yarn
yarn add @mysten/sui

# Using pnpm
pnpm add @mysten/sui
```

**Version compatibility:**
- SDK version should match the Sui network version
- Use latest version for testnet/mainnet development
- Check release notes for breaking changes

### TypeScript Configuration

Ensure `tsconfig.json` includes proper module resolution:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

## Client Setup

### Initialize SuiClient

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Connect to testnet
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

// Connect to mainnet
const mainnetClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

// Connect to devnet
const devnetClient = new SuiClient({ url: getFullnodeUrl('devnet') });

// Connect to custom RPC
const customClient = new SuiClient({ url: 'https://custom-rpc.example.com' });
```

**Network URLs:**
- `getFullnodeUrl('mainnet')` - Production network
- `getFullnodeUrl('testnet')` - Test network with faucet
- `getFullnodeUrl('devnet')` - Development network (unstable)
- Custom URL - Private or local networks

### Client Configuration

```typescript
import { SuiClient } from '@mysten/sui/client';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  // Optional: Configure request timeout
  timeout: 30000, // 30 seconds
});
```

## Querying Data

### Get Objects

```typescript
// Get object by ID
const object = await client.getObject({
  id: '0xOBJECT_ID',
  options: {
    showContent: true,
    showOwner: true,
    showType: true,
  },
});

console.log(object.data);
```

**Query options:**
- `showContent` - Include object fields
- `showOwner` - Include ownership information
- `showType` - Include object type
- `showPreviousTransaction` - Include previous transaction digest
- `showStorageRebate` - Include storage rebate amount
- `showDisplay` - Include display metadata

### Get Multiple Objects

```typescript
// Batch fetch objects
const objects = await client.multiGetObjects({
  ids: ['0xOBJECT_ID_1', '0xOBJECT_ID_2', '0xOBJECT_ID_3'],
  options: { showContent: true },
});

for (const obj of objects) {
  console.log(obj.data);
}
```

### Get Owned Objects

```typescript
// Get all objects owned by address
const ownedObjects = await client.getOwnedObjects({
  owner: '0xADDRESS',
  options: { showContent: true, showType: true },
});

for (const obj of ownedObjects.data) {
  console.log(obj.data);
}

// Filter by object type
const nfts = await client.getOwnedObjects({
  owner: '0xADDRESS',
  filter: {
    StructType: '0xPACKAGE::module::NFT',
  },
  options: { showContent: true },
});
```

**Filter options:**
- `StructType` - Filter by specific Move type
- `Package` - Filter by package ID
- `Module` - Filter by module name
- `MoveModule` - Filter by package and module

### Get Dynamic Fields

```typescript
// Get dynamic fields attached to object
const dynamicFields = await client.getDynamicFields({
  parentId: '0xPARENT_OBJECT_ID',
});

for (const field of dynamicFields.data) {
  console.log(field.name, field.objectId);

  // Get field value
  const fieldValue = await client.getDynamicFieldObject({
    parentId: '0xPARENT_OBJECT_ID',
    name: field.name,
  });
  console.log(fieldValue.data);
}
```

### Query Transactions

```typescript
// Get transaction by digest
const tx = await client.getTransactionBlock({
  digest: 'TRANSACTION_DIGEST',
  options: {
    showInput: true,
    showEffects: true,
    showEvents: true,
    showObjectChanges: true,
  },
});

console.log(tx.transaction);
console.log(tx.effects);

// Query transactions by sender
const transactions = await client.queryTransactionBlocks({
  filter: {
    FromAddress: '0xADDRESS',
  },
  options: { showInput: true, showEffects: true },
});

for (const tx of transactions.data) {
  console.log(tx.digest);
}
```

### Query Events

```typescript
// Query events by Move event type
const events = await client.queryEvents({
  query: {
    MoveEventType: '0xPACKAGE::module::EventName',
  },
  limit: 50,
});

for (const event of events.data) {
  console.log(event.parsedJson);
}

// Query events by sender
const userEvents = await client.queryEvents({
  query: {
    Sender: '0xADDRESS',
  },
});

// Query events by transaction
const txEvents = await client.queryEvents({
  query: {
    Transaction: 'TRANSACTION_DIGEST',
  },
});
```

### Get Balances

```typescript
// Get all coin balances
const balance = await client.getBalance({
  owner: '0xADDRESS',
  coinType: '0x2::sui::SUI', // SUI coin type
});

console.log(`Balance: ${balance.totalBalance} MIST`);

// Get all coin types owned
const allBalances = await client.getAllBalances({
  owner: '0xADDRESS',
});

for (const bal of allBalances) {
  console.log(`${bal.coinType}: ${bal.totalBalance}`);
}

// Get coin objects (for transactions)
const coins = await client.getCoins({
  owner: '0xADDRESS',
  coinType: '0x2::sui::SUI',
});

for (const coin of coins.data) {
  console.log(`Coin ${coin.coinObjectId}: ${coin.balance}`);
}
```

## Transaction Building

### Transaction Builder Basics

```typescript
import { Transaction } from '@mysten/sui/transactions';

// Create transaction
const tx = new Transaction();

// Call Move function
tx.moveCall({
  target: '0xPACKAGE::module::function_name',
  arguments: [
    tx.pure.string('argument1'),
    tx.pure.u64(100),
    tx.object('0xOBJECT_ID'),
  ],
});

// Set sender (required for gas estimation)
tx.setSender('0xSENDER_ADDRESS');

// Set gas budget
tx.setGasBudget(10000000);
```

**Key concepts:**
- Transactions are programmable blocks (PTBs) with multiple commands
- Commands execute sequentially
- Results from one command can be inputs to another
- All commands succeed or all fail (atomic)

**Reference:** https://sdk.mystenlabs.com/sui/transaction-building/basics

### Transaction Arguments

```typescript
const tx = new Transaction();

// Pure values (serialized with BCS)
tx.pure.string('text');        // String
tx.pure.u8(255);               // u8 number
tx.pure.u64(1000000);          // u64 number (use for large numbers)
tx.pure.bool(true);            // Boolean
tx.pure.address('0x...');      // Address

// Object references
tx.object('0xOBJECT_ID');      // Owned or immutable object
tx.objectRef({                 // Shared object with version
  objectId: '0xOBJECT_ID',
  initialSharedVersion: '12345',
  mutable: true,
});

// Vector of values
tx.pure([1, 2, 3], 'vector<u64>');
tx.makeMoveVec({
  elements: [tx.object('0x1'), tx.object('0x2')],
  type: '0xPACKAGE::module::Type',
});
```

### Common Transaction Patterns

**Transfer object:**
```typescript
const tx = new Transaction();

tx.transferObjects(
  [tx.object('0xOBJECT_ID')],
  tx.pure.address('0xRECIPIENT'),
);
```

**Transfer SUI:**
```typescript
const tx = new Transaction();

const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1000000000)]); // 1 SUI
tx.transferObjects([coin], tx.pure.address('0xRECIPIENT'));
```

**Merge coins:**
```typescript
const tx = new Transaction();

tx.mergeCoins(
  tx.object('0xCOIN1'),
  [tx.object('0xCOIN2'), tx.object('0xCOIN3')],
);
```

**Split coins:**
```typescript
const tx = new Transaction();

const [coin1, coin2] = tx.splitCoins(
  tx.object('0xCOIN_ID'),
  [tx.pure.u64(100000000), tx.pure.u64(200000000)],
);

tx.transferObjects([coin1], tx.pure.address('0xRECIPIENT1'));
tx.transferObjects([coin2], tx.pure.address('0xRECIPIENT2'));
```

### Chaining Transaction Results

```typescript
const tx = new Transaction();

// Create object and use result in next command
const [newObject] = tx.moveCall({
  target: '0xPACKAGE::module::create_object',
  arguments: [tx.pure.string('name')],
});

// Use created object in another call
tx.moveCall({
  target: '0xPACKAGE::module::modify_object',
  arguments: [newObject, tx.pure.u64(100)],
});

// Transfer the object
tx.transferObjects([newObject], tx.pure.address('0xRECIPIENT'));
```

### Execute Transaction

```typescript
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });
const keypair = Ed25519Keypair.deriveKeypair('mnemonic phrase here');

const tx = new Transaction();
tx.moveCall({
  target: '0xPACKAGE::module::function_name',
  arguments: [tx.pure.string('hello')],
});

// Sign and execute transaction
const result = await client.signAndExecuteTransaction({
  transaction: tx,
  signer: keypair,
  options: {
    showEffects: true,
    showObjectChanges: true,
    showEvents: true,
  },
});

console.log('Transaction digest:', result.digest);
console.log('Effects:', result.effects);
console.log('Object changes:', result.objectChanges);
```

### Dry Run Transaction

```typescript
// Simulate transaction without executing
const dryRunResult = await client.dryRunTransactionBlock({
  transactionBlock: await tx.build({ client }),
});

console.log('Gas used:', dryRunResult.effects.gasUsed);
console.log('Status:', dryRunResult.effects.status);
```

## Key Management

### Create Key Pairs

```typescript
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';

// Generate new Ed25519 keypair (recommended)
const keypair = new Ed25519Keypair();
console.log('Address:', keypair.toSuiAddress());

// Derive from mnemonic
const mnemonicKeypair = Ed25519Keypair.deriveKeypair(
  'word1 word2 word3 ... word12'
);

// Generate Secp256k1 (Ethereum-compatible)
const secp256k1 = new Secp256k1Keypair();

// Generate Secp256r1
const secp256r1 = new Secp256r1Keypair();
```

### Export and Import Keys

```typescript
// Export to base64
const exported = keypair.export();
console.log('Private key:', exported.privateKey);

// Import from base64
const imported = Ed25519Keypair.fromSecretKey(
  Uint8Array.from(Buffer.from(exported.privateKey, 'base64'))
);

// Get public key
const publicKey = keypair.getPublicKey();
console.log('Address:', publicKey.toSuiAddress());
```

### Sign Messages

```typescript
import { toB64 } from '@mysten/sui/utils';

// Sign arbitrary data
const message = new TextEncoder().encode('Hello Sui');
const signature = await keypair.sign(message);

console.log('Signature:', toB64(signature));

// Verify signature
const isValid = await keypair.getPublicKey().verify(message, signature);
console.log('Valid:', isValid);
```

## Advanced Patterns

### Pagination

```typescript
// Paginate through owned objects
let hasNextPage = true;
let cursor: string | null = null;

while (hasNextPage) {
  const result = await client.getOwnedObjects({
    owner: '0xADDRESS',
    cursor,
    limit: 50,
    options: { showContent: true },
  });

  for (const obj of result.data) {
    console.log(obj.data);
  }

  hasNextPage = result.hasNextPage;
  cursor = result.nextCursor;
}
```

### Subscribe to Events

```typescript
// Subscribe to on-chain events (WebSocket)
const unsubscribe = await client.subscribeEvent({
  filter: {
    MoveEventType: '0xPACKAGE::module::EventName',
  },
  onMessage: (event) => {
    console.log('New event:', event);
  },
});

// Later: unsubscribe
unsubscribe();
```

### Multi-Signature Transactions

```typescript
import { MultiSigPublicKey } from '@mysten/sui/multisig';

// Create multi-sig with 2-of-3 threshold
const multiSigPublicKey = MultiSigPublicKey.fromPublicKeys({
  threshold: 2,
  publicKeys: [
    { publicKey: pubkey1, weight: 1 },
    { publicKey: pubkey2, weight: 1 },
    { publicKey: pubkey3, weight: 1 },
  ],
});

// Sign transaction with multiple signers
const signature1 = await keypair1.signTransaction(tx);
const signature2 = await keypair2.signTransaction(tx);

// Combine signatures and execute
const multiSig = multiSigPublicKey.combinePartialSignatures([
  signature1,
  signature2,
]);

await client.executeTransactionBlock({
  transactionBlock: tx,
  signature: multiSig,
});
```

### Gas Coin Selection

```typescript
// Use specific gas coin
tx.setGasPayment([
  {
    objectId: '0xGAS_COIN_ID',
    version: '12345',
    digest: 'DIGEST',
  },
]);

// Or let SDK select automatically (default)
// SDK will select from coins owned by sender
```

### Sponsored Transactions

```typescript
// User builds transaction
const userTx = new Transaction();
userTx.moveCall({
  target: '0xPACKAGE::module::function',
  arguments: [userTx.pure.string('data')],
});
userTx.setSender('0xUSER_ADDRESS');

// Sponsor sets gas payment
const sponsoredTx = Transaction.from(userTx);
sponsoredTx.setGasOwner('0xSPONSOR_ADDRESS');
sponsoredTx.setGasBudget(10000000);

// User signs
const userSignature = await userKeypair.signTransaction(sponsoredTx);

// Sponsor signs
const sponsorSignature = await sponsorKeypair.signTransaction(sponsoredTx);

// Execute with both signatures
await client.executeTransactionBlock({
  transactionBlock: sponsoredTx,
  signature: [userSignature, sponsorSignature],
});
```

## Type Safety and BCS

### Parse On-Chain Data

```typescript
// Get object with typed content
const object = await client.getObject({
  id: '0xOBJECT_ID',
  options: { showContent: true },
});

// Content is typed based on object type
if (object.data?.content?.dataType === 'moveObject') {
  const fields = object.data.content.fields;
  console.log('Fields:', fields);
}
```

### BCS Serialization

```typescript
import { bcs } from '@mysten/sui/bcs';

// Define custom BCS struct
const MyStruct = bcs.struct('MyStruct', {
  name: bcs.string(),
  value: bcs.u64(),
  flag: bcs.bool(),
});

// Serialize data
const serialized = MyStruct.serialize({
  name: 'example',
  value: 100n,
  flag: true,
}).toBytes();

// Deserialize data
const deserialized = MyStruct.parse(serialized);
console.log(deserialized);
```

## Error Handling

```typescript
import { SuiClient } from '@mysten/sui/client';

try {
  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  if (result.effects?.status.status === 'failure') {
    console.error('Transaction failed:', result.effects.status.error);
  }
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

**Common errors:**
- Insufficient gas
- Object not found
- Type mismatch
- Permission denied
- Network timeout

## Best Practices

**Client management:**
- Reuse client instances (don't create per request)
- Use connection pooling for high-throughput applications
- Handle network errors with retries

**Transaction building:**
- Always set gas budget higher than estimated
- Use dry run to test transactions before execution
- Batch multiple operations in single PTB when possible
- Validate inputs before building transactions

**Key security:**
- Never expose private keys in client-side code
- Use environment variables for server-side keys
- Implement proper key rotation
- Use hardware wallets for production

**Performance:**
- Use multi-get for batch fetching objects
- Implement pagination for large result sets
- Cache frequently accessed data
- Use subscriptions for real-time updates

## Quick Reference

### Essential Imports

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { bcs } from '@mysten/sui/bcs';
```

### Client Setup

```typescript
const client = new SuiClient({ url: getFullnodeUrl('testnet') });
```

### Transaction Pattern

```typescript
const tx = new Transaction();
tx.moveCall({ target: 'PKG::MOD::FN', arguments: [...] });
const result = await client.signAndExecuteTransaction({
  transaction: tx,
  signer: keypair,
});
```

### Query Data

```typescript
await client.getObject({ id: '0x...', options: {...} });
await client.getOwnedObjects({ owner: '0x...', options: {...} });
await client.getBalance({ owner: '0x...', coinType: '0x2::sui::SUI' });
```

### Common Coin Types

- SUI: `0x2::sui::SUI`
- USDC: Check current package on network

---

For comprehensive API documentation and advanced patterns, visit https://sdk.mystenlabs.com/sui
