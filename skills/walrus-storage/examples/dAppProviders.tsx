/**
 * dApp Providers Configuration
 *
 * This file sets up the complete provider tree for a Sui dApp with Walrus support.
 * It includes:
 * 1. SuiJsonRpcClient for dApp Kit (wallet integration)
 * 2. SuiClientProvider for network management
 * 3. WalletProvider for wallet connections
 * 4. QueryClientProvider for data fetching
 *
 * Note: The SuiJsonRpcClient here is DIFFERENT from the SuiGrpcClient
 * used for Walrus operations (see walrusClient.ts).
 */

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Create QueryClient for React Query
const queryClient = new QueryClient();

/**
 * Network configurations for dApp Kit.
 *
 * IMPORTANT: Both 'network' and 'url' parameters are REQUIRED.
 * Omitting either will cause errors or wallet showing wrong network.
 */
const networks = {
  testnet: new SuiJsonRpcClient({
    network: 'testnet', // REQUIRED: Network identifier
    url: 'https://fullnode.testnet.sui.io:443', // REQUIRED: RPC endpoint
  }),
  mainnet: new SuiJsonRpcClient({
    network: 'mainnet',
    url: 'https://fullnode.mainnet.sui.io:443',
  }),
  devnet: new SuiJsonRpcClient({
    network: 'devnet',
    url: 'https://fullnode.devnet.sui.io:443',
  }),
};

/**
 * Root provider component that wraps your entire app.
 *
 * Usage:
 * ```tsx
 * import { Providers } from './providers';
 *
 * function App() {
 *   return (
 *     <Providers>
 *       <YourApp />
 *     </Providers>
 *   );
 * }
 * ```
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networks}
        defaultNetwork="testnet"
      >
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

/**
 * Alternative: Separate providers if you need more control
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export function SuiProviders({ children }: { children: ReactNode }) {
  return (
    <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <WalletProvider autoConnect>
        {children}
      </WalletProvider>
    </SuiClientProvider>
  );
}

/**
 * Example main.tsx setup:
 *
 * ```tsx
 * import React from 'react';
 * import ReactDOM from 'react-dom/client';
 * import { Providers } from './providers';
 * import App from './App';
 * import './index.css';
 *
 * // Import dApp Kit styles
 * import '@mysten/dapp-kit/dist/index.css';
 *
 * ReactDOM.createRoot(document.getElementById('root')!).render(
 *   <React.StrictMode>
 *     <Providers>
 *       <App />
 *     </Providers>
 *   </React.StrictMode>
 * );
 * ```
 */
