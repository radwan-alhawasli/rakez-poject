/**
 * Performance monitoring and optimization utilities
 */

/**
 * Log performance metrics to console in development
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 */
export function logMetric(name, value) {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
  }
}

/**
 * Measure execution time of a function
 * @template T
 * @param {string} name - Name of the measurement
 * @param {() => T} fn - Function to measure
 * @returns {T}
 */
export function measure(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  logMetric(name, end - start);
  return result;
}

/**
 * Measure execution time of an async function
 * @template T
 * @param {string} name - Name of the measurement
 * @param {() => Promise<T>} fn - Async function to measure
 * @returns {Promise<T>}
 */
export async function measureAsync(name, fn) {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    logMetric(name, end - start);
    return result;
  } catch (error) {
    const end = performance.now();
    logMetric(`${name} (Failed)`, end - start);
    throw error;
  }
}

/**
 * Report Web Vitals
 * @param {any} metric - Metric object from web-vitals
 */
export function reportWebVitals(metric) {
  if (import.meta.env.DEV) {
    console.log(metric);
  }
  // Here you could send metrics to an analytics endpoint
}
