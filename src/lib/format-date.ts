const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * "29 Sep 2026". Month names are spelled out here because
 * `toLocaleDateString('en-GB', { month: 'short' })` prints "Sept" for September,
 * which breaks the alignment of the monospace date columns.
 */
export function formatShortDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${day} ${SHORT_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "29 September 2026" */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
