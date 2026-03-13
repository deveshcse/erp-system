/**
 * Token storage strategy:
 *
 * - Access token  → module-level memory variable (never in storage)
 *   Fastest, fully XSS-safe, cleared on full page reload.
 *
 * - Refresh token → sessionStorage
 *   Backend returns it in the response body (not a httpOnly cookie).
 *   sessionStorage is cleared when the browser tab is closed, and is
 *   not accessible cross-origin. Safer than localStorage.
 */

const REFRESH_KEY = 'erp_refresh';
let _accessToken = null;

export const tokenManager = {
  // ── Access token (memory only) ──────────────────────────
  get: () => _accessToken,
  set: (token) => { _accessToken = token; },
  clear: () => { _accessToken = null; },

  // ── Clear everything ────────────────────────────────────
  clearAll: () => {
    _accessToken = null;
  },
};
