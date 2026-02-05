---
name: Seal Secrets Management
description: This skill should be used when the user asks about "Seal", "secrets management", "decentralized secrets", "encrypt for Walrus", "decrypt Seal data", "@mysten/seal", "access control on Sui", "private data", "encrypted storage", or mentions Seal DSM. Provides comprehensive guidance for using Seal to manage secrets with Sui-based access control policies.
version: 0.1.0
---

# Seal Secrets Management

Provides expert guidance for using Seal, a decentralized secrets management (DSM) service that relies on access control policies defined and validated on Sui. Application developers and users can use Seal to secure sensitive data at rest on decentralized storage like Walrus, or on any other onchain/offchain storage.

## Overview

Seal is a decentralized secrets management service that combines Sui blockchain's access control capabilities with encryption to protect sensitive data across any storage medium. Unlike traditional encryption libraries, Seal provides policy-based access management enforced by smart contracts on Sui.

**Key features:**
- **Sui-based access control** - Define and validate access policies on Sui blockchain
- **Storage agnostic** - Works with Walrus, IPFS, S3, onchain, or any storage
- **Policy enforcement** - Smart contract-enforced access rules
- **Multiple encryption modes** - Symmetric and asymmetric encryption
- **Decentralized key management** - Distributed key handling without central authority
- **Streaming support** - Encrypt large files efficiently
- **Browser compatible** - Works in web applications

**Use cases:**
- Secure sensitive data on Walrus or other decentralized storage
- Encrypted onchain data with offchain access control
- Private NFT metadata and assets
- Confidential document sharing with policy-based access
- Multi-party data access with Sui smart contract governance

**Official documentation:** https://seal-docs.wal.app/ and https://sdk.mystenlabs.com/seal

**Note:** Seal is a DSM service, not just an encryption library. Access policies are defined on Sui, providing decentralized, trustless access management.

## Installation

### Install Seal SDK

```bash
# Using npm
npm install @mysten/seal

# Using yarn
yarn add @mysten/seal

# Using pnpm
pnpm add @mysten/seal
```

### Required Dependencies

```bash
# Seal typically requires Walrus SDK as well
npm install @mysten/walrus @mysten/sui
```

## Encryption Basics

### Symmetric Encryption

Symmetric encryption uses the same key for encryption and decryption. Best for:
- Personal data storage
- Single-user applications
- Scenarios where same entity encrypts and decrypts

```typescript
import { seal, unseal } from '@mysten/seal';

// Generate encryption key (32 bytes for AES-256)
const key = crypto.getRandomValues(new Uint8Array(32));

// Encrypt data
const data = new TextEncoder().encode('Secret message');
const encrypted = await seal(data, key);

console.log('Encrypted:', encrypted);

// Decrypt data
const decrypted = await unseal(encrypted, key);
const message = new TextDecoder().decode(decrypted);
console.log('Decrypted:', message);
```

### Generate Encryption Keys

```typescript
// Generate random key (recommended)
function generateKey(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

// Derive key from password (less secure, use with strong passwords)
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  // Use PBKDF2 for key derivation
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return new Uint8Array(derivedBits);
}

// Usage
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await deriveKeyFromPassword('my-secure-password', salt);
```

## Encrypting Data

### Encrypt Text

```typescript
import { seal } from '@mysten/seal';

async function encryptText(text: string, key: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return await seal(data, key);
}

// Usage
const key = generateKey();
const encrypted = await encryptText('Hello, Seal!', key);
```

### Encrypt JSON

```typescript
async function encryptJson(obj: any, key: Uint8Array): Promise<Uint8Array> {
  const json = JSON.stringify(obj);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);
  return await seal(data, key);
}

// Usage
const metadata = {
  name: 'Private Document',
  content: 'Sensitive information',
  timestamp: Date.now(),
};
const encrypted = await encryptJson(metadata, key);
```

### Encrypt Files

```typescript
async function encryptFile(file: File, key: Uint8Array): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  return await seal(data, key);
}

// Usage with file input
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const encrypted = await encryptFile(file, key);
```

