const BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export interface Person {
  id: string;
  name: string;
  color: string;
  ics_url?: string | null;
}

export interface BusyEntry {
  date: string;
  manual: boolean;
}

export type BusyMap = Record<string, BusyEntry[]>; // person_id -> entries

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function getPersons(): Promise<Person[]> {
  return request("/api/persons");
}

export function createPerson(name: string, color: string): Promise<Person> {
  return request("/api/persons", {
    method: "POST",
    body: JSON.stringify({ name, color }),
  });
}

export function updatePerson(id: string, data: Partial<Pick<Person, "name" | "color" | "ics_url">>): Promise<Person> {
  return request(`/api/persons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deletePerson(id: string): Promise<void> {
  return request(`/api/persons/${id}`, { method: "DELETE" });
}

export function getBusyDays(from: string, to: string): Promise<BusyMap> {
  return request(`/api/busy?from=${from}&to=${to}`);
}

export function addBusyDays(personId: string, dates: string[]): Promise<void> {
  return request(`/api/persons/${personId}/busy-days`, {
    method: "PUT",
    body: JSON.stringify({ dates }),
  });
}

export function removeBusyDay(personId: string, date: string): Promise<void> {
  return request(`/api/persons/${personId}/busy-days/${date}`, {
    method: "DELETE",
  });
}
