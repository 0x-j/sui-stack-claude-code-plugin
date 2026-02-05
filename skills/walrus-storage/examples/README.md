# Walrus Storage Examples

This directory contains complete, production-ready examples for integrating Walrus decentralized storage into your Sui dApp.

## Files Overview

### Configuration Files

#### `vite.config.ts`
Complete Vite configuration with WASM support for Walrus SDK.

**Critical settings:**
- Excludes `@mysten/walrus-wasm` from pre-bundling
- Sets build target to `esnext`
- Configures worker format

**Usage:** Copy this to your project root and customize as needed.

#### `walrusClient.ts`
Walrus client setup using `SuiGrpcClient` with upload relay configuration.

**Exports:**
- `walrusClient` - Testnet client (upload relay)
- `walrusClientMainnet` - Mainnet client (when available)
- `walrusPublisherClient` - Publisher pattern (server-side)
- `getWalrusUrl()` - Helper to get HTTP URLs for blobs

**Usage:** Import and use throughout your app for Walrus operations.

#### `dAppProviders.tsx`
Complete provider setup for Sui dApp with wallet integration.

**Includes:**
- `SuiJsonRpcClient` configuration for dApp Kit
- `SuiClientProvider` for network management
- `WalletProvider` for wallet connections
- `QueryClientProvider` for React Query

**Usage:** Wrap your root component with `<Providers>`.

### Component Examples

#### `WalrusUploadComponent.tsx`
Complete React component demonstrating Walrus file upload with:
- Wallet integration via dApp Kit hooks
- File validation and size limits
- Upload progress and error handling
- Display uploaded images/videos
- Comprehensive user feedback

**Usage:** Copy and customize for your upload UI needs.

### Utility Files

#### `typeUtils.ts`
Type conversion utilities for Walrus WASM types.

**Functions:**
- `toStandardUint8Array()` - Convert WASM bytes to standard array
- `toBlobFromWasm()` - Create Blob from WASM bytes
- `toTextFromWasm()` - Read text content
- `toJsonFromWasm()` - Parse JSON content
- `toDataUrlFromWasm()` - Create data URL for inline display
- `downloadFromWasm()` - Trigger file download

**Why needed:** Walrus SDK returns SharedArrayBuffer-backed Uint8Arrays which are incompatible with some browser APIs.

## Quick Start

### 1. Set Up Vite Configuration

```bash
# Copy vite.config.ts to your project root
cp examples/vite.config.ts ./vite.config.ts
```

### 2. Install Dependencies

```bash
npm install @mysten/walrus @mysten/walrus-wasm @mysten/sui @mysten/dapp-kit @tanstack/react-query
```

### 3. Set Up Providers

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Providers } from './providers'; // Copy from dAppProviders.tsx
import App from './App';
import '@mysten/dapp-kit/dist/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
```

### 4. Create Walrus Client

```tsx
// src/lib/walrusClient.ts
// Copy from examples/walrusClient.ts
```

### 5. Use Upload Component

```tsx
// src/App.tsx
import { WalrusUploadComponent } from './components/WalrusUploadComponent';

function App() {
  return (
    <div>
      <WalrusUploadComponent />
    </div>
  );
}
```

## Common Patterns

### Upload a File

```typescript
import { WalrusFile } from '@mysten/walrus';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { walrusClient } from './lib/walrusClient';

const currentAccount = useCurrentAccount();

const walrusFile = WalrusFile.from({
  contents: file,
  identifier: file.name,
  tags: { 'content-type': file.type },
});

const results = await walrusClient.walrus.writeFiles({
  files: [walrusFile],
  epochs: 5,
  deletable: false,
  signer: currentAccount,
});

const blobId = results[0].info.blobId;
```

### Read a File

```typescript
import { walrusClient } from './lib/walrusClient';
import { toBlobFromWasm } from './lib/typeUtils';

