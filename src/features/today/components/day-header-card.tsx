import { StyleSheet, View } from "react-native";
import { TodayViewModel } from "@/src/features/today/types";
import { SectionCard } from "@/src/features/today/components/section-card";
import { AppText } from "@/src/ui/app-text";

interface DayHeaderCardProps {
  vm: TodayViewModel;
}

function DayStatusEmptyCard({ vm }: DayHeaderCardProps) {
  return (
    <SectionCard.Root style={styles.root}>
      <SectionCard.Body>
        <AppText variant="headline" style={styles.status}>
          {vm.dayStatusLabel}
        </AppText>
        <AppText variant="body" style={styles.description}>
          Start your day with a small action. Log water, habits, symptoms, or a
          quick note.
        </AppText>
      </SectionCard.Body>
    </SectionCard.Root>
  );
}

function DayStatusInProgressCard({ vm }: DayHeaderCardProps) {
  return (
    <SectionCard.Root style={styles.root}>
      <SectionCard.Body>
        <AppText variant="headline" style={styles.status}>
          {vm.dayStatusLabel}
        </AppText>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <AppText variant="caption" style={styles.metaLabel}>
              Last entry
            </AppText>
            <AppText variant="body" style={styles.metaValue}>
              {vm.lastEntryLabel}
            </AppText>
          </View>
          <View style={styles.metaItem}>
            <AppText variant="caption" style={styles.metaLabel}>
              Progress
            </AppText>
            <AppText variant="body" style={styles.metaValue}>
              {vm.progressLabel}
            </AppText>
          </View>
        </View>
      </SectionCard.Body>
    </SectionCard.Root>
  );
}

export function DayHeaderCard({ vm }: DayHeaderCardProps) {
  if (vm.dayStatus === "empty") {
    return <DayStatusEmptyCard vm={vm} />;
  }

  return <DayStatusInProgressCard vm={vm} />;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#11382c",
  },
  status: {
    color: "#3de58c",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
  },
  description: {
    color: "#a3beb4",
    fontSize: 16,
    lineHeight: 27,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
  },
  metaItem: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#0d2b22",
    borderWidth: 1,
    borderColor: "#1e4437",
    padding: 12,
    gap: 3,
  },
  metaLabel: {
    color: "#93aea4",
    fontSize: 13,
    textTransform: "uppercase",
  },
  metaValue: {
    color: "#e3efe8",
    fontSize: 15,
    fontWeight: "600",
  },
});
