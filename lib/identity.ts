import { Platform } from "react-native";

const COOKIE_NAME = "person_id";
const SHOW_OTHERS_KEY = "show_others";

export function getIdentity(): string | null {
  if (Platform.OS !== "web") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setIdentity(personId: string): void {
  if (Platform.OS !== "web") return;
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(personId)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearIdentity(): void {
  if (Platform.OS !== "web") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getShowOthers(): boolean {
  if (Platform.OS !== "web") return true;
  try {
    const val = localStorage.getItem(SHOW_OTHERS_KEY);
    return val !== "false";
  } catch {
    return true;
  }
}

export function setShowOthers(show: boolean): void {
  if (Platform.OS !== "web") return;
  try {
    localStorage.setItem(SHOW_OTHERS_KEY, String(show));
  } catch {}
}