### Encrypt and Upload to Walrus

```typescript
import { seal } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';

async function encryptAndUpload(
  data: Uint8Array,
  encryptionKey: Uint8Array
): Promise<string> {
  // Encrypt data
  const encrypted = await seal(data, encryptionKey);

  // Upload to Walrus
  const walrusClient = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });

  const result = await walrusClient.store(encrypted, { epochs: 10 });

  return result.newlyCreated?.blobObject.blobId ||
         result.alreadyCertified?.blobId ||
         '';
}

// Usage
const sensitiveData = new TextEncoder().encode('Private information');
const encryptionKey = generateKey();
const blobId = await encryptAndUpload(sensitiveData, encryptionKey);

// Store blobId and encryptionKey securely
console.log('Encrypted blob ID:', blobId);
```

## Decrypting Data

### Decrypt Text

```typescript
import { unseal } from '@mysten/seal';

async function decryptText(
  encrypted: Uint8Array,
  key: Uint8Array
): Promise<string> {
  const decrypted = await unseal(encrypted, key);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Usage
const text = await decryptText(encrypted, key);
console.log('Decrypted text:', text);
```

### Decrypt JSON

```typescript
async function decryptJson(
  encrypted: Uint8Array,
  key: Uint8Array
): Promise<any> {
  const decrypted = await unseal(encrypted, key);
  const decoder = new TextDecoder();
  const json = decoder.decode(decrypted);
  return JSON.parse(json);
}

// Usage
const obj = await decryptJson(encrypted, key);
console.log('Decrypted object:', obj);
```

### Download and Decrypt from Walrus

```typescript
import { unseal } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';

async function downloadAndDecrypt(
  blobId: string,
  decryptionKey: Uint8Array
): Promise<Uint8Array> {
  // Download from Walrus
  const walrusClient = new WalrusClient({
    aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
  });

  const encrypted = await walrusClient.read(blobId);

  // Decrypt data
  return await unseal(encrypted, decryptionKey);
}

// Usage
const decrypted = await downloadAndDecrypt(blobId, encryptionKey);
const text = new TextDecoder().decode(decrypted);
console.log('Decrypted content:', text);
```

## Key Management Patterns

### Store Keys Securely

**IMPORTANT:** Never store encryption keys in plain text, version control, or client-side code.

#### Browser Storage (Client-Side)

```typescript
// NOT RECOMMENDED for sensitive data
// Only use for non-critical applications

class KeyStorage {
  private static KEY_NAME = 'seal_encryption_key';

  // Store key in sessionStorage (cleared on tab close)
  static saveToSession(key: Uint8Array): void {
    const base64 = btoa(String.fromCharCode(...key));
    sessionStorage.setItem(this.KEY_NAME, base64);
  }

  static loadFromSession(): Uint8Array | null {
    const base64 = sessionStorage.getItem(this.KEY_NAME);
    if (!base64) return null;

    const binary = atob(base64);
    return Uint8Array.from(binary, char => char.charCodeAt(0));
  }

  static clearSession(): void {
    sessionStorage.removeItem(this.KEY_NAME);
  }
}
```

#### Server-Side Key Management

```typescript
// Store keys in environment variables (server-side only)
function getEncryptionKey(): Uint8Array {
  const keyBase64 = process.env.SEAL_ENCRYPTION_KEY;
  if (!keyBase64) {
    throw new Error('Encryption key not configured');
  }

  const binary = Buffer.from(keyBase64, 'base64');
  return new Uint8Array(binary);
}

// Generate and export key (one-time setup)
function setupEncryptionKey(): string {
  const key = generateKey();
  return Buffer.from(key).toString('base64');
}
```

#### User-Derived Keys

```typescript
// Derive key from user credentials
async function getUserKey(
  userId: string,
  password: string
): Promise<Uint8Array> {
  // Use user ID as salt (deterministic)
  const encoder = new TextEncoder();
  const salt = encoder.encode(userId);

  return await deriveKeyFromPassword(password, salt);
}

// Usage: User provides password each session
const userKey = await getUserKey('user@example.com', userPassword);
```

