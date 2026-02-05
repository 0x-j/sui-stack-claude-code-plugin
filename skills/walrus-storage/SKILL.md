---
name: Walrus Storage
description: This skill should be used when the user asks about "Walrus storage", "upload to Walrus", "decentralized storage Sui", "Walrus blob", "@mysten/walrus", "store files on Walrus", or mentions decentralized storage on Sui. Provides comprehensive guidance for using Walrus for decentralized blob storage with modern SDK patterns.
version: 1.0.0
---

# Walrus Storage

Provides expert guidance for using Walrus, a decentralized storage and data availability protocol built for Sui. This guide focuses on the **modern TypeScript SDK** (2024-2025) with proper client setup, upload relay patterns, and dApp Kit integration.

## Overview

Walrus is a decentralized storage and data availability protocol optimized for large binary objects (blobs). It provides fast, reliable storage with strong availability guarantees, making it ideal for NFT media, application assets, and user-generated content.

**Key features:**
- **Decentralized storage** - Distributed across multiple storage nodes with erasure coding
- **Cost-effective** - Pay once for storage epochs, no ongoing fees
- **Fast retrieval** - Low-latency blob access via HTTP
- **Blob certification** - Cryptographic proofs of storage
- **Native Sui integration** - Blobs are Sui objects with on-chain metadata

**Official documentation:**
- https://docs.wal.app/
- https://sdk.mystenlabs.com/walrus
- Example project: https://github.com/0x-j/hello-sui-stack

## Installation & Prerequisites

### Install Required Packages

```bash
# Core dependencies
npm install @mysten/walrus @mysten/walrus-wasm @mysten/sui

# For React dApps
npm install @mysten/dapp-kit

# Using yarn
yarn add @mysten/walrus @mysten/walrus-wasm @mysten/sui @mysten/dapp-kit

# Using pnpm
pnpm add @mysten/walrus @mysten/walrus-wasm @mysten/sui @mysten/dapp-kit
```

### Critical: Vite WASM Configuration

**REQUIRED FOR VITE PROJECTS:** The Walrus SDK uses WASM internally. You must configure Vite to exclude WASM modules from pre-bundling.

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['@mysten/walrus-wasm'], // CRITICAL: Don't pre-bundle WASM
    esbuildOptions: {
      target: 'esnext',
    },
  },
  worker: {
    format: 'es',
  },
});
```

**Why this is required:**
- Vite tries to pre-bundle dependencies for faster loading
- WASM modules cannot be pre-bundled (they need to be loaded as-is)
- Without this config, you'll get: `WebAssembly.instantiate(): expected magic word 00 61 73 6d, found 3c 21 64 6f`

**Next.js Warning:** The Walrus SDK has WASM compatibility issues with Next.js client-side rendering. For Next.js:
- Use server-side only (API routes, server actions)
- Or use Vite-based projects (recommended for client-side Walrus)

See complete vite.config.ts example in `/examples/vite.config.ts`

## Understanding Upload Patterns

Before implementing, understand the two storage payment models:

### Upload Relay Pattern (User Pays) - PRIMARY

**Use when:**
- Building browser dApps where users pay for their own storage
- Users have connected wallets
- You want users to control and own their storage costs

**Architecture:**
```
User Browser → Upload Relay Server → Walrus Storage Nodes
              (Testnet: upload-relay.testnet.walrus.space)
              ↓
          User's wallet pays for storage
```

**Key characteristics:**
- User pays gas fees for storage
- User signs transactions with their wallet
- Requires dApp Kit integration (`useCurrentAccount()`)
- Best for NFT minting, user-generated content, profile pictures

**Configuration:**
```typescript
walrus({
  uploadRelay: {
    host: 'https://upload-relay.testnet.walrus.space',
    sendTip: { max: 1_000_000 }, // Max tip in MIST (optional)
  },
})
```

### Publisher Pattern (App Pays) - SECONDARY

**Use when:**
- Building server-side applications
- Your backend pays for storage
- Batch uploading content
- No user wallet interaction

**Architecture:**
```
Your Backend → Publisher Server → Walrus Storage Nodes
              (Testnet: publisher.walrus-testnet.walrus.space)
              ↓
          Your backend wallet pays
