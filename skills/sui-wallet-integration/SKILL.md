---
name: Sui Wallet Integration
description: This skill should be used when the user asks to "connect wallet", "Sui dApp frontend", "wallet adapter", "dApp Kit", "wallet connection React", "sign transaction with wallet", or mentions frontend wallet integration for Sui applications. Provides comprehensive guidance for integrating wallet functionality into Sui dApps.
version: 0.1.0
---

# Sui Wallet Integration

Provides expert guidance for integrating wallet functionality into Sui decentralized applications using the dApp Kit. This skill covers wallet connection, transaction signing, React hooks, and frontend wallet patterns.

## Overview

The Sui dApp Kit (@mysten/dapp-kit) is the official library for building wallet-enabled frontend applications on Sui. It provides React components, hooks, and utilities for seamless wallet integration.

**Key features:**
- **Wallet connection** - Connect to multiple wallet providers
- **React hooks** - Access wallet state and blockchain data
- **Transaction signing** - Sign and execute transactions from frontend
- **Auto-reconnection** - Persist wallet sessions across page reloads
- **Multi-wallet support** - Compatible with all standard Sui wallets

**Official documentation:** https://sdk.mystenlabs.com/dapp-kit

## Installation

### Install Required Packages

```bash
# Using npm
npm install @mysten/dapp-kit @mysten/sui @tanstack/react-query

# Using yarn
yarn add @mysten/dapp-kit @mysten/sui @tanstack/react-query

# Using pnpm
pnpm add @mysten/dapp-kit @mysten/sui @tanstack/react-query
```

**Dependencies:**
- `@mysten/dapp-kit` - Main dApp Kit library
- `@mysten/sui` - Sui TypeScript SDK
- `@tanstack/react-query` - Required peer dependency for data fetching

### Supported Wallets

The dApp Kit automatically supports all Sui standard wallets:
- Sui Wallet (official)
- Suiet Wallet
- Ethos Wallet
- Martian Wallet
- Morphis Wallet
- Surf Wallet
- Glass Wallet
- OneKey Wallet

No additional configuration needed - wallets are detected automatically.

## Setup

### Provider Configuration

Wrap application with required providers:

```tsx
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <YourApp />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

**Provider hierarchy:**
1. `QueryClientProvider` - React Query for data fetching
2. `SuiClientProvider` - Sui network configuration
3. `WalletProvider` - Wallet state management

**WalletProvider options:**
- `autoConnect` - Auto-reconnect on page load (default: false)
- `storageKey` - LocalStorage key for persistence (default: 'sui_wallet')
- `storage` - Custom storage implementation (default: localStorage)

### Import Styles

```tsx
// In your main App.tsx or _app.tsx
import '@mysten/dapp-kit/dist/index.css';
```

Or customize with your own styles.

## Wallet Connection

### Connect Button Component

```tsx
import { ConnectButton } from '@mysten/dapp-kit';

function Header() {
  return (
    <header>
      <h1>My Sui dApp</h1>
      <ConnectButton />
    </header>
  );
}
```

The `ConnectButton` component provides:
- Wallet selection modal
- Connected wallet display
- Disconnect functionality
- Account switching
- Copy address button

### Custom Connect Button

```tsx
import { useWallet } from '@mysten/dapp-kit';

function CustomConnectButton() {
  const { connect, disconnect, wallets, currentWallet } = useWallet();

  if (currentWallet) {
    return (
      <div>
        <p>Connected: {currentWallet.accounts[0].address.slice(0, 6)}...</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {wallets.map((wallet) => (
        <button key={wallet.name} onClick={() => connect(wallet.name)}>
          Connect {wallet.name}
        </button>
      ))}
    </div>
  );
}
```

### Access Connected Account

```tsx
import { useCurrentAccount } from '@mysten/dapp-kit';

function AccountInfo() {
  const account = useCurrentAccount();

  if (!account) {
    return <p>No wallet connected</p>;
  }

  return (
    <div>
      <p>Address: {account.address}</p>
      <p>Chain: {account.chains[0]}</p>
    </div>
  );
}
```

## Querying Data with Hooks

### Get Owned Objects

```tsx
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';

function OwnedObjects() {
  const account = useCurrentAccount();

  const { data, isLoading, error } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address as string,
      options: {
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!account?.address,
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>My Objects</h2>
      {data?.data.map((obj) => (
        <div key={obj.data?.objectId}>
          <p>ID: {obj.data?.objectId}</p>
          <p>Type: {obj.data?.type}</p>
        </div>
      ))}
    </div>
  );
}
```

### Get Balance

```tsx
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';

function Balance() {
  const account = useCurrentAccount();

  const { data } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address as string,
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!account?.address,
    }
  );

  if (!data) return null;

  const suiBalance = (Number(data.totalBalance) / 1_000_000_000).toFixed(4);

  return (
    <div>
      <p>Balance: {suiBalance} SUI</p>
    </div>
  );
}
```

### Get Object Details

```tsx
import { useSuiClientQuery } from '@mysten/dapp-kit';

