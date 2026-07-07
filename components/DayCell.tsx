import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import type { Person } from "@/lib/api";

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  busyPersons: Person[];
  isOwnBusy: boolean;
  onPress?: () => void;
}

export function DayCell({ day, isToday, busyPersons, isOwnBusy, onPress }: DayCellProps) {
  const theme = useTheme();

  if (day === null) {
    return <View style={styles.cell} />;
  }

  const hasBusy = busyPersons.length > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cell,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          borderWidth: isToday ? 2 : 1,
          borderColor: isToday ? theme.colors.primary : theme.colors.outlineVariant,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        variant="bodySmall"
        style={[
          styles.dayNumber,
          {
            color: isToday ? theme.colors.primary : theme.colors.onSurface,
            fontWeight: isToday ? "700" : "400",
          },
        ]}
      >
        {day}
      </Text>
      {hasBusy && (
        <View style={styles.barsContainer}>
          {busyPersons.map((person) => (
            <View
              key={person.id}
              style={[
                styles.bar,
                {
                  backgroundColor: person.color,
                  height: Math.max(4, 20 / busyPersons.length),
                },
              ]}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    overflow: "hidden",
  },
  dayNumber: {
    fontSize: 12,
    marginBottom: 2,
  },
  barsContainer: {
    flex: 1,
    width: "80%",
    justifyContent: "center",
    gap: 2,
    paddingBottom: 4,
  },
  bar: {
    width: "100%",
    borderRadius: 3,
    minHeight: 4,
  },
});