const [file] = await walrusClient.walrus.getFiles({ ids: [blobId] });
const bytes = await file.bytes();
const blob = toBlobFromWasm(bytes, 'image/png');
const url = URL.createObjectURL(blob);
```

### Display Image from Walrus

```tsx
import { getWalrusUrl } from './lib/walrusClient';

function DisplayImage({ blobId }: { blobId: string }) {
  return (
    <img
      src={getWalrusUrl(blobId)}
      alt="Stored on Walrus"
    />
  );
}
```

## Project Structure Recommendation

```
your-project/
├── vite.config.ts          # Copy from examples
├── src/
│   ├── main.tsx            # Set up providers
│   ├── App.tsx
│   ├── lib/
│   │   ├── walrusClient.ts    # Copy from examples
│   │   ├── typeUtils.ts       # Copy from examples
│   │   └── providers.tsx      # Copy from dAppProviders.tsx
│   └── components/
│       └── WalrusUpload.tsx   # Copy from WalrusUploadComponent.tsx
```

## Troubleshooting

### WASM Loading Error

**Error:** `WebAssembly.instantiate(): expected magic word 00 61 73 6d`

**Fix:** Ensure `vite.config.ts` excludes `@mysten/walrus-wasm`:
```typescript
optimizeDeps: {
  exclude: ['@mysten/walrus-wasm'],
}
```

### Type Error with Blob

**Error:** `Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BlobPart'`

**Fix:** Use `toStandardUint8Array()` or `toBlobFromWasm()` from typeUtils:
```typescript
const bytes = await file.bytes();
const standardBytes = new Uint8Array(bytes); // Convert
const blob = new Blob([standardBytes], { type: 'image/png' });
```

### Wallet Shows Wrong Network

**Fix:** Ensure both `network` and `url` are set in `SuiJsonRpcClient`:
```typescript
new SuiJsonRpcClient({
  network: 'testnet',
  url: 'https://fullnode.testnet.sui.io:443',
})
```

### Upload Fails with No Error

**Check:**
1. Wallet is connected (`useCurrentAccount()` returns account)
2. Sufficient SUI balance for gas
3. Network configuration matches wallet network
4. Console for detailed error messages

## Two Clients: Why Both?

Your dApp needs **TWO different clients**:

### SuiJsonRpcClient (for dApp Kit)
- Used in `SuiClientProvider`
- Manages wallet connections
- Uses JSON-RPC protocol
- Constructor: `{ network, url }`

### SuiGrpcClient (for Walrus)
- Used for Walrus operations
- Upload/download files
- Uses gRPC protocol
- Constructor: `{ network, baseUrl }`

**They are NOT interchangeable!** Each serves a specific purpose.

## Network Endpoints

### Testnet
- Upload Relay: `https://upload-relay.testnet.walrus.space`
- Aggregator: `https://aggregator.walrus-testnet.walrus.space`
- Sui gRPC: `https://grpc.testnet.sui.io:443`
- Sui RPC: `https://fullnode.testnet.sui.io:443`

### Mainnet (when available)
- Upload Relay: `https://upload-relay.walrus.space`
- Aggregator: `https://aggregator.walrus.space`
- Sui gRPC: `https://grpc.mainnet.sui.io:443`
- Sui RPC: `https://fullnode.mainnet.sui.io:443`

## Additional Resources

- **Walrus Docs:** https://docs.wal.app/
- **Walrus SDK:** https://sdk.mystenlabs.com/walrus
- **dApp Kit:** https://sdk.mystenlabs.com/dapp-kit
- **Example Project:** https://github.com/0x-j/hello-sui-stack
- **Main Skill:** See `../SKILL.md` for complete documentation

## Need Help?

- Check the main SKILL.md for detailed explanations
- Review the Troubleshooting section
- Join Sui Discord: https://discord.gg/sui
- Check example project: https://github.com/0x-j/hello-sui-stack
