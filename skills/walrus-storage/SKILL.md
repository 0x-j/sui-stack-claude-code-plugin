---
name: Walrus Storage
description: This skill should be used when the user asks about "Walrus storage", "upload to Walrus", "decentralized storage Sui", "Walrus blob", "@mysten/walrus", "store files on Walrus", or mentions decentralized storage on Sui. Provides comprehensive guidance for using Walrus for decentralized blob storage.
version: 0.1.0
---

# Walrus Storage

Provides expert guidance for using Walrus, a decentralized storage network built for Sui, to store and retrieve blobs (files, images, videos, etc.) in a cost-effective and performant way.

## Overview

Walrus is a decentralized storage and data availability protocol optimized for large binary objects (blobs). It provides fast, reliable storage with strong availability guarantees, making it ideal for NFT media, application assets, and user-generated content.

**Key features:**
- **Decentralized storage** - Distributed across multiple storage nodes
- **Cost-effective** - Pay once for storage epochs, no ongoing fees
- **Fast retrieval** - Low-latency blob access via HTTP
- **Blob certification** - Cryptographic proofs of storage
- **Sui integration** - Native integration with Sui blockchain

**Official documentation:** https://docs.wal.app/ and https://sdk.mystenlabs.com/walrus

## Installation

### Install Walrus SDK

```bash
# Using npm
npm install @mysten/walrus

# Using yarn
yarn add @mysten/walrus

# Using pnpm
pnpm add @mysten/walrus
```

### Required Dependencies

```bash
# Also need Sui SDK for blockchain interactions
npm install @mysten/sui
```

## Important: Next.js WASM Compatibility Issue

**CRITICAL:** The Walrus SDK uses WASM internally and does NOT work with Next.js client-side rendering due to WASM module incompatibilities.

**Solutions:**

1. **Use Server-Side (Recommended for Next.js):**
```typescript
// app/api/upload/route.ts (Next.js App Router)
export async function POST(request: Request) {
  const { uploadToWalrus } = await import('@mysten/walrus');
  // Upload logic here
}

// pages/api/upload.ts (Next.js Pages Router)
export default async function handler(req, res) {
  const { uploadToWalrus } = await import('@mysten/walrus');
  // Upload logic here
}
```

2. **Use Vite instead of Next.js:**
Vite handles WASM modules correctly for client-side usage.

3. **Use Upload Relay Pattern:**
Upload through Walrus aggregator HTTP API (see Upload Patterns below).

**Reference example:** https://github.com/0x-j/hello-sui-stack

## Storage Patterns

Walrus offers two main approaches for storing blobs:

### 1. Upload Relay Pattern (HTTP API)

Upload through a Walrus aggregator/publisher HTTP endpoint. Best for:
- Client-side uploads (browsers)
- Next.js client components
- No SDK installation needed

```typescript
// Upload via HTTP relay
async function uploadViaRelay(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://publisher.walrus-testnet.walrus.space/v1/store', {
    method: 'PUT',
    body: file,
  });

  const result = await response.json();

  if (result.newlyCreated) {
    return result.newlyCreated.blobObject.blobId;
  } else if (result.alreadyCertified) {
    return result.alreadyCertified.blobId;
  }

  throw new Error('Upload failed');
}

// Usage
const file = document.querySelector('input[type="file"]').files[0];
const blobId = await uploadViaRelay(file);
console.log('Blob ID:', blobId);
```

### 2. Publisher Pattern (SDK)

Upload directly using the SDK. Best for:
- Server-side applications
- Node.js scripts
- Vite applications (client-side)

```typescript
import { WalrusClient } from '@mysten/walrus';

const client = new WalrusClient({
  aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
  publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
});

async function uploadViaSdk(data: Uint8Array): Promise<string> {
  const result = await client.store(data, {
    epochs: 1,
  });

  if (result.newlyCreated) {
    return result.newlyCreated.blobObject.blobId;
  } else if (result.alreadyCertified) {
    return result.alreadyCertified.blobId;
  }

  throw new Error('Upload failed');
}
```

## Client Setup

### Initialize Walrus Client

```typescript
import { WalrusClient } from '@mysten/walrus';

// Testnet configuration
const client = new WalrusClient({
  aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
  publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
});

// Mainnet configuration (when available)
const mainnetClient = new WalrusClient({
  aggregatorUrl: 'https://aggregator.walrus.space',
  publisherUrl: 'https://publisher.walrus.space',
});
```

