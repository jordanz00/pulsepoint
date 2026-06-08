/**
 * NPI Luhn checksum (CMS 10-digit NPI).
 * No PHI — validates identifier format only.
 */
export function normalizeNpi(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10) return null;
  return digits;
}

export function isValidNpi(npi: string): boolean {
  const d = normalizeNpi(npi);
  if (!d) return false;
  const prefixed = "80840" + d;
  let sum = 0;
  let alt = false;
  for (let i = prefixed.length - 1; i >= 0; i--) {
    let n = parseInt(prefixed[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export interface NpiValidationRow {
  row: number;
  npi: string;
  valid: boolean;
  reason?: string;
}

export function validateNpiList(lines: string[]): {
  valid: boolean;
  rows: NpiValidationRow[];
  duplicateCount: number;
  invalidCount: number;
} {
  const rows: NpiValidationRow[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;
  let invalidCount = 0;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const npi = normalizeNpi(trimmed);
    if (!npi) {
      invalidCount++;
      rows.push({ row: idx + 1, npi: trimmed, valid: false, reason: "Must be 10 digits" });
      return;
    }
    if (seen.has(npi)) {
      duplicateCount++;
      rows.push({ row: idx + 1, npi, valid: false, reason: "Duplicate NPI" });
      return;
    }
    seen.add(npi);
    if (!isValidNpi(npi)) {
      invalidCount++;
      rows.push({ row: idx + 1, npi, valid: false, reason: "Failed Luhn checksum" });
      return;
    }
    rows.push({ row: idx + 1, npi, valid: true });
  });

  return {
    valid: invalidCount === 0 && duplicateCount === 0 && rows.length > 0,
    rows,
    duplicateCount,
    invalidCount,
  };
}
