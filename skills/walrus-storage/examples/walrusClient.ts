/**
 * Walrus Client Configuration
 *
 * This file sets up a SuiGrpcClient extended with Walrus capabilities.
 * Use this client for all Walrus operations (upload, download, delete).
 *
 * Note: This is separate from the SuiJsonRpcClient used in dApp Kit providers.
 */

import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus } from '@mysten/walrus';

/**
 * Walrus client for testnet with upload relay configuration.
 *
 * Upload relay pattern: Users pay for their own storage.
 * Use this for browser dApps where users have connected wallets.
 */
export const walrusClient = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: 'https://grpc.testnet.sui.io:443',
}).$extend(
  walrus({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: { max: 1_000_000 }, // Optional tip for relay operators (in MIST)
    },
  })
);

/**
 * Walrus client for mainnet (when available).
 * Update endpoints when mainnet is live.
 */
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

/**
 * Publisher pattern example (for server-side usage where your app pays).
 *
 * Use this when:
 * - Running on backend/server
 * - Your application pays for storage
 * - No user wallet interaction needed
 */
export const walrusPublisherClient = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: 'https://grpc.testnet.sui.io:443',
}).$extend(
  walrus({
    publisher: 'https://publisher.walrus-testnet.walrus.space',
  })
);

/**
 * Helper function to get Walrus aggregator URL for a blob ID.
 * Use this for displaying images/videos via direct HTTP URLs.
 */
export function getWalrusUrl(blobId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  const baseUrl = network === 'testnet'
    ? 'https://aggregator.walrus-testnet.walrus.space'
    : 'https://aggregator.walrus.space';

  return `${baseUrl}/v1/${blobId}`;
}