**Configuration options:**
- `aggregatorUrl` - URL for reading blobs
- `publisherUrl` - URL for uploading blobs
- `systemObject` - Optional: Sui system object ID
- `suiClient` - Optional: Custom SuiClient instance

## Uploading Blobs

### Upload File from Browser

```typescript
import { WalrusClient } from '@mysten/walrus';

const client = new WalrusClient({
  publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
});

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // Convert file to Uint8Array
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Upload to Walrus
  const result = await client.store(data, {
    epochs: 5, // Store for 5 epochs (~5 days on testnet)
  });

  const blobId = result.newlyCreated?.blobObject.blobId ||
                 result.alreadyCertified?.blobId;

  console.log('Uploaded blob ID:', blobId);
  return blobId;
}

// Usage in HTML
<input type="file" onChange={handleFileUpload} />
```

### Upload Text Data

```typescript
async function uploadText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const result = await client.store(data, {
    epochs: 1,
  });

  return result.newlyCreated?.blobObject.blobId ||
         result.alreadyCertified?.blobId ||
         '';
}

// Usage
const blobId = await uploadText('Hello Walrus!');
```

### Upload JSON Data

```typescript
async function uploadJson(obj: any): Promise<string> {
  const json = JSON.stringify(obj);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);

  const result = await client.store(data, {
    epochs: 10,
  });

  return result.newlyCreated?.blobObject.blobId ||
         result.alreadyCertified?.blobId ||
         '';
}

// Usage
const metadata = {
  name: 'My NFT',
  description: 'A cool NFT',
  image: 'walrus://blob-id',
};
const blobId = await uploadJson(metadata);
```

### Upload with Progress Tracking

```typescript
async function uploadWithProgress(
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  const chunkSize = 1024 * 1024; // 1MB chunks
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Note: Progress tracking requires custom implementation
  // The SDK doesn't provide built-in progress callbacks

  onProgress(0);

  const result = await client.store(data, {
    epochs: 5,
  });

  onProgress(100);

  return result.newlyCreated?.blobObject.blobId ||
         result.alreadyCertified?.blobId ||
         '';
}
```

## Retrieving Blobs

### Read Blob Data

```typescript
import { WalrusClient } from '@mysten/walrus';

const client = new WalrusClient({
  aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
});

async function readBlob(blobId: string): Promise<Uint8Array> {
  const data = await client.read(blobId);
  return data;
}

// Convert to text
async function readBlobAsText(blobId: string): Promise<string> {
  const data = await client.read(blobId);
  const decoder = new TextDecoder();
  return decoder.decode(data);
}

// Parse as JSON
async function readBlobAsJson(blobId: string): Promise<any> {
  const text = await readBlobAsText(blobId);
  return JSON.parse(text);
}
```

### Get Blob URL

```typescript
// Direct HTTP URL for blob
function getBlobUrl(blobId: string): string {
  return `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
}

// Use in HTML
function renderImage(blobId: string) {
  const url = getBlobUrl(blobId);
  return <img src={url} alt="Stored on Walrus" />;
}

