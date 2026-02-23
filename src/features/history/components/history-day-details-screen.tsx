import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHistoryDayQuery } from "@/src/features/history/hooks/use-history-day-query";
import { AppText } from "@/src/ui/app-text";

function formatTimeLabel(isoValue: string): string {
  return new Date(isoValue).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function intensityDots(intensity: 1 | 2 | 3 | 4 | 5): string {
  return "●".repeat(intensity) + "○".repeat(5 - intensity);
}

export function HistoryDayDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const dateKey = typeof params.date === "string" ? params.date : "";
  const historyDayQuery = useHistoryDayQuery(dateKey);

  if (historyDayQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#36e38a" />
          <AppText variant="body" style={styles.stateText}>
            Loading day details...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (historyDayQuery.error || !historyDayQuery.data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stateContainer}>
          <AppText variant="title" style={styles.errorTitle}>
            Could not load this day
          </AppText>
          <AppText variant="body" style={styles.stateText}>
            {historyDayQuery.error?.message ?? "Invalid date."}
          </AppText>
          <Pressable
            onPress={() => historyDayQuery.refetch()}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
          >
            <AppText variant="button" style={styles.primaryButtonText}>
              Retry
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const vm = historyDayQuery.data;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
        >
          <Ionicons name="chevron-back" size={24} color="#deece5" />
        </Pressable>

        <AppText variant="title" style={styles.headerTitle}>
          {vm.dateLabel}
        </AppText>

        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricLabelRow}>
              <Ionicons name="water" size={14} color="#57a9ff" />
              <AppText variant="label" style={styles.metricLabel}>
                Hydration
              </AppText>
            </View>
            <AppText variant="title" style={styles.metricValue}>
              {vm.hydrationValueLabel}
            </AppText>
            <AppText variant="caption" style={styles.metricHint}>
              {vm.hydrationGoalLabel}
            </AppText>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricLabelRow}>
              <Ionicons name="checkmark-circle" size={14} color="#35e488" />
              <AppText variant="label" style={styles.metricLabel}>
                Habits
              </AppText>
            </View>
            <AppText variant="title" style={styles.metricValue}>
              {vm.completedHabitsCount}/{vm.totalHabitsCount}
            </AppText>
            <AppText variant="caption" style={styles.metricHint}>
              {vm.completedHabitsCount === vm.totalHabitsCount
                ? "Perfect day"
                : "Completion tracked"}
            </AppText>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={14} color="#3ae88d" />
            <AppText variant="label" style={styles.insightBadge}>
              {vm.insightTitle}
            </AppText>
          </View>
          <AppText variant="body" style={styles.insightText}>
            {vm.insightBody}
          </AppText>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="title" style={styles.sectionTitle}>
              Hydration Log
            </AppText>
            <AppText variant="caption" style={styles.sectionMeta}>
              {vm.hydrationProgressPercent}%
            </AppText>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(vm.hydrationProgressPercent, 4)}%` },
              ]}
            />
          </View>
          <View style={styles.timelineTicks}>
            {["8A", "12P", "4P", "8P"].map((label) => (
              <AppText key={label} variant="meta" style={styles.timelineLabel}>
                {label}
              </AppText>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <AppText variant="title" style={styles.sectionTitle}>
            Symptoms
          </AppText>

          {vm.symptoms.length === 0 ? (
            <AppText variant="body" style={styles.emptyText}>
              No symptoms logged
            </AppText>
          ) : (
            vm.symptoms.map((symptom) => (
              <View key={symptom.id} style={styles.symptomRow}>
                <View style={styles.symptomMainRow}>
                  <AppText variant="headline" style={styles.symptomName}>
                    {symptom.symptomName}
                  </AppText>
                  <AppText variant="caption" style={styles.symptomIntensity}>
                    {intensityDots(symptom.intensity)}
                  </AppText>
                </View>
                <AppText variant="meta" style={styles.symptomTime}>
                  {formatTimeLabel(symptom.loggedAt)}
                </AppText>
                {symptom.note.trim().length > 0 ? (
                  <View style={styles.symptomNoteWrap}>
                    <AppText variant="caption" style={styles.symptomNote}>
                      {symptom.note}
                    </AppText>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="title" style={styles.sectionTitle}>
              Habits Completed
            </AppText>
            <View style={styles.counterBadge}>
              <AppText variant="caption" style={styles.counterText}>
                {vm.completedHabitsCount}/{vm.totalHabitsCount}
              </AppText>
            </View>
          </View>

          {vm.completedHabitLabels.length === 0 ? (
            <AppText variant="body" style={styles.emptyText}>
              No habits completed
            </AppText>
          ) : (
            vm.completedHabitLabels.map((label) => (
              <View key={label} style={styles.habitRow}>
                <View style={styles.habitIconWrap}>
                  <Ionicons name="checkmark" size={16} color="#022d16" />
                </View>
                <AppText variant="body" style={styles.habitLabel}>
                  {label}
                </AppText>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <AppText variant="title" style={styles.sectionTitle}>
            Evening Journal
          </AppText>
          <AppText variant="body" style={styles.journalText}>
            {vm.journalText}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#031313",
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  stateText: {
    color: "#9eb5ad",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  errorTitle: {
    color: "#ecf6f1",
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 2,
    minHeight: 48,
    minWidth: 128,
    borderRadius: 12,
    backgroundColor: "#37e389",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#033017",
    fontSize: 15,
    fontWeight: "700",
  },
  headerRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#173830",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.74,
  },
  headerTitle: {
    color: "#e8f2ee",
    fontSize: 31,
    lineHeight: 34,
    fontWeight: "700",
  },
  content: {
    padding: 14,
    gap: 10,
    paddingBottom: 30,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#184338",
    backgroundColor: "#0f2d24",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metricLabel: {
    color: "#96aea6",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    color: "#eff7f3",
    fontSize: 36,
    lineHeight: 38,
    fontWeight: "700",
  },
  metricHint: {
    color: "#86a198",
    fontSize: 13,
  },
  insightCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f694d",
    backgroundColor: "#0d3025",
    padding: 14,
    gap: 10,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  insightBadge: {
    color: "#35e68a",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "700",
  },
  insightText: {
    color: "#dfede7",
    fontSize: 18,
    lineHeight: 30,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#174338",
    backgroundColor: "#0f2d24",
    padding: 14,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: {
    color: "#ebf5f0",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },
  sectionMeta: {
    color: "#3ce58e",
    fontSize: 13,
  },
  progressTrack: {
    width: "100%",
    height: 16,
    borderRadius: 999,
    backgroundColor: "#1b4135",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#35e78a",
  },
  timelineTicks: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timelineLabel: {
    color: "#8ba39b",
    fontSize: 12,
  },
  emptyText: {
    color: "#95aca4",
    fontSize: 15,
  },
  symptomRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1c493c",
    backgroundColor: "#113126",
    padding: 10,
    gap: 6,
  },
  symptomMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  symptomName: {
    color: "#f3f7f4",
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "700",
    flexShrink: 1,
  },
  symptomIntensity: {
    color: "#f1a85f",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  symptomTime: {
    color: "#8da59d",
    fontSize: 12,
  },
  symptomNoteWrap: {
    borderRadius: 10,
    backgroundColor: "#09231d",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  symptomNote: {
    color: "#d6e8e0",
    fontSize: 14,
    fontStyle: "italic",
  },
  counterBadge: {
    borderRadius: 999,
    backgroundColor: "#133c2d",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: {
    color: "#35e489",
    fontSize: 12,
    fontWeight: "700",
  },
  habitRow: {
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: "#1c493d",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  habitIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#37e48a",
    alignItems: "center",
    justifyContent: "center",
  },
  habitLabel: {
    color: "#ebf5f1",
    fontSize: 16,
    flex: 1,
  },
  journalText: {
    color: "#dfece6",
    fontSize: 16,
    lineHeight: 28,
  },
});
