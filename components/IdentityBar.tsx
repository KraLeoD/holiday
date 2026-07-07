import React from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Text, useTheme, Menu, IconButton } from "react-native-paper";
import type { Person } from "@/lib/api";

interface IdentityBarProps {
  person: Person | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSwitch: () => void;
  onSettings: () => void;
}

export function IdentityBar({ person, darkMode, onToggleDarkMode, onSwitch, onSettings }: IdentityBarProps) {
  const theme = useTheme();

  return (
    <Appbar.Header
      style={{ backgroundColor: theme.colors.surface }}
      elevated
    >
      <Appbar.Content
        title="Holiday Calendar"
        titleStyle={{ fontWeight: "700" }}
      />
      {person && (
        <View style={styles.personChip}>
          <View style={[styles.dot, { backgroundColor: person.color }]} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            {person.name}
          </Text>
        </View>
      )}
      <Appbar.Action icon={darkMode ? "white-balance-sunny" : "moon-waning-crescent"} onPress={onToggleDarkMode} />
      <Appbar.Action icon="cog" onPress={onSettings} />
      <Appbar.Action icon="account-switch" onPress={onSwitch} />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  personChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
