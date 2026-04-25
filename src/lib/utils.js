import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind conflict resolution.
 * Used by shadcn-vue components and UI wrappers.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Debounce function to limit how often a function can be called.
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