### Key Rotation

```typescript
async function rotateKey(
  blobId: string,
  oldKey: Uint8Array,
  newKey: Uint8Array
): Promise<string> {
  // Download and decrypt with old key
  const decrypted = await downloadAndDecrypt(blobId, oldKey);

  // Re-encrypt with new key
  const reencrypted = await seal(decrypted, newKey);

  // Upload new encrypted blob
  const walrusClient = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });

  const result = await walrusClient.store(reencrypted, { epochs: 10 });

  return result.newlyCreated?.blobObject.blobId ||
         result.alreadyCertified?.blobId ||
         '';
}
```

### Multi-User Access Pattern

```typescript
// Encrypt data with master key, encrypt master key for each user

interface EncryptedBlob {
  dataBlobId: string;           // Encrypted data on Walrus
  encryptedMasterKeys: Map<string, Uint8Array>; // Master key encrypted for each user
}

async function encryptForMultipleUsers(
  data: Uint8Array,
  userKeys: Map<string, Uint8Array>
): Promise<EncryptedBlob> {
  // Generate master key for data
  const masterKey = generateKey();

  // Encrypt data with master key
  const encryptedData = await seal(data, masterKey);

  // Upload to Walrus
  const walrusClient = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });
  const result = await walrusClient.store(encryptedData, { epochs: 10 });
  const dataBlobId = result.newlyCreated?.blobObject.blobId ||
                     result.alreadyCertified?.blobId ||
                     '';

  // Encrypt master key for each user
  const encryptedMasterKeys = new Map<string, Uint8Array>();
  for (const [userId, userKey] of userKeys) {
    const encryptedMasterKey = await seal(masterKey, userKey);
    encryptedMasterKeys.set(userId, encryptedMasterKey);
  }

  return {
    dataBlobId,
    encryptedMasterKeys,
  };
}

async function decryptForUser(
  blob: EncryptedBlob,
  userId: string,
  userKey: Uint8Array
): Promise<Uint8Array> {
  // Decrypt master key
  const encryptedMasterKey = blob.encryptedMasterKeys.get(userId);
  if (!encryptedMasterKey) {
    throw new Error('User does not have access');
  }

  const masterKey = await unseal(encryptedMasterKey, userKey);

  // Download and decrypt data
  return await downloadAndDecrypt(blob.dataBlobId, masterKey);
}
```

## Use Cases

### Private NFT Metadata

```typescript
async function createPrivateNFT(
  name: string,
  description: string,
  imageFile: File,
  ownerKey: Uint8Array
): Promise<string> {
  const walrusClient = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });

  // Encrypt and upload image
  const imageData = new Uint8Array(await imageFile.arrayBuffer());
  const encryptedImage = await seal(imageData, ownerKey);
  const imageResult = await walrusClient.store(encryptedImage, { epochs: 365 });
  const imageBlobId = imageResult.newlyCreated?.blobObject.blobId;

  // Create and encrypt metadata
  const metadata = {
    name,
    description,
    image: `walrus://${imageBlobId}`,
    encrypted: true,
  };

  const metadataJson = JSON.stringify(metadata);
  const metadataData = new TextEncoder().encode(metadataJson);
  const encryptedMetadata = await seal(metadataData, ownerKey);

  // Upload encrypted metadata
  const metadataResult = await walrusClient.store(encryptedMetadata, {
    epochs: 365,
  });

  return metadataResult.newlyCreated?.blobObject.blobId ||
         metadataResult.alreadyCertified?.blobId ||
         '';
}
```

### Encrypted Document Storage

```typescript
interface EncryptedDocument {
  id: string;
  blobId: string;
  title: string;        // Public
  author: string;       // Public
  createdAt: number;    // Public
  encryptedContent: string; // Walrus blob ID
}

