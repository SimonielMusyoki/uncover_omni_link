/**
 * Time utility functions
 */

/**
 * Converts a timestamp to a human-readable "time ago" format
 * @param timestamp ISO timestamp string
 * @returns Formatted string like "5m ago", "3h ago", "2d ago"
 */
export function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Formats a date to a readable string
 * @param date Date object or ISO string
 * @returns Formatted string like "Jan 15, 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date to a short string
 * @param date Date object or ISO string
 * @returns Formatted string like "01/15/26"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Formats a date to ISO date string (YYYY-MM-DD)
 * @param date Date object or ISO string
 * @returns ISO date string
 */
export function formatISODate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}
