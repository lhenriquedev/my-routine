import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { QuickSummaryVM } from "@/src/features/today/types";
import { AppText } from "@/src/ui/app-text";

interface QuickSummaryRowProps {
  summary: QuickSummaryVM;
}

export function QuickSummaryRow({ summary }: QuickSummaryRowProps) {
  return (
    <View style={styles.row}>
      <SummaryPill
        icon="water"
        accentColor="#76bcff"
        label={`${summary.water.current}/${summary.water.goal} ml`}
      />
      <SummaryPill
        icon="checkmark-done"
        accentColor="#4be491"
        label={`${summary.habits.completed}/${summary.habits.total} habits`}
      />
      <SummaryPill
        icon="bandage"
        accentColor="#f39b9b"
        label={
          summary.symptoms.count > 0
            ? `${summary.symptoms.count} symptom${summary.symptoms.count > 1 ? "s" : ""}`
            : "No symptoms"
        }
      />
    </View>
  );
}

interface SummaryPillProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accentColor: string;
}

function SummaryPill({ icon, label, accentColor }: SummaryPillProps) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={16} color={accentColor} />
      <AppText variant="caption" style={styles.pillLabel}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f4d3c",
    backgroundColor: "#0b291f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 6,
  },
  pillLabel: {
    color: "#c6d9d0",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