async function storeEncryptedDocument(
  title: string,
  author: string,
  content: string,
  encryptionKey: Uint8Array
): Promise<EncryptedDocument> {
  // Encrypt content
  const contentData = new TextEncoder().encode(content);
  const encrypted = await seal(contentData, encryptionKey);

  // Upload to Walrus
  const walrusClient = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });
  const result = await walrusClient.store(encrypted, { epochs: 30 });
  const blobId = result.newlyCreated?.blobObject.blobId ||
                 result.alreadyCertified?.blobId ||
                 '';

  return {
    id: crypto.randomUUID(),
    blobId,
    title,
    author,
    createdAt: Date.now(),
    encryptedContent: blobId,
  };
}

async function readEncryptedDocument(
  doc: EncryptedDocument,
  decryptionKey: Uint8Array
): Promise<string> {
  const decrypted = await downloadAndDecrypt(doc.encryptedContent, decryptionKey);
  return new TextDecoder().decode(decrypted);
}
```

### Secure File Sharing

```typescript
interface SecureShare {
  fileBlobId: string;
  accessToken: string;  // Encrypted master key
}

async function shareFileSecurely(
  file: File,
  recipientKey: Uint8Array
): Promise<SecureShare> {
  // Generate master key
  const masterKey = generateKey();

  // Encrypt file
  const fileData = new Uint8Array(await file.arrayBuffer());
  const encrypted = await seal(fileData, masterKey);

  // Upload to Walrus
  const walrusClient = new WalrusClient({
    publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
  });
  const result = await walrusClient.store(encrypted, { epochs: 7 });
  const fileBlobId = result.newlyCreated?.blobObject.blobId ||
                     result.alreadyCertified?.blobId ||
                     '';

  // Encrypt master key for recipient
  const encryptedMasterKey = await seal(masterKey, recipientKey);
  const accessToken = btoa(String.fromCharCode(...encryptedMasterKey));

  return {
    fileBlobId,
    accessToken,
  };
}

async function accessSharedFile(
  share: SecureShare,
  recipientKey: Uint8Array
): Promise<Uint8Array> {
  // Decrypt master key
  const encryptedMasterKey = Uint8Array.from(
    atob(share.accessToken),
    char => char.charCodeAt(0)
  );
  const masterKey = await unseal(encryptedMasterKey, recipientKey);

  // Download and decrypt file
  return await downloadAndDecrypt(share.fileBlobId, masterKey);
}
```

## React Integration

### Encrypted Upload Component

```tsx
import { seal } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';
import { useState } from 'react';

function EncryptedUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    blobId: string;
    salt: string;
  } | null>(null);

  const handleUpload = async () => {
    if (!file || !password) return;

    setUploading(true);
    try {
      // Generate salt for key derivation
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // Derive key from password
      const key = await deriveKeyFromPassword(password, salt);

      // Encrypt file
      const fileData = new Uint8Array(await file.arrayBuffer());
      const encrypted = await seal(fileData, key);

      // Upload to Walrus
      const client = new WalrusClient({
        publisherUrl: 'https://publisher.walrus-testnet.walrus.space',
      });
      const uploadResult = await client.store(encrypted, { epochs: 5 });
      const blobId = uploadResult.newlyCreated?.blobObject.blobId ||
                     uploadResult.alreadyCertified?.blobId ||
                     '';

      // Store salt (needed for decryption)
      const saltBase64 = btoa(String.fromCharCode(...salt));

      setResult({ blobId, salt: saltBase64 });
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
      <h2>Encrypted File Upload</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Encryption password"
      />
      <button onClick={handleUpload} disabled={!file || !password || uploading}>
        {uploading ? 'Uploading...' : 'Encrypt & Upload'}
      </button>

      {result && (
        <div>
          <h3>Upload Complete</h3>
          <p>Blob ID: {result.blobId}</p>
          <p>Salt: {result.salt}</p>
          <p>Save these values and your password to decrypt later!</p>
        </div>
      )}
    </div>
  );
}
```

### Encrypted Download Component

```tsx
import { unseal } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';
import { useState } from 'react';