```

**Key characteristics:**
- Your application pays gas fees
- No user wallet needed
- Best for server-side batch operations
- Requires backend wallet/keypair management

**Configuration:**
```typescript
walrus({
  publisher: 'https://publisher.walrus-testnet.walrus.space',
})
```

**Decision Tree:**
- Browser dApp with wallet? → **Upload Relay**
- Server-side batch upload? → **Publisher**
- NFT minting by users? → **Upload Relay**
- Pre-loading app assets? → **Publisher**

## Client Setup: Two Clients Required

When building a Walrus-enabled dApp, you typically need **TWO different clients**:

### 1. SuiJsonRpcClient (For dApp Kit)

Used for dApp Kit's `SuiClientProvider` to manage wallet connections and network state.

```typescript
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';

// Define networks for dApp Kit
const networks = {
  testnet: new SuiJsonRpcClient({
    network: 'testnet', // REQUIRED
    url: 'https://fullnode.testnet.sui.io:443', // REQUIRED
  }),
  mainnet: new SuiJsonRpcClient({
    network: 'mainnet',
    url: 'https://fullnode.mainnet.sui.io:443',
  }),
};

// In your root component
function App() {
  return (
    <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <WalletProvider autoConnect>
        <YourApp />
      </WalletProvider>
    </SuiClientProvider>
  );
}
```

**Important:** Both `network` and `url` parameters are required. Omitting either will cause errors.

### 2. SuiGrpcClient (For Walrus SDK)

Used for Walrus operations (upload, download). Uses gRPC protocol.

```typescript
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus } from '@mysten/walrus';

// Create Walrus-enabled client
const walrusClient = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: 'https://grpc.testnet.sui.io:443',
}).$extend(
  walrus({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: { max: 1_000_000 },
    },
  })
);
```

**Why two clients?**
- **SuiJsonRpcClient** uses JSON-RPC protocol (compatible with dApp Kit providers)
- **SuiGrpcClient** uses gRPC protocol (required by Walrus SDK)
- They have different constructor parameters: `url` vs `baseUrl`

### Complete Provider Setup

Recommended pattern: Create a `walrusClient.ts` for centralized configuration:

```typescript
// src/lib/walrusClient.ts
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus } from '@mysten/walrus';

export const walrusClient = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: 'https://grpc.testnet.sui.io:443',
}).$extend(
  walrus({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: { max: 1_000_000 }, // Optional tip for relay operators
    },
  })
);

// For mainnet (when ready)
export const walrusClientMainnet = new SuiGrpcClient({
  network: 'mainnet',
  baseUrl: 'https://grpc.mainnet.sui.io:443',
}).$extend(
  walrus({
    uploadRelay: {
      host: 'https://upload-relay.walrus.space',
      sendTip: { max: 1_000_000 },
    },
  })
);
```

See complete example in `/examples/walrusClient.ts` and `/examples/dAppProviders.tsx`

## Uploading Files (Modern API)

### Basic Upload with Wallet Signer

The modern Walrus SDK uses `WalrusFile.from()` to create files and `client.walrus.writeFiles()` to upload.

```typescript
import { WalrusFile } from '@mysten/walrus';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { walrusClient } from './lib/walrusClient';

