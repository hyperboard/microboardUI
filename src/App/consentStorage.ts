import Cookies from "js-cookie";

export type ConsentChoice = "accepted" | "declined";

const CONSENT_COOKIE = "cookie_consent";
const CONSENT_EXPIRES_DAYS = 182;

/**
 * Keys considered "necessary" — written regardless of consent.
 * These are required for the app to function: auth tokens, theme,
 * active user session, last board, control mode.
 */
export const NECESSARY_STORAGE_KEYS = new Set([
  "ui-theme",
  "currentUser",
  "userId",
  "userColor",
  "controlMode",
  "lastSeenBoard",
  "lastSeenBoardWqs",
]);

/**
 * Keys considered "preferences" — only written when user accepted.
 * These track anonymous usage patterns and board history.
 */
export const PREFERENCE_STORAGE_KEYS = new Set(["anonKey"]);

/** Board-history keys follow the pattern `{host}/createdBoards` and `{host}/visitedBoards`. */
function isBoardHistoryKey(key: string): boolean {
  return key.endsWith("/createdBoards") || key.endsWith("/visitedBoards");
}

export function getConsent(): ConsentChoice | null {
  const value = Cookies.get(CONSENT_COOKIE);
  if (value === "accepted" || value === "declined") return value;
  return null;
}

export function setConsent(choice: ConsentChoice): void {
  Cookies.set(CONSENT_COOKIE, choice, {
    expires: CONSENT_EXPIRES_DAYS,
    path: "/",
  });
}

export function hasConsented(): boolean {
  return getConsent() === "accepted";
}

export function hasDeclined(): boolean {
  return getConsent() === "declined";
}

export function isPreferenceKey(key: string): boolean {
  return PREFERENCE_STORAGE_KEYS.has(key) || isBoardHistoryKey(key);
}

/**
 * Remove all non-necessary localStorage data.
 * Called when user declines or revokes consent.
 */
export function clearPreferenceStorage(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isPreferenceKey(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

/**
 * Guarded localStorage.setItem: skips write for preference keys when user has declined.
 */
export function guardedSetItem(key: string, value: string): void {
  if (isPreferenceKey(key) && !hasConsented()) {
    return;
  }
  localStorage.setItem(key, value);
}

/**
 * Guarded localStorage.getItem: returns null for preference keys when user has declined.
 */
export function guardedGetItem(key: string): string | null {
  if (isPreferenceKey(key) && !hasConsented()) {
    return null;
  }
  return localStorage.getItem(key);
}
