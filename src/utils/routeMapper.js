/**
 * Maps backend route strings to Vue Router paths.
 * Backend may return e.g. "api/marketing/leads" or "/api/marketing/leads".
 */

/**
 * Normalize backend route to a path suitable for router.push()
 * @param {string} route - Backend route (e.g. "api/marketing/leads", "/api/marketing/leads")
 * @returns {string} Vue path (e.g. "/marketing/leads")
 */
export function backendRouteToVuePath(route) {
  if (typeof route !== 'string' || !route.trim()) return '/';
  let path = route.trim();
  // Remove leading slash
  if (path.startsWith('/')) path = path.slice(1);
  // Strip "api/" prefix (with or without leading slash already removed)
  if (path.toLowerCase().startsWith('api/')) path = path.slice(4);
  if (!path.startsWith('/')) path = '/' + path;
  return path;
}

export default { backendRouteToVuePath };