async function uploadFile(file: File) {
  // Get wallet account from dApp Kit
  const currentAccount = useCurrentAccount();

  if (!currentAccount) {
    throw new Error('No wallet connected');
  }

  // Create WalrusFile
  const walrusFile = WalrusFile.from({
    contents: file, // File or Blob
    identifier: file.name,
    tags: {
      'content-type': file.type,
    },
  });

  // Upload with signer
  const results = await walrusClient.walrus.writeFiles({
    files: [walrusFile],
    epochs: 5, // Storage duration (≈5 days on testnet)
    deletable: false, // Set true if you want to delete later
    signer: currentAccount, // REQUIRED: Wallet account
  });

  // Extract blob ID
  const blobId = results[0].info.blobId;
  console.log('Uploaded blob ID:', blobId);

  return blobId;
}
```

**Key Points:**
- `signer` parameter is **REQUIRED** - it's the connected wallet account
- Get signer from `useCurrentAccount()` hook (dApp Kit)
- `WalrusFile.from()` creates the file object
- `writeFiles()` accepts array of files (can upload multiple at once)
- Returns array of results with `blobId` and metadata

### Upload JSON Metadata (NFT Pattern)

```typescript
import { WalrusFile } from '@mysten/walrus';
import { useCurrentAccount } from '@mysten/dapp-kit';

async function uploadNftMetadata(
  name: string,
  description: string,
  imageBlobId: string
) {
  const currentAccount = useCurrentAccount();

  if (!currentAccount) {
    throw new Error('No wallet connected');
  }

  // Create metadata object
  const metadata = {
    name,
    description,
    image: `walrus://${imageBlobId}`,
    attributes: [
      { trait_type: 'Background', value: 'Blue' },
      { trait_type: 'Rarity', value: 'Common' },
    ],
  };

  // Convert to WalrusFile
  const metadataJson = JSON.stringify(metadata, null, 2);
  const blob = new Blob([metadataJson], { type: 'application/json' });

  const walrusFile = WalrusFile.from({
    contents: blob,
    identifier: 'metadata.json',
    tags: {
      'content-type': 'application/json',
    },
  });

  // Upload
  const results = await walrusClient.walrus.writeFiles({
    files: [walrusFile],
    epochs: 365, // Store for ~1 year
    deletable: false,
    signer: currentAccount,
  });

  return results[0].info.blobId;
}
```

### Batch Upload Multiple Files

```typescript
import { WalrusFile } from '@mysten/walrus';

async function batchUpload(files: File[], currentAccount: any) {
  // Create WalrusFiles for all files
  const walrusFiles = files.map((file) =>
    WalrusFile.from({
      contents: file,
      identifier: file.name,
      tags: {
        'content-type': file.type,
      },
    })
  );

  // Upload all at once
  const results = await walrusClient.walrus.writeFiles({
    files: walrusFiles,
    epochs: 10,
    deletable: false,
    signer: currentAccount,
  });

  // Extract all blob IDs
  return results.map((result) => result.info.blobId);
}
```

### Upload with Error Handling

```typescript
async function uploadWithErrorHandling(file: File, currentAccount: any) {
  try {
    // Validate file size (Walrus has limits)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      throw new Error('File too large. Max size: 100MB');
    }

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

    return {
      success: true,
      blobId: results[0].info.blobId,
    };
  } catch (error) {
    console.error('Upload failed:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        return { success: false, error: 'Insufficient SUI balance' };
      }
      if (error.message.includes('user rejected')) {
        return { success: false, error: 'Transaction rejected by user' };
      }
    }

    return { success: false, error: 'Upload failed. Please try again.' };
  }
}
```

## Reading Files (Modern API)

### Basic File Retrieval

```typescript
async function readFile(blobId: string) {
  // Get files by ID (array of IDs)
  const [file] = await walrusClient.walrus.getFiles({
    ids: [blobId],
  });

  // Get raw bytes
  const bytes = await file.bytes();

  // IMPORTANT: Convert SharedArrayBuffer to standard Uint8Array
  const standardBytes = new Uint8Array(bytes);

  return standardBytes;
}
```

**Critical:** Walrus SDK returns `SharedArrayBuffer`-backed Uint8Array. Many browser APIs (like `Blob` constructor) require standard Uint8Array. Always convert with `new Uint8Array(bytes)`.

### Read as Text

```typescript
async function readAsText(blobId: string): Promise<string> {
  const [file] = await walrusClient.walrus.getFiles({ ids: [blobId] });
  const bytes = await file.bytes();
  const standardBytes = new Uint8Array(bytes);

  const decoder = new TextDecoder();
  return decoder.decode(standardBytes);
}
```

### Read as JSON

```typescript
async function readAsJson<T = any>(blobId: string): Promise<T> {
  const text = await readAsText(blobId);
  return JSON.parse(text);
}

