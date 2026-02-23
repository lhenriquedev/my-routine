import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { NextBestActionVM } from "@/src/features/today/types";
import { SectionCard } from "@/src/features/today/components/section-card";
import { AppText } from "@/src/ui/app-text";

interface NextBestActionCardProps {
  action: NextBestActionVM;
  onPress: () => void;
}

const iconByAction: Record<NextBestActionVM["action"], "water" | "checkmark-circle" | "bandage" | "create" | "arrow-forward-circle"> = {
  add_water: "water",
  complete_habit: "checkmark-circle",
  log_symptom: "bandage",
  add_note: "create",
  go_review: "arrow-forward-circle",
};

export function NextBestActionCard({ action, onPress }: NextBestActionCardProps) {
  return (
    <SectionCard.Root style={styles.root}>
      <SectionCard.Body>
        <View style={styles.labelRow}>
          <Ionicons name={iconByAction[action.action]} size={18} color="#9beec2" />
          <AppText variant="caption" style={styles.badgeLabel}>
            Next best action
          </AppText>
        </View>

        <AppText variant="headline" style={styles.title}>
          {action.title}
        </AppText>
        <AppText variant="body" style={styles.subtitle}>
          {action.subtitle}
        </AppText>
      </SectionCard.Body>

      <Pressable testID="next-best-action-button" style={styles.button} onPress={onPress}>
        <AppText variant="button" style={styles.buttonText}>
          {action.buttonLabel}
        </AppText>
        <Ionicons name="arrow-forward" size={20} color="#052814" />
      </Pressable>
    </SectionCard.Root>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#124131",
    borderColor: "#2a664f",
  },
  labelRow: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#183f31",
    borderWidth: 1,
    borderColor: "#2f7256",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeLabel: {
    color: "#9beec2",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    color: "#e9f7f0",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
  },
  subtitle: {
    color: "#a7c6b9",
    fontSize: 15,
  },
  button: {
    borderRadius: 14,
    backgroundColor: "#37e389",
    borderWidth: 1,
    borderColor: "#5ceda4",
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    color: "#052814",
    fontSize: 16,
    fontWeight: "700",
  },
});
