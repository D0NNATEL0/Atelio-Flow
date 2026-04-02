"use client";

export type CurrentUserScope = {
  id: string;
  email: string;
  fullName: string;
};

const USER_SCOPE_KEY = "atelio_current_user_v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadCurrentUserScope(): CurrentUserScope | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(USER_SCOPE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CurrentUserScope;
  } catch {
    return null;
  }
}

export function saveCurrentUserScope(scope: CurrentUserScope | null) {
  if (!canUseStorage()) return;

  if (!scope) {
    window.localStorage.removeItem(USER_SCOPE_KEY);
  } else {
    window.localStorage.setItem(USER_SCOPE_KEY, JSON.stringify(scope));
  }

  window.dispatchEvent(new CustomEvent("atelio-user-scope-updated"));
}

export function clearCurrentUserScope() {
  saveCurrentUserScope(null);
}

export function hasAuthenticatedUserScope() {
  return loadCurrentUserScope() !== null;
}

export function getScopedStorageKey(baseKey: string) {
  const scope = loadCurrentUserScope();
  return scope ? `${baseKey}:${scope.id}` : `${baseKey}:guest`;
}

export function getLegacyFallbackStorageKey(baseKey: string) {
  return loadCurrentUserScope() ? null : baseKey;
}
