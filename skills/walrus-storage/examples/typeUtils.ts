/**
 * Type Conversion Utilities for Walrus
 *
 * The Walrus SDK returns SharedArrayBuffer-backed Uint8Arrays, which are not
 * compatible with some browser APIs. These utilities handle the conversion.
 */

/**
 * Convert Walrus WASM Uint8Array to standard Uint8Array.
 *
 * The Walrus SDK returns a Uint8Array backed by SharedArrayBuffer,
 * which causes type errors with browser APIs like Blob constructor.
 * This function creates a copy using a standard ArrayBuffer.
 *
 * @param wasmBytes - Uint8Array from Walrus SDK
 * @returns Standard Uint8Array
 */
export function toStandardUint8Array(wasmBytes: Uint8Array): Uint8Array {
  return new Uint8Array(wasmBytes);
}

/**
 * Convert Walrus file bytes to Blob.
 *
 * @param wasmBytes - Uint8Array from Walrus SDK
 * @param contentType - MIME type (e.g., 'image/png')
 * @returns Blob
 */
export function toBlobFromWasm(
  wasmBytes: Uint8Array,
  contentType: string = 'application/octet-stream'
): Blob {
  const standardBytes = toStandardUint8Array(wasmBytes);
  return new Blob([standardBytes], { type: contentType });
}

/**
 * Convert Walrus file bytes to text string.
 *
 * @param wasmBytes - Uint8Array from Walrus SDK
 * @returns Decoded text string
 */
export function toTextFromWasm(wasmBytes: Uint8Array): string {
  const standardBytes = toStandardUint8Array(wasmBytes);
  const decoder = new TextDecoder();
  return decoder.decode(standardBytes);
}

/**
 * Convert Walrus file bytes to JSON object.
 *
 * @param wasmBytes - Uint8Array from Walrus SDK
 * @returns Parsed JSON object
 */
export function toJsonFromWasm<T = any>(wasmBytes: Uint8Array): T {
  const text = toTextFromWasm(wasmBytes);
  return JSON.parse(text);
}

/**
 * Convert Walrus file bytes to base64 string.
 *
 * @param wasmBytes - Uint8Array from Walrus SDK
 * @returns Base64 encoded string
 */
export function toBase64FromWasm(wasmBytes: Uint8Array): string {
  const standardBytes = toStandardUint8Array(wasmBytes);
  let binary = '';
  for (let i = 0; i < standardBytes.byteLength; i++) {
    binary += String.fromCharCode(standardBytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Walrus file bytes to data URL.
 * Useful for displaying images without creating object URLs.
 *
 * @param wasmBytes - Uint8Array from Walrus SDK
 * @param contentType - MIME type
 * @returns Data URL string
 */
export function toDataUrlFromWasm(
  wasmBytes: Uint8Array,
  contentType: string = 'application/octet-stream'
): string {
  const base64 = toBase64FromWasm(wasmBytes);
  return `data:${contentType};base64,${base64}`;
}

/**
 * Create object URL from Walrus file bytes.
 * Remember to revoke the URL when done: URL.revokeObjectURL(url)
 *
 * @param wasmBytes - Uint8Array from Walrus SDK
 * @param contentType - MIME type
 * @returns Object URL
 */
export function toObjectUrlFromWasm(
  wasmBytes: Uint8Array,
  contentType: string = 'application/octet-stream'
): string {
  const blob = toBlobFromWasm(wasmBytes, contentType);
  return URL.createObjectURL(blob);
}

/**
 * Download file from Walrus bytes.
 * Triggers browser download dialog.
 *
 * @param wasmBytes - Uint8Array from Walrus SDK
 * @param fileName - Name for downloaded file
 * @param contentType - MIME type
 */
export function downloadFromWasm(
  wasmBytes: Uint8Array,
  fileName: string,
  contentType: string = 'application/octet-stream'
): void {
  const blob = toBlobFromWasm(wasmBytes, contentType);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Example usage with Walrus SDK:
 *
 * ```typescript
 * import { walrusClient } from './walrusClient';
 * import { toBlobFromWasm, toJsonFromWasm } from './typeUtils';
 *
 * // Read image
 * const [file] = await walrusClient.walrus.getFiles({ ids: [blobId] });
 * const bytes = await file.bytes();
 * const blob = toBlobFromWasm(bytes, 'image/png');
 * const imageUrl = URL.createObjectURL(blob);
 *
 * // Read JSON metadata
 * const [metadataFile] = await walrusClient.walrus.getFiles({ ids: [metadataBlobId] });
 * const metadataBytes = await metadataFile.bytes();
 * const metadata = toJsonFromWasm(metadataBytes);
 * ```
 */
