import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, useTheme, Appbar, Surface, Divider, Switch } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAppContext } from "./_layout";
import { updatePerson, type Person } from "@/lib/api";

const COLORS = [
  "#1B6EF3",
  "#E91E63",
  "#FF9800",
  "#4CAF50",
  "#9C27B0",
  "#00BCD4",
  "#FF5722",
  "#607D8B",
];

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { currentPerson, refreshPersons, showOthers, toggleShowOthers } = useAppContext();

  const [name, setName] = useState(currentPerson?.name || "");
  const [color, setColor] = useState(currentPerson?.color || COLORS[0]);
  const [icsUrl, setIcsUrl] = useState(currentPerson?.ics_url || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (currentPerson) {
      setName(currentPerson.name);
      setColor(currentPerson.color);
      setIcsUrl(currentPerson.ics_url || "");
    }
  }, [currentPerson]);

  const handleSave = async () => {
    if (!currentPerson) return;
    setSaving(true);
    setMessage("");
    try {
      await updatePerson(currentPerson.id, {
        name: name.trim(),
        color,
        ics_url: icsUrl.trim() || null,
      });
      await refreshPersons();
      setMessage("Saved!");
    } catch (e: any) {
      setMessage(e.message || "Save failed");
    }
    setSaving(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }} elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]} elevation={0}>
          <Text variant="titleMedium" style={[styles.section, { color: theme.colors.onSurface }]}>
            Your Profile
          </Text>

          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <Text variant="bodyMedium" style={[styles.colorLabel, { color: theme.colors.onSurfaceVariant }]}>
            Your color
          </Text>
          <View style={styles.colorGrid}>
            {COLORS.map((c) => (
              <View
                key={c}
                style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  color === c && { borderWidth: 3, borderColor: theme.colors.onSurface },
                ]}
                onTouchEnd={() => setColor(c)}
              />
            ))}
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={[styles.section, { color: theme.colors.onSurface }]}>
            Calendar Feed
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
            Paste an ICS URL to import busy days automatically. Only busy/free status is shown — event titles are never stored.
          </Text>
          <TextInput
            label="ICS URL"
            value={icsUrl}
            onChangeText={setIcsUrl}
            mode="outlined"
            placeholder="https://calendar.google.com/calendar/ical/..."
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={[styles.section, { color: theme.colors.onSurface }]}>
            Display
          </Text>
          <View style={styles.switchRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
              Show other people's busy days
            </Text>
            <Switch value={showOthers} onValueChange={toggleShowOthers} />
          </View>

          <Divider style={styles.divider} />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !name.trim()}
            style={styles.saveButton}
          >
            Save
          </Button>
          {message ? (
            <Text variant="bodySmall" style={{ color: theme.colors.primary, textAlign: "center", marginTop: 8 }}>
              {message}
            </Text>
          ) : null}
        </Surface>
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
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  card: {
    borderRadius: 24,
    padding: 24,
  },
  section: {
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
  colorLabel: {
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  divider: {
    marginVertical: 24,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
  },
});