// Usage
const metadata = await readAsJson<{
  name: string;
  description: string;
  image: string;
}>(metadataBlobId);
```

### Read as Blob (for display)

```typescript
async function readAsBlob(
  blobId: string,
  contentType: string = 'application/octet-stream'
): Promise<Blob> {
  const [file] = await walrusClient.walrus.getFiles({ ids: [blobId] });
  const bytes = await file.bytes();

  // Convert to standard Uint8Array (REQUIRED for Blob)
  const standardBytes = new Uint8Array(bytes);

  return new Blob([standardBytes], { type: contentType });
}
```

### Get Direct HTTP URL

For displaying images/videos without SDK:

```typescript
function getWalrusUrl(blobId: string): string {
  return `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
}

// Use in React component
function DisplayImage({ blobId }: { blobId: string }) {
  const url = getWalrusUrl(blobId);
  return <img src={url} alt="Stored on Walrus" />;
}

function DisplayVideo({ blobId }: { blobId: string }) {
  const url = getWalrusUrl(blobId);
  return <video src={url} controls />;
}
```

### Read Multiple Files

```typescript
async function readMultipleFiles(blobIds: string[]) {
  const files = await walrusClient.walrus.getFiles({
    ids: blobIds,
  });

  // Process all files
  const results = await Promise.all(
    files.map(async (file, index) => {
      const bytes = await file.bytes();
      const standardBytes = new Uint8Array(bytes);
      return {
        blobId: blobIds[index],
        data: standardBytes,
      };
    })
  );

  return results;
}
```

## Complete Integration Examples

### React Upload Component with Wallet

Complete working example showing wallet integration, upload, error handling, and display:

```tsx
import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalrusFile } from '@mysten/walrus';
import { walrusClient } from './lib/walrusClient';

export function WalrusUploadComponent() {
  const currentAccount = useCurrentAccount();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [blobId, setBlobId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!currentAccount) {
      setError('Please connect your wallet first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create WalrusFile
      const walrusFile = WalrusFile.from({
        contents: file,
        identifier: file.name,
        tags: {
          'content-type': file.type,
        },
      });

      // Upload with wallet signer
      const results = await walrusClient.walrus.writeFiles({
        files: [walrusFile],
        epochs: 5,
        deletable: false,
        signer: currentAccount,
      });

      const uploadedBlobId = results[0].info.blobId;
      setBlobId(uploadedBlobId);
      console.log('Upload successful:', uploadedBlobId);
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm"
        />
      </div>

      {!currentAccount && (
        <p className="text-amber-600">
          Please connect your wallet to upload files
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || !currentAccount || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload to Walrus'}
      </button>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {blobId && (
        <div className="p-4 bg-green-100 rounded">
          <p className="font-semibold">Upload Successful!</p>
          <p className="text-sm break-all">Blob ID: {blobId}</p>

          {file?.type.startsWith('image/') && (
            <img
              src={`https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`}
              alt="Uploaded"
              className="mt-2 max-w-md"
            />
          )}
        </div>
      )}
    </div>
  );
}
```

See complete example in `/examples/WalrusUploadComponent.tsx`

### NFT Minting with Walrus Storage

```tsx
import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { WalrusFile } from '@mysten/walrus';
import { walrusClient } from './lib/walrusClient';

export function NftMinter() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    if (!image || !currentAccount) return;

    setMinting(true);
    try {
      // Step 1: Upload image to Walrus
      const imageWalrusFile = WalrusFile.from({
        contents: image,
        identifier: image.name,
        tags: { 'content-type': image.type },
      });

      const imageResults = await walrusClient.walrus.writeFiles({
        files: [imageWalrusFile],
        epochs: 365, // Store for ~1 year
        deletable: false,
        signer: currentAccount,
      });

      const imageBlobId = imageResults[0].info.blobId;

      // Step 2: Create and upload metadata
      const metadata = {
        name,
        description,
        image: `walrus://${imageBlobId}`,
      };

      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: 'application/json',
      });

      const metadataWalrusFile = WalrusFile.from({
        contents: metadataBlob,
        identifier: 'metadata.json',
        tags: { 'content-type': 'application/json' },
      });

      const metadataResults = await walrusClient.walrus.writeFiles({
        files: [metadataWalrusFile],
        epochs: 365,
        deletable: false,
        signer: currentAccount,
      });

      const metadataBlobId = metadataResults[0].info.blobId;

      // Step 3: Mint NFT with Walrus metadata URL
      const tx = new Transaction();
      tx.moveCall({
        target: `${YOUR_PACKAGE_ID}::nft::mint`,
        arguments: [
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(`walrus://${metadataBlobId}`),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('NFT minted:', result);
            alert('NFT minted successfully!');
          },
          onError: (error) => {
            console.error('Minting failed:', error);
            alert('Minting failed. Please try again.');
          },
        }
      );
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload to Walrus');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="NFT Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block w-full p-2 border rounded"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="block w-full p-2 border rounded"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="block w-full"
      />
      <button
        onClick={handleMint}
        disabled={!name || !image || !currentAccount || minting}
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {minting ? 'Minting...' : 'Mint NFT'}
      </button>
    </div>
  );
}
```

## Storage Management

### Understanding Epochs

Walrus storage is paid per epoch (time period):
- **Testnet epoch:** ≈1 day
- **Mainnet epoch:** TBD (likely longer)
- **Minimum storage:** 1 epoch
- **Maximum storage:** ~5000 epochs

```typescript
// Store for different durations
await walrusClient.walrus.writeFiles({
  files: [walrusFile],
  epochs: 5,    // ~5 days on testnet
  // epochs: 30,   // ~30 days
  // epochs: 365,  // ~1 year
  deletable: false,
  signer: currentAccount,
});
```

### Deletable Blobs

If you want the ability to delete blobs before expiration:

```typescript
const results = await walrusClient.walrus.writeFiles({
  files: [walrusFile],
  epochs: 10,
  deletable: true, // Allow deletion
  signer: currentAccount,
});