function ObjectDetails({ objectId }: { objectId: string }) {
  const { data, isLoading } = useSuiClientQuery('getObject', {
    id: objectId,
    options: {
      showContent: true,
      showOwner: true,
      showType: true,
    },
  });

  if (isLoading) return <div>Loading object...</div>;

  return (
    <div>
      <h3>Object Details</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### Query Multiple Objects

```tsx
import { useSuiClientQuery } from '@mysten/dapp-kit';

function MultipleObjects({ objectIds }: { objectIds: string[] }) {
  const { data } = useSuiClientQuery('multiGetObjects', {
    ids: objectIds,
    options: { showContent: true },
  });

  return (
    <div>
      {data?.map((obj, index) => (
        <div key={index}>
          <p>{obj.data?.objectId}</p>
        </div>
      ))}
    </div>
  );
}
```

## Signing Transactions

### Basic Transaction Signing

```tsx
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

function TransferSui() {
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleTransfer = () => {
    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1000000000)]); // 1 SUI
    tx.transferObjects([coin], tx.pure.address('0xRECIPIENT'));

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: (result) => {
          console.log('Transaction successful:', result.digest);
        },
        onError: (error) => {
          console.error('Transaction failed:', error);
        },
      }
    );
  };

  return <button onClick={handleTransfer}>Transfer 1 SUI</button>;
}
```

### Call Move Function

```tsx
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

function MintNFT() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleMint = () => {
    const tx = new Transaction();

    tx.moveCall({
      target: '0xPACKAGE::nft::mint',
      arguments: [
        tx.pure.string('My NFT'),
        tx.pure.string('Description'),
        tx.pure.string('https://example.com/image.png'),
      ],
    });

    signAndExecute(
      {
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      },
      {
        onSuccess: (result) => {
          console.log('NFT minted!', result);
          const createdObject = result.effects?.created?.[0];
          if (createdObject) {
            console.log('NFT Object ID:', createdObject.reference.objectId);
          }
        },
      }
    );
  };

  return <button onClick={handleMint}>Mint NFT</button>;
}
```

### Transaction with Loading State

```tsx
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

function TransactionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleTransaction = async () => {
    setIsLoading(true);

    const tx = new Transaction();
    tx.moveCall({
      target: '0xPACKAGE::module::function',
      arguments: [tx.pure.string('data')],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          alert('Transaction successful!');
        },
        onError: (error) => {
          setIsLoading(false);
          alert(`Transaction failed: ${error.message}`);
        },
      }
    );
  };

  return (
    <button onClick={handleTransaction} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Execute Transaction'}
    </button>
  );
}
```

### Wait for Transaction Confirmation

```tsx
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

function ConfirmedTransaction() {
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleTransaction = () => {
    const tx = new Transaction();
    // ... build transaction

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          // Wait for transaction to be confirmed
          await client.waitForTransaction({
            digest: result.digest,
            options: {
              showEffects: true,
            },
          });

          console.log('Transaction confirmed!');
        },
      }
    );
  };

  return <button onClick={handleTransaction}>Execute & Confirm</button>;
}
```

## Sign Personal Messages

```tsx
import { useSignPersonalMessage } from '@mysten/dapp-kit';
import { useState } from 'react';

function SignMessage() {
  const [message, setMessage] = useState('');
  const { mutate: signMessage } = useSignPersonalMessage();

  const handleSign = () => {
    signMessage(
      {
        message: new TextEncoder().encode(message),
      },
      {
        onSuccess: (result) => {
          console.log('Signature:', result.signature);
          console.log('Bytes:', result.bytes);
        },
      }
    );
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message to sign"
      />
      <button onClick={handleSign}>Sign Message</button>
    </div>
  );
}
```

## Network Switching

```tsx
import { useSuiClientContext } from '@mysten/dapp-kit';

function NetworkSwitcher() {
  const { network, selectNetwork } = useSuiClientContext();

  return (
    <div>
      <p>Current Network: {network}</p>
      <button onClick={() => selectNetwork('testnet')}>Testnet</button>
      <button onClick={() => selectNetwork('mainnet')}>Mainnet</button>
      <button onClick={() => selectNetwork('devnet')}>Devnet</button>
    </div>
  );
}
```

## Advanced Patterns

### Protected Routes

```tsx
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const account = useCurrentAccount();

  if (!account) {
    return <Navigate to="/connect" />;
  }

  return <>{children}</>;
}

// Usage
function App() {
  return (
    <Routes>
      <Route path="/connect" element={<ConnectPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### Custom Hook for Transactions

```tsx
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

function useTransaction() {
  const client = useSuiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const execute = async (tx: Transaction) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signAndExecute({
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // Wait for confirmation
      await client.waitForTransaction({ digest: result.digest });

      setIsLoading(false);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return { execute, isLoading, error };
}

// Usage
function MyComponent() {
  const { execute, isLoading } = useTransaction();

  const handleClick = async () => {
    const tx = new Transaction();
    // ... build transaction
    await execute(tx);
  };

  return <button onClick={handleClick} disabled={isLoading}>Submit</button>;
}
```

### Query with Auto-Refresh

```tsx
import { useSuiClientQuery } from '@mysten/dapp-kit';

function AutoRefreshBalance() {
  const { data } = useSuiClientQuery(
    'getBalance',
    {
      owner: address,
      coinType: '0x2::sui::SUI',
    },
    {
      refetchInterval: 10000, // Refresh every 10 seconds
      enabled: !!address,
    }
  );

  return <div>Balance: {data?.totalBalance}</div>;
}
```

### Optimistic Updates

```tsx
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';

function OptimisticUpdate() {
  const client = useSuiClient();
  const queryClient = useQueryClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleUpdate = () => {
    const tx = new Transaction();
    // ... build transaction

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          // Invalidate and refetch queries
          queryClient.invalidateQueries({
            queryKey: ['getOwnedObjects'],
          });
          queryClient.invalidateQueries({
            queryKey: ['getBalance'],
          });
        },
      }
    );
  };

  return <button onClick={handleUpdate}>Update</button>;
}
```

### Transaction Builder Component

```tsx
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

function TransactionBuilder() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [
      tx.pure.u64(BigInt(amount) * 1_000_000_000n),
    ]);
    tx.transferObjects([coin], tx.pure.address(recipient));

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          console.log('Success:', result.digest);
          setRecipient('');
          setAmount('');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address"
        required
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in SUI"
        required
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

