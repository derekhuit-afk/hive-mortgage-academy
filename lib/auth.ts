export const AUTH_KEY = "hma_student";

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(student: object) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(student));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}