// Later, to delete
await walrusClient.walrus.deleteFiles({
  ids: [blobId],
  signer: currentAccount,
});
```

## Best Practices

### Upload Considerations

- **Validate before upload:** Check file size, type, and content
- **Compress when possible:** Reduce storage costs with image/video compression
- **Choose appropriate epochs:** Balance cost vs availability needs
- **Handle failures gracefully:** Network issues, insufficient funds, user rejection
- **Show progress:** Keep users informed during uploads

### Security

- **Don't store sensitive data unencrypted:** Walrus blobs are publicly accessible
- **Validate user uploads:** Prevent malicious content
- **Implement access controls:** Use Seal for decentralized secrets and access-controlled storage
- **Content moderation:** For user-generated content platforms

### Performance

- **Cache frequently accessed blobs:** Store in browser cache or CDN
- **Use direct HTTP URLs:** For public display (images, videos)
- **Lazy load media:** Don't load all blobs at once
- **Batch uploads:** Upload multiple files simultaneously when possible

### Cost Management

- **Right-size epochs:** Don't over-provision storage time
- **Deduplicate content:** Walrus handles duplicate blobs efficiently
- **Monitor usage:** Track storage costs per user/feature
- **Archive old content:** Consider shorter epochs for historical data

## Troubleshooting

### WASM Loading Errors

**Error:** `WebAssembly.instantiate(): expected magic word 00 61 73 6d, found 3c 21 64 6f`

**Cause:** Vite is pre-bundling WASM modules.

**Solution:** Add to `vite.config.ts`:
```typescript
optimizeDeps: {
  exclude: ['@mysten/walrus-wasm'],
}
```

### Type Error with Blob Constructor

**Error:** `Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BlobPart'`

