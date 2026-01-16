/**
 * RUT (Rol Único Tributario) validation utilities for Chile
 *
 * A RUT is a unique taxpayer ID in Chile, formatted as: XX.XXX.XXX-Y
 * where Y is the verification digit (0-9 or K)
 */

/**
 * Clean RUT removing all non-alphanumeric characters
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

/**
 * Calculate the verification digit for a RUT
 */
export function calculateVerificationDigit(rutBody: string): string {
  const reversed = rutBody.split("").reverse();
  let sum = 0;
  let multiplier = 2;

  for (const digit of reversed) {
    sum += parseInt(digit, 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);

  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return remainder.toString();
}

/**
 * Validate a Chilean RUT
 * @param rut - RUT string in any format (with or without dots/dash)
 * @returns true if the RUT is valid
 */
export function validateRut(rut: string): boolean {
  if (!rut) return false;

  const cleaned = cleanRut(rut);

  // RUT must be at least 8 digits (7 body + 1 verification)
  if (cleaned.length < 8 || cleaned.length > 9) {
    return false;
  }

  const body = cleaned.slice(0, -1);
  const verificationDigit = cleaned.slice(-1);

  // Body must be all digits
  if (!/^\d+$/.test(body)) {
    return false;
  }

  // Verification digit must be digit or K
  if (!/^[0-9K]$/.test(verificationDigit)) {
    return false;
  }

  const expectedVerificationDigit = calculateVerificationDigit(body);
  return verificationDigit === expectedVerificationDigit;
}

/**
 * Format a RUT with dots and dash
 * @param rut - RUT string in any format
 * @returns Formatted RUT (e.g., "12.345.678-9")
 */
export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);

  if (cleaned.length < 2) return cleaned;

  const body = cleaned.slice(0, -1);
  const verificationDigit = cleaned.slice(-1);

  // Add dots every 3 digits from right to left
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedBody}-${verificationDigit}`;
}

/**
 * Get just the body of the RUT (without verification digit)
 */
export function getRutBody(rut: string): string {
  const cleaned = cleanRut(rut);
  return cleaned.slice(0, -1);
}

/**
 * Get just the verification digit
 */
export function getVerificationDigit(rut: string): string {
  const cleaned = cleanRut(rut);
  return cleaned.slice(-1);
}

/**
 * Validate and format RUT in one step
 * Returns null if invalid, formatted RUT if valid
 */
export function validateAndFormatRut(rut: string): string | null {
  if (!validateRut(rut)) return null;
  return formatRut(rut);
}
