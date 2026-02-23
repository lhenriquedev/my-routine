import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { SectionCard } from "@/src/features/today/components/section-card";
import { SymptomLogEntry } from "@/src/features/today/types";
import { AppText } from "@/src/ui/app-text";

interface SymptomsSectionProps {
  lastSymptom: SymptomLogEntry | null;
  onOpenLogSymptom: () => void;
}

interface SharedProps {
  onOpenLogSymptom: () => void;
}

function SymptomsEmptyState({ onOpenLogSymptom }: SharedProps) {
  return (
    <SectionCard.Body>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="happy-outline" size={24} color="#6f8c82" />
      </View>
      <AppText variant="body" style={styles.emptyText}>
        No symptoms today. Log if anything changes.
      </AppText>
      <Pressable
        testID="symptom-log-button"
        onPress={onOpenLogSymptom}
        style={styles.logButton}
      >
        <Ionicons name="add-circle" size={22} color="#33dd85" />
        <AppText variant="button" style={styles.logButtonText}>
          Log Symptom
        </AppText>
      </Pressable>
    </SectionCard.Body>
  );
}

function SymptomsLatestEntry({
  symptom,
  onOpenLogSymptom,
}: { symptom: SymptomLogEntry } & SharedProps) {
  const timeLabel = new Date(symptom.loggedAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <SectionCard.Body>
      <View style={styles.entryCard}>
        <View>
          <AppText variant="headline" style={styles.entryName}>
            {symptom.symptomName}
          </AppText>
          <AppText variant="body" style={styles.entryIntensity}>
            Intensity: {symptom.intensity}/5
          </AppText>
          {symptom.note ? (
            <AppText variant="body" style={styles.entryNote}>
              {symptom.note}
            </AppText>
          ) : null}
        </View>
        <AppText variant="meta" style={styles.entryTime}>
          {timeLabel}
        </AppText>
      </View>
      <Pressable
        testID="symptom-log-button"
        onPress={onOpenLogSymptom}
        style={styles.logButtonSecondary}
      >
        <Ionicons name="add" size={22} color="#33dd85" />
        <AppText variant="button" style={styles.logButtonText}>
          Log another
        </AppText>
      </Pressable>
    </SectionCard.Body>
  );
}

export function SymptomsSection({
  lastSymptom,
  onOpenLogSymptom,
}: SymptomsSectionProps) {
  return (
    <SectionCard.Root>
      <SectionCard.Header>
        <View style={styles.titleRow}>
          <Ionicons name="bandage" size={22} color="#f28b8b" />
          <SectionCard.Title>Symptoms</SectionCard.Title>
        </View>
      </SectionCard.Header>
      {lastSymptom ? (
        <SymptomsLatestEntry
          symptom={lastSymptom}
          onOpenLogSymptom={onOpenLogSymptom}
        />
      ) : (
        <SymptomsEmptyState onOpenLogSymptom={onOpenLogSymptom} />
      )}
    </SectionCard.Root>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyStateIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#163c30",
  },
  emptyText: {
    textAlign: "center",
    color: "#9ab3aa",
    fontSize: 16,
  },
  logButton: {
    marginTop: 6,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "#1b2e46",
    borderWidth: 1,
    borderColor: "#2d4d73",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logButtonSecondary: {
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#163c30",
    borderWidth: 1,
    borderColor: "#2a5948",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logButtonText: {
    color: "#33dd85",
    fontSize: 16,
    fontWeight: "600",
  },
  entryCard: {
    borderWidth: 1,
    borderColor: "#2a5243",
    borderRadius: 14,
    backgroundColor: "#0c271f",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryName: {
    color: "#f0f6f3",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  entryIntensity: {
    marginTop: 4,
    color: "#8db2a3",
    fontSize: 16,
  },
  entryNote: {
    marginTop: 6,
    color: "#b6cbc2",
    fontSize: 15,
    maxWidth: 190,
  },
  entryTime: {
    color: "#95b0a6",
    fontSize: 16,
    fontWeight: "600",
  },
});