**Cause:** Walrus returns SharedArrayBuffer-backed Uint8Array.

**Solution:** Convert to standard Uint8Array:
```typescript
const bytes = await file.bytes();
const standardBytes = new Uint8Array(bytes); // This copies to standard array
const blob = new Blob([standardBytes], { type: 'image/png' });
```

### Wallet Shows Wrong Network

**Issue:** Wallet shows "localnet" but you're using testnet.

**Cause:** `SuiClientProvider` network not configured properly.

**Solution:** Ensure both `network` and `url` are set:
```typescript
const networks = {
  testnet: new SuiJsonRpcClient({
    network: 'testnet', // Required
    url: 'https://fullnode.testnet.sui.io:443', // Required
  }),
};
```

### "No Wallet Connected" Errors

**Cause:** Trying to upload without wallet signer.

**Solution:** Check wallet connection before upload:
```typescript
const currentAccount = useCurrentAccount();
if (!currentAccount) {
  alert('Please connect your wallet');
  return;
}
```

### Upload Fails Silently

**Possible causes:**
- Insufficient SUI balance for gas
- Network connectivity issues
- File too large (>100MB limit)
- Wrong network configuration

**Solution:** Add comprehensive error handling:
```typescript
try {
  const results = await walrusClient.walrus.writeFiles({...});
} catch (error) {
  console.error('Upload error:', error);
  // Check error message for specific issues
}
```

### Client Type Confusion

**Error:** `Type 'SuiGrpcClient' is not assignable to type...`

**Cause:** Using wrong client type for the context.

**Solution:**
- Use `SuiJsonRpcClient` for dApp Kit (`SuiClientProvider`)
- Use `SuiGrpcClient` for Walrus operations
- See "Client Setup: Two Clients Required" section

## Quick Reference

### Essential Imports

```typescript
// Core Walrus
import { walrus, WalrusFile } from '@mysten/walrus';
import { SuiGrpcClient } from '@mysten/sui/grpc';

// dApp Kit integration
import { useCurrentAccount } from '@mysten/dapp-kit';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
```

### Client Setup

```typescript
// For Walrus operations
const walrusClient = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: 'https://grpc.testnet.sui.io:443',
}).$extend(
  walrus({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
    },
  })
);
```

### Upload Pattern

```typescript
// Create file
const walrusFile = WalrusFile.from({
  contents: file,
  identifier: file.name,
  tags: { 'content-type': file.type },
});

// Upload
const results = await walrusClient.walrus.writeFiles({
  files: [walrusFile],
  epochs: 5,
  deletable: false,
  signer: currentAccount, // From useCurrentAccount()
});

const blobId = results[0].info.blobId;
```

### Read Pattern

```typescript
// Get file
const [file] = await walrusClient.walrus.getFiles({ ids: [blobId] });
const bytes = await file.bytes();
const standardBytes = new Uint8Array(bytes); // Important!

// Or use HTTP URL
const url = `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
```

### Network Endpoints

**Testnet:**
- Upload Relay: `https://upload-relay.testnet.walrus.space`
- Aggregator: `https://aggregator.walrus-testnet.walrus.space`
- Sui gRPC: `https://grpc.testnet.sui.io:443`
- Sui RPC: `https://fullnode.testnet.sui.io:443`

**Mainnet (when available):**
- Upload Relay: `https://upload-relay.walrus.space`
- Aggregator: `https://aggregator.walrus.space`

---

## Additional Resources

- **Official Docs:** https://docs.wal.app/
- **SDK Reference:** https://sdk.mystenlabs.com/walrus
- **Example Project:** https://github.com/0x-j/hello-sui-stack
- **Seal (Access Control):** For private/encrypted storage
- **Community Discord:** https://discord.gg/sui

For complete working examples, see the `/examples` directory in this skill.
