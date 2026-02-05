/**
 * Complete Walrus Upload Component
 *
 * This is a production-ready React component that demonstrates:
 * - Wallet integration with dApp Kit
 * - File selection and validation
 * - Upload to Walrus with proper error handling
 * - Loading states and user feedback
 * - Displaying uploaded content
 *
 * Copy this component and customize as needed for your dApp.
 */

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalrusFile } from '@mysten/walrus';
import { walrusClient, getWalrusUrl } from './walrusClient';

interface UploadResult {
  blobId: string;
  url: string;
  fileName: string;
  fileType: string;
}

export function WalrusUploadComponent() {
  const currentAccount = useCurrentAccount();

  // State management
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string>('');

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (adjust limit as needed)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > MAX_SIZE) {
      setError('File too large. Maximum size is 100MB.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setUploadResult(null); // Clear previous results
  };

  /**
   * Handle file upload to Walrus
   */
  const handleUpload = async () => {
    // Validation
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!currentAccount) {
      setError('Please connect your wallet to upload files');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Step 1: Create WalrusFile
      const walrusFile = WalrusFile.from({
        contents: file,
        identifier: file.name,
        tags: {
          'content-type': file.type,
        },
      });

      // Step 2: Upload to Walrus with wallet signer
      console.log('Uploading to Walrus...');
      const results = await walrusClient.walrus.writeFiles({
        files: [walrusFile],
        epochs: 5, // Store for ~5 days on testnet (adjust as needed)
        deletable: false, // Set true if you want ability to delete
        signer: currentAccount, // Wallet account from dApp Kit
      });

      // Step 3: Extract blob ID and create result
      const blobId = results[0].info.blobId;
      const url = getWalrusUrl(blobId);

      setUploadResult({
        blobId,
        url,
        fileName: file.name,
        fileType: file.type,
      });

      console.log('Upload successful!', { blobId, url });
    } catch (err) {
      console.error('Upload error:', err);

      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('insufficient funds')) {
          setError('Insufficient SUI balance. Please add funds to your wallet.');
        } else if (err.message.includes('user rejected')) {
          setError('Transaction rejected. Please try again.');
        } else {
          setError(`Upload failed: ${err.message}`);
        }
      } else {
        setError('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Upload to Walrus</h2>

        {/* Wallet Connection Status */}
        {!currentAccount && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-amber-800">
              ⚠️ Please connect your wallet to upload files
            </p>
          </div>
        )}

        {/* File Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || !currentAccount || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload to Walrus'
            )}
          </button>

          {(file || uploadResult) && (
            <button
              onClick={handleReset}
              disabled={uploading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {uploadResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✓ Upload Successful!
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Blob ID:</span>
                <p className="font-mono text-xs break-all mt-1">{uploadResult.blobId}</p>
              </div>
              <div>
                <span className="font-medium">URL:</span>
                <a
                  href={uploadResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block mt-1 break-all"
                >
                  {uploadResult.url}
                </a>
              </div>
            </div>

            {/* Display uploaded content if it's an image */}
            {uploadResult.fileType.startsWith('image/') && (
              <div className="mt-4">
                <p className="font-medium mb-2">Preview:</p>
                <img
                  src={uploadResult.url}
                  alt={uploadResult.fileName}
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                />
              </div>
            )}

            {/* Display uploaded content if it's a video */}
            {uploadResult.fileType.startsWith('video/') && (
              <div className="mt-4">
                <p className="font-medium mb-2">Preview:</p>
                <video
                  src={uploadResult.url}
                  controls
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <h4 className="font-semibold text-blue-900 mb-2">About Walrus Storage</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Decentralized storage on Sui blockchain</li>
          <li>You pay for storage using your connected wallet</li>
          <li>Files are stored for the specified epoch duration</li>
          <li>Testnet: ~1 day per epoch</li>
          <li>Content is publicly accessible via HTTP</li>
        </ul>
      </div>
    </div>
  );
}

export default WalrusUploadComponent;
