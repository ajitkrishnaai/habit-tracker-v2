/**
 * Metadata Entity Type Definition
 *
 * Stores application metadata in Google Sheets.
 */

export interface Metadata {
  sheet_version: string; // Schema version (e.g., "1.0")
  last_sync: string; // ISO 8601 datetime of last sync
  user_id: string; // Google user ID (sub claim)
  sheet_id: string; // Google Sheets ID
}

/**
 * Type guard to check if an object is valid Metadata
 */
export const isMetadata = (obj: any): obj is Metadata => { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.sheet_version === 'string' &&
    typeof obj.last_sync === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.sheet_id === 'string'
  );
};