function EncryptedDownloader() {
  const [blobId, setBlobId] = useState('');
  const [salt, setSalt] = useState('');
  const [password, setPassword] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!blobId || !salt || !password) return;

    setDownloading(true);
    try {
      // Decode salt
      const saltBytes = Uint8Array.from(atob(salt), char => char.charCodeAt(0));

      // Derive key from password
      const key = await deriveKeyFromPassword(password, saltBytes);

      // Download encrypted data
      const client = new WalrusClient({
        aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
      });
      const encrypted = await client.read(blobId);

      // Decrypt
      const decrypted = await unseal(encrypted, key);

      // Download file
      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decrypted-file';
      a.click();
      URL.revokeObjectURL(url);

      alert('Download successful!');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Decryption failed - check password and credentials');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <h2>Encrypted File Download</h2>
      <input
        type="text"
        value={blobId}
        onChange={(e) => setBlobId(e.target.value)}
        placeholder="Blob ID"
      />
      <input
        type="text"
        value={salt}
        onChange={(e) => setSalt(e.target.value)}
        placeholder="Salt"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Decryption password"
      />
      <button
        onClick={handleDownload}
        disabled={!blobId || !salt || !password || downloading}
      >
        {downloading ? 'Downloading...' : 'Download & Decrypt'}
      </button>
    </div>
  );
}
```

## Best Practices

**Key management:**
- Never hardcode encryption keys
- Use environment variables for server-side keys
- Derive keys from user credentials when appropriate
- Implement key rotation for long-term storage
- Store keys separately from encrypted data

**Security:**
- Use strong, random keys (32 bytes minimum)
- Use unique keys per user or data set
- Implement access control before decryption
- Validate decrypted data integrity
- Clear sensitive data from memory after use

**Performance:**
- Encrypt before uploading (don't encrypt on server if avoidable)
- Use streaming for large files when available
- Cache decrypted data appropriately
- Batch encrypt/decrypt operations when possible

**User experience:**
- Provide clear feedback during encryption/decryption
- Handle errors gracefully
- Support password recovery patterns
- Document key backup procedures

**Data lifecycle:**
- Plan for key rotation
- Consider re-encryption needs
- Implement secure deletion
- Archive old encrypted data appropriately

## Error Handling

```typescript
async function safeDecrypt(
  encrypted: Uint8Array,
  key: Uint8Array
): Promise<Uint8Array | null> {
  try {
    return await unseal(encrypted, key);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.error('Wrong decryption key');
      } else if (error.message.includes('corrupt')) {
        console.error('Corrupted encrypted data');
      } else {
        console.error('Decryption failed:', error.message);
      }
    }
    return null;
  }
}
```

**Common errors:**
- Wrong key - Authentication fails
- Corrupted data - Data integrity check fails
- Invalid format - Data not properly encrypted
- Key size mismatch - Key length incorrect

## Future Considerations

**Key management improvements (TBA):**
- Hardware security module integration
- Threshold encryption schemes
- Time-locked encryption
- Recovery mechanisms

**Advanced features (proposed):**
- Searchable encryption
- Homomorphic operations
- Zero-knowledge proofs
- Federated key management

Check official documentation for updates on these features.

## Quick Reference

### Essential Imports

```typescript
import { seal, unseal } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';
```

### Encrypt and Upload

```typescript
const key = crypto.getRandomValues(new Uint8Array(32));
const encrypted = await seal(data, key);
const result = await walrusClient.store(encrypted, { epochs: 10 });
```

### Download and Decrypt

```typescript
const encrypted = await walrusClient.read(blobId);
const decrypted = await unseal(encrypted, key);
```

### Key Generation

```typescript
const key = crypto.getRandomValues(new Uint8Array(32));
```

### Password-Based Key

```typescript
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await deriveKeyFromPassword(password, salt);
```

---

For comprehensive documentation and updates on key management best practices, visit https://seal-docs.wal.app/ and https://sdk.mystenlabs.com/seal
