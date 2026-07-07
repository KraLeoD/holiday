import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { lightTheme, darkTheme } from "@/lib/theme";
import { getIdentity, setIdentity, clearIdentity, getShowOthers, setShowOthers as persistShowOthers } from "@/lib/identity";
import { getPersons, createPerson, type Person } from "@/lib/api";
import { PersonPicker } from "@/components/PersonPicker";

interface AppContextType {
  persons: Person[];
  currentPerson: Person | null;
  refreshPersons: () => Promise<void>;
  switchPerson: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  showOthers: boolean;
  toggleShowOthers: () => void;
}

export const AppContext = createContext<AppContextType>({
  persons: [],
  currentPerson: null,
  refreshPersons: async () => {},
  switchPerson: () => {},
  darkMode: false,
  toggleDarkMode: () => {},
  showOthers: true,
  toggleShowOthers: () => {},
});

export function useAppContext() {
  return useContext(AppContext);
}

export default function RootLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [showOthers, setShowOthers] = useState(true);
  const [persons, setPersons] = useState<Person[]>([]);
  const [currentPerson, setCurrentPerson] = useState<Person | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const theme = darkMode ? darkTheme : lightTheme;

  const refreshPersons = useCallback(async () => {
    try {
      const data = await getPersons();
      setPersons(data);
      setCurrentPerson((prev) => {
        if (!prev) return prev;
        const updated = data.find((p) => p.id === prev.id);
        return updated || prev;
      });
      return data;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    setShowOthers(getShowOthers());
  }, []);

  useEffect(() => {
    (async () => {
      const data = await refreshPersons();
      const savedId = getIdentity();
      if (savedId) {
        const found = (data as Person[]).find((p) => p.id === savedId);
        if (found) {
          setCurrentPerson(found);
          setInitialized(true);
          return;
        }
      }
      setShowPicker(true);
      setInitialized(true);
    })();
  }, []);

  const handleSelect = (personId: string) => {
    const person = persons.find((p) => p.id === personId);
    if (person) {
      setIdentity(personId);
      setCurrentPerson(person);
      setShowPicker(false);
    }
  };

  const handleCreate = async (name: string, color: string) => {
    try {
      const person = await createPerson(name, color);
      setIdentity(person.id);
      setCurrentPerson(person);
      setPersons((prev) => [...prev, person]);
      setShowPicker(false);
    } catch (e: any) {
      alert(e.message || "Failed to create profile");
    }
  };

  const switchPerson = () => {
    setShowPicker(true);
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const toggleShowOthers = () => {
    setShowOthers((prev) => {
      const next = !prev;
      persistShowOthers(next);
      return next;
    });
  };

  if (!initialized) return null;

  return (
    <PaperProvider theme={theme}>
      <AppContext.Provider
        value={{ persons, currentPerson, refreshPersons, switchPerson, darkMode, toggleDarkMode, showOthers, toggleShowOthers }}
      >
        <StatusBar style={darkMode ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
        <PersonPicker
          visible={showPicker}
          persons={persons}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onDismiss={currentPerson ? () => setShowPicker(false) : undefined}
          canDismiss={!!currentPerson}
        />
      </AppContext.Provider>
    </PaperProvider>
  );
}
