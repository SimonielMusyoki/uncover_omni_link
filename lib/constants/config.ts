// ==================== APPLICATION CONFIGURATION ====================

/**
 * Centralized configuration constants for the application
 * Keeps magic numbers and repeated values in one place for easier maintenance
 */

export const CONFIG = {
  // Toast notification settings
  TOAST_DURATION: 4000, // milliseconds

  // Currency conversion rates
  NGN_TO_KES_RATE: 0.0054,

  // File upload limits
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB in bytes

  // UI simulation delays (for development)
  UPLOAD_SIMULATE_DELAY: 800, // milliseconds
  SYNC_DELAYS: {
    odoo: 1500, // milliseconds
    quickbooks: 2500, // milliseconds
  },

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,

  // Activity log limits
  MAX_ACTIVITY_LOG_ITEMS: 50,
  DASHBOARD_ACTIVITY_ITEMS: 10,
} as const;

/**
 * Date range presets for filtering
 */
export const DATE_RANGES = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  THIS_WEEK: "thisWeek",
  LAST_WEEK: "lastWeek",
  THIS_MONTH: "thisMonth",
  LAST_MONTH: "lastMonth",
  THIS_YEAR: "thisYear",
  LAST_YEAR: "lastYear",
} as const;

export type DateRange = (typeof DATE_RANGES)[keyof typeof DATE_RANGES];
