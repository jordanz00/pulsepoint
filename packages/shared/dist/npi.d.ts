/**
 * NPI Luhn checksum (CMS 10-digit NPI).
 * No PHI — validates identifier format only.
 */
export declare function normalizeNpi(raw: string): string | null;
export declare function isValidNpi(npi: string): boolean;
export interface NpiValidationRow {
    row: number;
    npi: string;
    valid: boolean;
    reason?: string;
}
export declare function validateNpiList(lines: string[]): {
    valid: boolean;
    rows: NpiValidationRow[];
    duplicateCount: number;
    invalidCount: number;
};