## Error Handling

```tsx
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

function ErrorHandling() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleTransaction = () => {
    const tx = new Transaction();
    // ... build transaction

    signAndExecute(
      { transaction: tx },
      {
        onError: (error) => {
          // Handle specific errors
          if (error.message.includes('Insufficient')) {
            alert('Insufficient gas balance');
          } else if (error.message.includes('User rejected')) {
            alert('Transaction rejected by user');
          } else if (error.message.includes('No wallet')) {
            alert('Please connect your wallet');
          } else {
            alert(`Transaction failed: ${error.message}`);
          }
        },
      }
    );
  };

  return <button onClick={handleTransaction}>Execute</button>;
}
```

**Common error types:**
- User rejection - User declined in wallet
- Insufficient gas - Not enough SUI for gas
- Network error - RPC connection issues
- No wallet connected - Wallet not available
- Invalid arguments - Wrong function parameters

## Best Practices

**Wallet connection:**
- Always check if wallet is connected before transactions
- Provide clear connection prompts
- Handle disconnection gracefully
- Use `autoConnect` for better UX

**Transaction building:**
- Validate inputs before building transactions
- Show loading states during signing
- Provide transaction feedback (success/error)
- Use optimistic updates when appropriate

**Data fetching:**
- Use React Query features (caching, refetching)
- Implement proper loading states
- Handle errors gracefully
- Invalidate queries after mutations

**Performance:**
- Minimize re-renders with proper dependencies
- Use pagination for large datasets
- Implement debouncing for user inputs
- Cache expensive computations

**Security:**
- Never expose private keys in frontend
- Validate transaction parameters
- Show transaction details before signing
- Implement rate limiting for sensitive operations

## TypeScript Types

```tsx
import type {
  SuiClient,
  SuiTransactionBlockResponse,
} from '@mysten/sui/client';
import type { Transaction } from '@mysten/sui/transactions';

interface TransactionProps {
  onSuccess?: (result: SuiTransactionBlockResponse) => void;
  onError?: (error: Error) => void;
}

function TypedTransaction({ onSuccess, onError }: TransactionProps) {
  // Implementation with proper types
}
```

## Quick Reference

### Essential Imports

```tsx
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
```

### Provider Setup

```tsx
<QueryClientProvider client={queryClient}>
  <SuiClientProvider networks={networks}>
    <WalletProvider autoConnect>
      <App />
    </WalletProvider>
  </SuiClientProvider>
</QueryClientProvider>
```

### Common Hooks

```tsx
const account = useCurrentAccount();
const client = useSuiClient();
const { data } = useSuiClientQuery('getObject', {...});
const { mutate: signAndExecute } = useSignAndExecuteTransaction();
```

### Transaction Pattern

```tsx
const tx = new Transaction();
tx.moveCall({ target: 'PKG::MOD::FN', arguments: [...] });
signAndExecute({ transaction: tx });
```

---

For comprehensive examples and API reference, visit https://sdk.mystenlabs.com/dapp-kit
