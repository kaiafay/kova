/**
 * Parses a date string in M/D/YYYY format (Wells Fargo CSV) into YYYY-MM-DD.
 * Returns null for invalid or out-of-range input.
 */
export function parseWFDate(str: string): string | null {
  const clean = str.replace(/"/g, "").trim();
  const parts = clean.split("/");
  if (parts.length !== 3) return null;
  const mo = parseInt(parts[0], 10);
  const dy = parseInt(parts[1], 10);
  const yr = parseInt(parts[2], 10);
  if (isNaN(mo) || isNaN(dy) || isNaN(yr)) return null;
  if (mo < 1 || mo > 12 || dy < 1 || dy > 31 || yr < 2000 || yr > 2100) return null;
  return `${yr}-${String(mo).padStart(2, "0")}-${String(dy).padStart(2, "0")}`;
}

/**
 * Parses a YYYY-MM string into { year, month } with range validation.
 * Returns null if the value is malformed or out of range.
 */
export function parseYearMonth(str: string): { year: number; month: number } | null {
  const parts = str.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  if (!year || !month || isNaN(year) || isNaN(month)) return null;
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return { year, month };
}
