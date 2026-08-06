/**
 * UNIBUD Navigation OS — Deep Link Handler
 *
 * Resolves incoming deep links (web paths or native scheme URLs)
 * and routes the user to the correct screen.
 *
 * Also exposes a useDeepLink hook for components that need to
 * generate and share deep links.
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buildDeepLink, parseSchemeDeepLink, generateOGMeta } from "./deepLinkRegistry";
import { resolveRoute } from "./routeRegistry";
import { recordDeepLinkOpen } from "./navigationAnalyticsStore";

// ─── Resolution ───────────────────────────────────────────────────────────────

/**
 * Resolve a deep link URL to a web path.
 * Handles:
 *   - Web paths:          "/course/abc" → "/course/abc"
 *   - Native scheme URLs: "unibud://course/abc" → "/course/abc"
 *   - External URLs:      "https://app.unibud.com/course/abc" → "/course/abc"
 *
 * @param {string} url
 * @returns {string|null}  Web path or null if unresolvable
 */
export function resolveDeepLink(url) {
  if (!url) return null;

  // Native scheme
  if (url.startsWith("unibud://")) {
    return parseSchemeDeepLink(url);
  }

  // Full web URL
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "app.unibud.com" || parsed.hostname === "unibud.com") {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    // Not a valid absolute URL — treat as path
  }

  // Bare path
  if (url.startsWith("/")) return url;

  return null;
}

/**
 * Check whether a URL is a valid UNIBUD deep link.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isDeepLink(url) {
  const path = resolveDeepLink(url);
  if (!path) return false;
  return !!resolveRoute(path);
}

// ─── React hook ───────────────────────────────────────────────────────────────

/**
 * useDeepLink — hook for generating and navigating to deep links.
 *
 * @returns {{
 *   generateLink: (type: string, params: Object) => string|null,
 *   generateOG: (type: string, params: Object, data: Object) => Object|null,
 *   navigateToLink: (url: string) => void,
 *   shareLink: (type: string, params: Object, data: Object) => Promise<void>,
 * }}
 */
export function useDeepLink() {
  const navigate = useNavigate();

  /** Generate a web path deep link for an entity. */
  const generateLink = useCallback((type, params = {}) => {
    return buildDeepLink(type, params);
  }, []);

  /** Generate Open Graph metadata for sharing. */
  const generateOG = useCallback((type, params = {}, data = {}) => {
    return generateOGMeta(type, params, data);
  }, []);

  /** Navigate to any resolved deep link URL. */
  const navigateToLink = useCallback((url) => {
    const path = resolveDeepLink(url);
    if (!path) {
      console.warn("[DeepLink] Could not resolve:", url);
      return;
    }
    recordDeepLinkOpen(path);
    navigate(path);
  }, [navigate]);

  /**
   * Share a deep link using the Web Share API, falling back to clipboard copy.
   *
   * @param {string} type
   * @param {Object} params
   * @param {Object} data
   */
  const shareLink = useCallback(async (type, params = {}, data = {}) => {
    const path = buildDeepLink(type, params);
    if (!path) return;

    const og = generateOGMeta(type, params, data);
    const url = og?.url || `https://app.unibud.com${path}`;
    const title = og?.title || "UNIBUD";
    const text = og?.description || "Check this out on UNIBUD";

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // User cancelled or clipboard not available — ignore
    }
  }, []);

  return { generateLink, generateOG, navigateToLink, shareLink };
}
