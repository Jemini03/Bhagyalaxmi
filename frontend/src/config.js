/**
 * Application Configuration
 * Automatically uses VITE_API_URL if configured (e.g. in Vercel or production),
 * or falls back to local backend at http://localhost:5001.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5001'
).replace(/\/+$/, ''); // Strip trailing slashes
