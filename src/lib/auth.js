// Tiny static auth helper.
// Persists the chosen role + identifier in localStorage so the dashboard
// shows the right experience after login/signup.
// When backend wires up, replace these reads/writes with real API + tokens.

const KEY = "expglo:auth";

const VALID_ROLES = ["founder", "investor", "admin"];

export function getAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !VALID_ROLES.includes(parsed.role)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAuth({ role, identifier }) {
  if (!VALID_ROLES.includes(role)) return;
  localStorage.setItem(
    KEY,
    JSON.stringify({
      role,
      identifier: identifier || "",
      loggedInAt: Date.now(),
    }),
  );
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function getRole() {
  return getAuth()?.role || null;
}

export function isLoggedIn() {
  return !!getAuth();
}
