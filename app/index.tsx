import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, IconButton, useTheme, Surface, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAppContext } from "./_layout";
import { IdentityBar } from "@/components/IdentityBar";
import { MonthGrid } from "@/components/MonthGrid";
import { getBusyDays, addBusyDays, removeBusyDay, type BusyMap } from "@/lib/api";
import { getMonthRange, MONTH_NAMES, formatDate } from "@/lib/dates";

export default function CalendarScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { persons, currentPerson, switchPerson, darkMode, toggleDarkMode, showOthers } = useAppContext();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [busyMap, setBusyMap] = useState<BusyMap>({});

  const fetchBusy = useCallback(async () => {
    const { from, to } = getMonthRange(year, month);
    try {
      const data = await getBusyDays(from, to);
      setBusyMap(data);
    } catch {
      // Silently fail, will retry on navigation
    }
  }, [year, month]);

  useEffect(() => {
    fetchBusy();
  }, [fetchBusy]);

  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goPrev = () => {
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();
    if (year === nowYear && month === nowMonth) return;
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const canGoPrev = !(year === now.getFullYear() && month === now.getMonth());
  const maxDate = new Date(now.getFullYear(), now.getMonth() + 12, 0);
  const canGoNext = new Date(year, month + 1, 1) <= maxDate;

  const handleDayPress = async (dateStr: string) => {
    if (!currentPerson) return;
    const personEntries = busyMap[currentPerson.id] || [];
    const entry = personEntries.find((e) => e.date === dateStr);
    const isManualBusy = entry?.manual === true;
    const isBusy = !!entry;

    try {
      if (isManualBusy) {
        await removeBusyDay(currentPerson.id, dateStr);
      } else if (!isBusy) {
        await addBusyDays(currentPerson.id, [dateStr]);
      }
      // If busy from ICS only (not manual), tapping does nothing — can't remove ICS days
      await fetchBusy();
    } catch {
      // Silently fail
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <IdentityBar
        person={currentPerson}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onSwitch={switchPerson}
        onSettings={() => router.push("/settings")}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]} elevation={0}>
          <View style={styles.monthHeader}>
            <IconButton icon="chevron-left" onPress={goPrev} disabled={!canGoPrev} />
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: "600" }}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <IconButton icon="chevron-right" onPress={goNext} disabled={!canGoNext} />
          </View>
          <MonthGrid
            year={year}
            month={month}
            persons={showOthers ? persons : persons.filter((p) => p.id === currentPerson?.id)}
            busyMap={showOthers ? busyMap : Object.fromEntries(
              Object.entries(busyMap).filter(([id]) => id === currentPerson?.id)
            )}
            currentPersonId={currentPerson?.id || null}
            onDayPress={handleDayPress}
          />
        </Surface>

        <View style={styles.legend}>
          {(showOthers ? persons : persons.filter((p) => p.id === currentPerson?.id)).map((person) => (
            <Chip
              key={person.id}
              style={[styles.legendChip, { borderColor: person.color }]}
              textStyle={{ fontSize: 12 }}
              compact
            >
              <View style={[styles.legendDot, { backgroundColor: person.color }]} />
              {"  "}
              {person.name}
            </Chip>
          ))}
        </View>

        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", marginTop: 8 }}>
          Tap a day to mark yourself busy/free
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  card: {
    borderRadius: 24,
    padding: 8,
    overflow: "hidden",
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
    justifyContent: "center",
  },
  legendChip: {
    borderWidth: 1,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