// Use in video player
function renderVideo(blobId: string) {
  const url = getBlobUrl(blobId);
  return <video src={url} controls />;
}
```

### Check Blob Availability

```typescript
async function isBlobAvailable(blobId: string): Promise<boolean> {
  try {
    const url = `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
```

## Storage Management

### Understand Storage Epochs

Walrus storage is paid per epoch:
- **Epoch duration:** Approximately 1 day on testnet
- **Minimum storage:** 1 epoch
- **Maximum storage:** ~5000 epochs (~13 years)
- **Cost:** Determined by blob size and epoch count

```typescript
// Store for 30 days (30 epochs on testnet)
await client.store(data, {
  epochs: 30,
});

// Store for 1 year (~365 epochs)
await client.store(data, {
  epochs: 365,
});
```

### Calculate Storage Cost

```typescript
import { WalrusClient } from '@mysten/walrus';
import { SuiClient } from '@mysten/sui/client';

const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
const walrusClient = new WalrusClient({
  publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  suiClient,
});

async function estimateCost(
  dataSize: number,
  epochs: number
): Promise<bigint> {
  // Cost calculation is based on:
  // - Blob size in bytes
  // - Number of epochs
  // - Current storage price per byte-epoch

  // Note: Actual cost estimation requires querying Walrus system object
  // This is a simplified example
  const COST_PER_KB_PER_EPOCH = 1000n; // MIST
  const sizeInKb = BigInt(Math.ceil(dataSize / 1024));
  return sizeInKb * BigInt(epochs) * COST_PER_KB_PER_EPOCH;
}
```

### Extend Storage Period

```typescript
// Note: Storage extension requires interacting with Sui blockchain
// to update the blob object's epoch range

import { Transaction } from '@mysten/sui/transactions';

async function extendStorage(
  blobId: string,
  additionalEpochs: number,
  signer: any
): Promise<void> {
  const tx = new Transaction();

  // Call Walrus system contract to extend storage
  tx.moveCall({
    target: '0xWALRUS_PACKAGE::storage::extend',
    arguments: [
      tx.object('WALRUS_SYSTEM_OBJECT'),
      tx.pure.string(blobId),
      tx.pure.u64(additionalEpochs),
    ],
  });

  await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
  });
}
```

## Integration with Sui NFTs

### Store NFT Metadata on Walrus

```typescript
import { WalrusClient } from '@mysten/walrus';

async function createNftMetadata(
  name: string,
  description: string,
  imageFile: File
): Promise<string> {
  const client = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });

  // Upload image first
  const imageBuffer = await imageFile.arrayBuffer();
  const imageData = new Uint8Array(imageBuffer);
  const imageResult = await client.store(imageData, { epochs: 365 });
  const imageBlobId = imageResult.newlyCreated?.blobObject.blobId ||
                      imageResult.alreadyCertified?.blobId;

  // Create metadata JSON
  const metadata = {
    name,
    description,
    image: `walrus://${imageBlobId}`,
    attributes: [],
  };

  // Upload metadata
  const metadataJson = JSON.stringify(metadata);
  const metadataData = new TextEncoder().encode(metadataJson);
  const metadataResult = await client.store(metadataData, { epochs: 365 });

  return metadataResult.newlyCreated?.blobObject.blobId ||
         metadataResult.alreadyCertified?.blobId ||
         '';
}
```

### Mint NFT with Walrus Storage

```typescript
import { Transaction } from '@mysten/sui/transactions';

async function mintNftWithWalrusMetadata(
  metadataBlobId: string,
  signer: any
): Promise<void> {
  const tx = new Transaction();

  // Construct Walrus URL
  const metadataUrl = `walrus://${metadataBlobId}`;

  // Call NFT minting function
  tx.moveCall({
    target: '0xNFT_PACKAGE::nft::mint',
    arguments: [
      tx.pure.string('My NFT'),
      tx.pure.string('Description'),
      tx.pure.string(metadataUrl), // Walrus metadata URL
    ],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: { showObjectChanges: true },
  });

  console.log('NFT minted:', result);
}
```

## Advanced Patterns

### Batch Upload

```typescript
async function batchUpload(files: File[]): Promise<string[]> {
  const client = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });

  const uploadPromises = files.map(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const result = await client.store(data, { epochs: 5 });
    return result.newlyCreated?.blobObject.blobId ||
           result.alreadyCertified?.blobId ||
           '';
  });

  return Promise.all(uploadPromises);
}
```

### Content-Addressed Storage

```typescript
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

async function uploadWithContentHash(data: Uint8Array): Promise<{
  blobId: string;
  contentHash: string;
}> {
  // Calculate content hash
  const hash = sha256(data);
  const contentHash = bytesToHex(hash);

  // Upload to Walrus
  const result = await client.store(data, { epochs: 10 });
  const blobId = result.newlyCreated?.blobObject.blobId ||
                 result.alreadyCertified?.blobId ||
                 '';

  // Store mapping in your database or on-chain
  return { blobId, contentHash };
}

async function verifyContent(
  blobId: string,
  expectedHash: string
): Promise<boolean> {
  const data = await client.read(blobId);
  const hash = sha256(data);
  const actualHash = bytesToHex(hash);
  return actualHash === expectedHash;
}
```

### Caching Strategy

```typescript
class WalrusCache {
  private cache = new Map<string, Uint8Array>();
  private client: WalrusClient;

  constructor(client: WalrusClient) {
    this.client = client;
  }

