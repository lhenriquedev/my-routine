import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHistoryListQuery } from "@/src/features/history/hooks/use-history-list-query";
import { groupHistoryByMonth } from "@/src/features/history/selectors/history-selectors";
import { historyService } from "@/src/features/history/services/history-service";
import { HistoryDaySummary } from "@/src/features/history/types";
import { AppText } from "@/src/ui/app-text";

function getStatusMeta(status: HistoryDaySummary["status"]): {
  label: string;
  textColor: string;
  backgroundColor: string;
} {
  if (status === "reviewed") {
    return {
      label: "Reviewed",
      textColor: "#38e98b",
      backgroundColor: "#133f2c",
    };
  }

  if (status === "in_progress") {
    return {
      label: "In Progress",
      textColor: "#3be68b",
      backgroundColor: "#114531",
    };
  }

  return {
    label: "Logged",
    textColor: "#9cadb8",
    backgroundColor: "#2b3a3d",
  };
}

function DaySummaryCard({
  day,
  onPress,
}: {
  day: HistoryDaySummary;
  onPress: () => void;
}) {
  const statusMeta = getStatusMeta(day.status);
  const symptomLabel =
    day.topSymptoms.length > 0
      ? day.topSymptoms.join(" • ")
      : day.symptomCount > 0
        ? `${day.symptomCount} symptoms logged`
        : "No symptoms";
  const habitLabel =
    day.completedHabitsCount > 0
      ? `${day.completedHabitLabels.join(" • ")}${
          day.completedHabitsCount > day.completedHabitLabels.length
            ? ` +${day.completedHabitsCount - day.completedHabitLabels.length}`
            : ""
        }`
      : "No habits completed";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open details for ${day.dateLabel}`}
      style={({ pressed }) => [styles.dayCard, pressed ? styles.cardPressed : null]}
    >
      <View style={styles.dayCardHeader}>
        <View style={styles.dateWrap}>
          <AppText variant="title" style={styles.dayDate}>
            {day.dateLabel}
          </AppText>
          {day.relativeLabel ? (
            <AppText variant="label" style={styles.relativeLabel}>
              {day.relativeLabel}
            </AppText>
          ) : null}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusMeta.backgroundColor }]}>
          <AppText variant="label" style={[styles.statusText, { color: statusMeta.textColor }]}>
            {statusMeta.label}
          </AppText>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Ionicons name="water" color="#66a8ff" size={16} />
          <AppText variant="caption" style={styles.metricText}>
            {historyService.formatHydrationCompactLabel(day.waterMl, day.waterGoalMl)}
          </AppText>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Ionicons name="medkit" color="#f08282" size={14} />
          <AppText variant="caption" style={styles.metricText} numberOfLines={1}>
            {symptomLabel}
          </AppText>
        </View>
      </View>

      <View style={styles.habitRow}>
        <AppText variant="caption" style={styles.habitText} numberOfLines={1}>
          {habitLabel}
        </AppText>
        <Ionicons name="chevron-forward" size={20} color="#90a6a0" />
      </View>
    </Pressable>
  );
}

function WeeklyInsightCard() {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons name="sparkles" size={14} color="#39ea8b" />
        <AppText variant="label" style={styles.insightBadgeText}>
          Weekly Insight
        </AppText>
      </View>

      <AppText variant="body" style={styles.insightBody}>
        Keep logging hydration and symptoms daily. Consistency turns isolated events into useful patterns.
      </AppText>

      <View style={styles.insightBars}>
        {[0.35, 0.55, 0.45, 0.7, 0.85, 0.65, 0.5].map((height, index) => (
          <View
            key={`bar-${index}`}
            style={[
              styles.insightBar,
              {
                height: 20 + Math.round(height * 40),
                opacity: index === 4 ? 1 : 0.55,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function HistoryScreen() {
  const router = useRouter();
  const historyQuery = useHistoryListQuery(90);
  const sections = useMemo(
    () => groupHistoryByMonth(historyQuery.data ?? []),
    [historyQuery.data],
  );

  if (historyQuery.isLoading) {
    return (
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#37e389" />
          <AppText variant="body" style={styles.stateText}>
            Loading history...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (historyQuery.error) {
    return (
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.stateContainer}>
          <AppText variant="title" style={styles.errorTitle}>
            Could not load history
          </AppText>
          <AppText variant="body" style={styles.errorText}>
            {historyQuery.error.message}
          </AppText>
          <Pressable
            onPress={() => historyQuery.refetch()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading history"
            style={({ pressed }) => [styles.retryButton, pressed ? styles.cardPressed : null]}
          >
            <AppText variant="button" style={styles.retryButtonText}>
              Retry
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (sections.length === 0) {
    return (
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.stateContainer}>
          <AppText variant="title" style={styles.errorTitle}>
            No history yet
          </AppText>
          <AppText variant="body" style={styles.stateText}>
            Start logging water, habits, and symptoms in Today to build your timeline.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <SectionList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        sections={sections}
        keyExtractor={(item) => item.dateKey}
        ListHeaderComponent={<WeeklyInsightCard />}
        renderSectionHeader={({ section }) => (
          <AppText variant="title" style={styles.monthTitle}>
            {section.title}
          </AppText>
        )}
        renderItem={({ item }) => (
          <DaySummaryCard
            day={item}
            onPress={() =>
              router.push({
                pathname: "/history/[date]",
                params: { date: item.dateKey },
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#031313",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 10,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  stateText: {
    color: "#95aaa2",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  errorTitle: {
    color: "#e9f4ee",
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
  },
  errorText: {
    color: "#b9ccc5",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 4,
    minHeight: 48,
    minWidth: 140,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#38e48a",
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: "#04331a",
    fontSize: 15,
    fontWeight: "700",
  },
  cardPressed: {
    opacity: 0.82,
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1d5c43",
    backgroundColor: "#0e2d24",
    padding: 16,
    gap: 12,
    marginBottom: 8,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  insightBadgeText: {
    color: "#38e68a",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 12,
    fontWeight: "700",
  },
  insightBody: {
    color: "#e3f0ea",
    fontSize: 18,
    lineHeight: 28,
  },
  insightBars: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#224e3f",
    backgroundColor: "#0f3026",
    height: 108,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingBottom: 14,
  },
  insightBar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: "#38e58a",
  },
  monthTitle: {
    color: "#9cb0a8",
    fontSize: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  dayCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#174337",
    backgroundColor: "#0f2b24",
    padding: 14,
    gap: 10,
    marginBottom: 10,
  },
  dayCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  dateWrap: {
    gap: 2,
  },
  dayDate: {
    color: "#f0f8f4",
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "700",
  },
  relativeLabel: {
    color: "#8ea79f",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: "700",
  },
  metricsRow: {
    borderTopWidth: 1,
    borderTopColor: "#1f4a3d",
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#275346",
  },
  metricText: {
    color: "#b7cbc3",
    fontSize: 14,
    flexShrink: 1,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  habitText: {
    color: "#93aca4",
    fontSize: 13,
    flex: 1,
  },
});
