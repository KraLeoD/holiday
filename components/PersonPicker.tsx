import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Modal, Portal, Text, Button, TextInput, useTheme, RadioButton, Surface } from "react-native-paper";
import type { Person } from "@/lib/api";

const DEFAULT_COLORS = [
  "#1B6EF3",
  "#E91E63",
  "#FF9800",
  "#4CAF50",
  "#9C27B0",
  "#00BCD4",
  "#FF5722",
  "#607D8B",
];

interface PersonPickerProps {
  visible: boolean;
  persons: Person[];
  onSelect: (personId: string) => void;
  onCreate: (name: string, color: string) => void;
  onDismiss?: () => void;
  canDismiss?: boolean;
}

export function PersonPicker({ visible, persons, onSelect, onCreate, onDismiss, canDismiss = false }: PersonPickerProps) {
  const theme = useTheme();
  const [mode, setMode] = useState<"select" | "create">(persons.length === 0 ? "create" : "select");
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), selectedColor);
      setName("");
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={canDismiss}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          {mode === "select" ? "Who are you?" : "Create your profile"}
        </Text>

        {mode === "select" && (
          <>
            <ScrollView style={styles.list}>
              <RadioButton.Group onValueChange={setSelectedPerson} value={selectedPerson || ""}>
                {persons.map((person) => (
                  <View key={person.id} style={styles.personRow}>
                    <View style={[styles.colorDot, { backgroundColor: person.color }]} />
                    <RadioButton.Item
                      label={person.name}
                      value={person.id}
                      style={styles.radioItem}
                    />
                  </View>
                ))}
              </RadioButton.Group>
            </ScrollView>
            <View style={styles.actions}>
              <Button mode="text" onPress={() => setMode("create")}>
                Create new
              </Button>
              <Button mode="contained" disabled={!selectedPerson} onPress={() => selectedPerson && onSelect(selectedPerson)}>
                Continue
              </Button>
            </View>
          </>
        )}

        {mode === "create" && (
          <>
            <TextInput
              label="Your name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
            <Text variant="bodyMedium" style={[styles.colorLabel, { color: theme.colors.onSurfaceVariant }]}>
              Pick your color
            </Text>
            <View style={styles.colorGrid}>
              {DEFAULT_COLORS.map((color) => (
                <View
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && { borderWidth: 3, borderColor: theme.colors.onSurface },
                  ]}
                  onTouchEnd={() => setSelectedColor(color)}
                />
              ))}
            </View>
            <View style={styles.actions}>
              {persons.length > 0 && (
                <Button mode="text" onPress={() => setMode("select")}>
                  Pick existing
                </Button>
              )}
              <Button mode="contained" disabled={!name.trim()} onPress={handleCreate}>
                Create
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 24,
    padding: 24,
    borderRadius: 28,
    maxWidth: 400,
    alignSelf: "center",
    width: "90%",
  },
  title: {
    marginBottom: 16,
  },
  list: {
    maxHeight: 250,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  radioItem: {
    flex: 1,
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
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
});