  async read(blobId: string): Promise<Uint8Array> {
    // Check cache first
    if (this.cache.has(blobId)) {
      return this.cache.get(blobId)!;
    }

    // Fetch from Walrus
    const data = await this.client.read(blobId);

    // Store in cache
    this.cache.set(blobId, data);

    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

### Upload with Retry Logic

```typescript
async function uploadWithRetry(
  data: Uint8Array,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await client.store(data, { epochs: 5 });
      return result.newlyCreated?.blobObject.blobId ||
             result.alreadyCertified?.blobId ||
             '';
    } catch (error) {
      lastError = error as Error;
      console.log(`Upload attempt ${i + 1} failed, retrying...`);

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw lastError || new Error('Upload failed after retries');
}
```

## React Integration

### Upload Component

```tsx
import { WalrusClient } from '@mysten/walrus';
import { useState } from 'react';

function WalrusUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [blobId, setBlobId] = useState<string>('');

  const client = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      const result = await client.store(data, { epochs: 5 });
      const id = result.newlyCreated?.blobObject.blobId ||
                 result.alreadyCertified?.blobId ||
                 '';

      setBlobId(id);
      alert('Upload successful!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload to Walrus'}
      </button>
      {blobId && (
        <div>
          <p>Blob ID: {blobId}</p>
          <img
            src={`https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`}
            alt="Uploaded"
          />
        </div>
      )}
    </div>
  );
}
```

### Next.js Server Action (App Router)

```typescript
// app/actions/walrus.ts
'use server';

import { WalrusClient } from '@mysten/walrus';

export async function uploadToWalrus(formData: FormData) {
  const file = formData.get('file') as File;

  const client = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });

  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const result = await client.store(data, { epochs: 5 });

  return {
    blobId: result.newlyCreated?.blobObject.blobId ||
            result.alreadyCertified?.blobId,
  };
}

// app/upload/page.tsx
'use client';

import { uploadToWalrus } from '../actions/walrus';
import { useState } from 'react';

export default function UploadPage() {
  const [result, setResult] = useState<string>('');

  const handleSubmit = async (formData: FormData) => {
    const { blobId } = await uploadToWalrus(formData);
    setResult(blobId || '');
  };

  return (
    <form action={handleSubmit}>
      <input type="file" name="file" required />
      <button type="submit">Upload</button>
      {result && <p>Blob ID: {result}</p>}
    </form>
  );
}
```

## Best Practices

**Upload considerations:**
- Compress large files before uploading
- Use appropriate epoch counts (longer = more expensive)
- Handle upload failures gracefully
- Validate file types and sizes

**Retrieval optimization:**
- Cache frequently accessed blobs
- Use CDN for hot content
- Pre-fetch critical resources
- Implement lazy loading for media

**Cost management:**
- Choose epoch counts based on data lifecycle
- Archive old content to shorter epochs
- Use content deduplication
- Monitor storage usage

**Security:**
- Validate uploaded content
- Implement access controls if needed
- Don't store sensitive data unencrypted
- Use Seal SDK for encrypted storage

## Troubleshooting

**Next.js WASM errors:**
- Use server-side API routes
- Switch to Vite for client-side uploads
- Use HTTP relay pattern instead of SDK

**Upload failures:**
- Check network connectivity
- Verify publisher URL is accessible
- Ensure sufficient gas for on-chain operations
- Try increasing timeout values

**Retrieval issues:**
- Verify blob ID is correct
- Check epoch hasn't expired
- Try different aggregator endpoints
- Confirm blob was successfully stored

## Quick Reference

### Essential Imports

```typescript
import { WalrusClient } from '@mysten/walrus';
```

### Client Setup

```typescript
const client = new WalrusClient({
  publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
});
```

### Upload Pattern

```typescript
const result = await client.store(data, { epochs: 5 });
const blobId = result.newlyCreated?.blobObject.blobId;
```

### Retrieve Pattern

```typescript
const data = await client.read(blobId);
const url = `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
```

### Testnet Endpoints

- **Publisher:** https://publisher.walrus-testnet.walrus.space
- **Aggregator:** https://aggregator.walrus-testnet.walrus.space

---

For comprehensive documentation and advanced use cases, visit https://docs.wal.app/ and https://sdk.mystenlabs.com/walrus
