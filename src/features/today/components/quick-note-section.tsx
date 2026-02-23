import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { SectionCard } from "@/src/features/today/components/section-card";
import { AppText } from "@/src/ui/app-text";
import { TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER } from "@/src/ui/typography";

interface QuickNoteSectionProps {
  savedNote: string;
  isSaving: boolean;
  onSave: (note: string) => void;
}

export function QuickNoteSection({
  savedNote,
  isSaving,
  onSave,
}: QuickNoteSectionProps) {
  const [draft, setDraft] = useState(savedNote);

  useEffect(() => {
    setDraft(savedNote);
  }, [savedNote]);

  const hasChanges = draft !== savedNote;

  return (
    <SectionCard.Root>
      <SectionCard.Header>
        <View style={styles.titleRow}>
          <Ionicons name="create" size={20} color="#f4d66e" />
          <SectionCard.Title>Notes</SectionCard.Title>
        </View>
      </SectionCard.Header>
      <SectionCard.Body>
        {savedNote.trim().length === 0 ? (
          <View style={styles.emptyStateRow}>
            <Ionicons name="bulb-outline" size={18} color="#f4d66e" />
            <AppText variant="body" style={styles.emptyStateText}>
              No notes yet. Add a quick observation.
            </AppText>
          </View>
        ) : null}

        <TextInput
          testID="quick-note-input"
          value={draft}
          onChangeText={setDraft}
          style={styles.input}
          multiline
          placeholder="Add a quick note about your day..."
          placeholderTextColor="#79958b"
          allowFontScaling
          maxFontSizeMultiplier={TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER.input}
        />
      </SectionCard.Body>
      <SectionCard.Footer>
        <AppText variant="caption" style={styles.hint}>
          Short context, no need for long journaling.
        </AppText>
        <Pressable
          testID="note-save-button"
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          onPress={() => onSave(draft)}
          disabled={!hasChanges || isSaving}
        >
          <AppText variant="button" style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save"}
          </AppText>
        </Pressable>
      </SectionCard.Footer>
    </SectionCard.Root>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#295040",
    backgroundColor: "#0c271f",
    color: "#e8f2ec",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    textAlignVertical: "top",
  },
  emptyStateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4f4a24",
    backgroundColor: "#2a2714",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  emptyStateText: {
    flex: 1,
    color: "#d8c889",
    fontSize: 14,
  },
  hint: {
    flex: 1,
    color: "#8ba89f",
    fontSize: 14,
    marginRight: 12,
  },
  saveButton: {
    borderRadius: 999,
    backgroundColor: "#37e389",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  saveButtonDisabled: {
    backgroundColor: "#2b6c4b",
  },
  saveButtonText: {
    color: "#062e18",
    fontSize: 16,
    fontWeight: "700",
  },
});
