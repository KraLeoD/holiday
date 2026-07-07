import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { DayCell } from "./DayCell";
import { getMonthDays, getFirstDayOfWeek, formatDate, DAY_LABELS } from "@/lib/dates";
import type { Person, BusyMap } from "@/lib/api";

interface MonthGridProps {
  year: number;
  month: number;
  persons: Person[];
  busyMap: BusyMap;
  currentPersonId: string | null;
  onDayPress: (date: string) => void;
}

export function MonthGrid({ year, month, persons, busyMap, currentPersonId, onDayPress }: MonthGridProps) {
  const theme = useTheme();
  const days = getMonthDays(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = formatDate(new Date());

  const personMap = new Map(persons.map((p) => [p.id, p]));

  // Build lookup: date -> person[]
  const dateBusy = new Map<string, Person[]>();
  for (const [personId, dates] of Object.entries(busyMap)) {
    const person = personMap.get(personId);
    if (!person) continue;
    for (const date of dates) {
      if (!dateBusy.has(date)) dateBusy.set(date, []);
      dateBusy.get(date)!.push(person);
    }
  }

  // Build rows (weeks)
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (const d of days) cells.push(d.getDate());
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={styles.headerCell}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {label}
            </Text>
          </View>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.row}>
          {week.map((day, di) => {
            const dateStr = day ? formatDate(new Date(year, month, day)) : "";
            const busyPersons = day ? dateBusy.get(dateStr) || [] : [];
            const isOwnBusy = currentPersonId
              ? busyPersons.some((p) => p.id === currentPersonId)
              : false;

            return (
              <DayCell
                key={di}
                day={day}
                isToday={dateStr === today}
                busyPersons={busyPersons}
                isOwnBusy={isOwnBusy}
                onPress={day ? () => onDayPress(dateStr) : undefined}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
  },
});
