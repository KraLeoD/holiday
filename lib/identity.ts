import { Platform } from "react-native";

const COOKIE_NAME = "person_id";

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
