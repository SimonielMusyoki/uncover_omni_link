import { CONFIG } from "@/lib/constants/config";

/**
 * Currency conversion utilities
 */

/**
 * Converts NGN (Nigerian Naira) to KES (Kenyan Shillings)
 * @param ngnAmount Amount in NGN
 * @returns Amount in KES
 */
export function convertNGNToKES(ngnAmount: number): number {
  return ngnAmount * CONFIG.NGN_TO_KES_RATE;
}

/**
 * Converts KES to NGN
 * @param kesAmount Amount in KES
 * @returns Amount in NGN
 */
export function convertKESToNGN(kesAmount: number): number {
  return kesAmount / CONFIG.NGN_TO_KES_RATE;
}

/**
 * Formats a currency amount with the currency symbol
 * @param amount Numeric amount
 * @param currency Currency code (KES, NGN, USD)
 * @returns Formatted string like "KES 1,234.56"
 */
export function formatCurrency(
  amount: number,
  currency: "KES" | "NGN" | "USD",
): string {
  return `${currency} ${amount.toLocaleString()}`;
}

/**
 * Formats a currency amount with 2 decimal places
 * @param amount Numeric amount
 * @param currency Currency code
 * @returns Formatted string with decimals
 */
export function formatCurrencyDetailed(
  amount: number,
  currency: "KES" | "NGN" | "USD",
): string {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
