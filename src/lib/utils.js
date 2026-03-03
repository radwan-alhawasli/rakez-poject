import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind conflict resolution.
 * Used by shadcn-vue components and UI wrappers.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
