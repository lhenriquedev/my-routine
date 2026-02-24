import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHistoryListQuery } from "@/src/features/history/hooks/use-history-list-query";
import {
  HistoryCategoryFilter,
  HistoryDaySummary,
  HistoryPeriodDays,
} from "@/src/features/history/types";
import { AppText } from "@/src/ui/app-text";

interface PeriodOption {
  label: string;
  value: HistoryPeriodDays;
}

interface CategoryOption {
  label: string;
  value: HistoryCategoryFilter;
}

interface KpiCardItem {
  id: string;
  label: string;
  value: string;
  delta: string;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
];

const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: "All", value: "all" },
  { label: "Hydration", value: "hydration" },
  { label: "Habits", value: "habits" },
  { label: "Symptoms", value: "symptoms" },
  { label: "Journal", value: "journal" },
];

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatMl(value: number): string {
  return `${Math.round(value).toLocaleString()} ml`;
}

function formatChange(current: number, previous: number, suffix: string): string {
  if (previous <= 0) {
    return "No previous period to compare";
  }

  const delta = ((current - previous) / previous) * 100;
  const signal = delta > 0 ? "+" : "";
  return `${signal}${Math.round(delta)}% vs previous ${suffix}`;
}

function getStatusMeta(status: HistoryDaySummary["status"]): {
  label: string;
  textColor: string;
  backgroundColor: string;
} {
  if (status === "reviewed") {
    return {
      label: "Reviewed",
      textColor: "#35ea8b",
      backgroundColor: "#12412e",
    };
  }

  if (status === "pending_review") {
    return {
      label: "Pending review",
      textColor: "#b8f5d5",
      backgroundColor: "#1a4d39",
    };
  }

  return {
    label: "No data",
    textColor: "#9eb0b9",
    backgroundColor: "#2b3a3f",
  };
}

function getDayMetricValue(day: HistoryDaySummary, category: HistoryCategoryFilter): number {
  if (category === "hydration") {
    return day.waterMl;
  }

  if (category === "habits") {
    return day.totalHabitsCount > 0
      ? (day.completedHabitsCount / day.totalHabitsCount) * 100
      : 0;
  }

  if (category === "symptoms") {
    return day.symptomCount;
  }

  if (category === "journal") {
    return day.hasJournal ? 1 : 0;
  }

  const hydrationScore = day.waterGoalMl > 0 ? Math.min(day.waterMl / day.waterGoalMl, 1) : 0;
  const habitsScore = day.totalHabitsCount > 0 ? day.completedHabitsCount / day.totalHabitsCount : 0;
  const journalScore = day.hasJournal ? 0.15 : 0;
  const symptomsPenalty = Math.min(day.symptomCount * 0.08, 0.24);
  return Math.max(0, (hydrationScore + habitsScore + journalScore - symptomsPenalty) * 100);
}

function selectInsights(days: HistoryDaySummary[], period: HistoryPeriodDays): string[] {
  const activeDays = days.filter((day) => day.hasAnyActivity);

  if (activeDays.length < 4) {
    return [
      "Early trend signal: not enough data for reliable patterns yet. Keep logging for a few more days.",
    ];
  }

  const insights: string[] = [];
  insights.push(`You logged data on ${activeDays.length} of the last ${period} days.`);

  const lowHydration = activeDays.filter((day) => day.waterGoalMl > 0 && day.waterMl < day.waterGoalMl * 0.5);
  const highHydration = activeDays.filter((day) => day.waterGoalMl > 0 && day.waterMl >= day.waterGoalMl * 0.8);
  const lowSymptomRate =
    lowHydration.reduce((sum, day) => sum + day.symptomCount, 0) / Math.max(1, lowHydration.length);
  const highSymptomRate =
    highHydration.reduce((sum, day) => sum + day.symptomCount, 0) / Math.max(1, highHydration.length);

  if (lowHydration.length >= 2 && highHydration.length >= 2 && lowSymptomRate > highSymptomRate + 0.4) {
    insights.push("Symptoms appeared more often on low hydration days.");
  }

  const weekdayBuckets = new Map<number, { completed: number; count: number }>();
  activeDays.forEach((day) => {
    const parsed = new Date(`${day.dateKey}T00:00:00`);
    const key = parsed.getDay();
    const current = weekdayBuckets.get(key) ?? { completed: 0, count: 0 };
    weekdayBuckets.set(key, {
      completed: current.completed + day.completedHabitsCount,
      count: current.count + 1,
    });
  });

  const strongestWeekday = Array.from(weekdayBuckets.entries()).reduce<{
    day: number;
    avg: number;
  } | null>((best, [day, value]) => {
    const avg = value.completed / Math.max(1, value.count);
    if (!best || avg > best.avg) {
      return { day, avg };
    }

    return best;
  }, null);

  if (strongestWeekday && strongestWeekday.avg >= 1) {
    const label = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][strongestWeekday.day];
    insights.push(`Habits are strongest on ${label}.`);
  }

  return insights.slice(0, 2);
}

function buildKpis(
  currentDays: HistoryDaySummary[],
  previousDays: HistoryDaySummary[],
  period: HistoryPeriodDays,
  category: HistoryCategoryFilter,
): KpiCardItem[] {
  const activeCurrent = currentDays.filter((day) => day.hasAnyActivity);
  const activePrevious = previousDays.filter((day) => day.hasAnyActivity);

  if (category === "hydration") {
    const currentAvgWater =
      activeCurrent.reduce((sum, day) => sum + day.waterMl, 0) / Math.max(1, activeCurrent.length);
    const previousAvgWater =
      activePrevious.reduce((sum, day) => sum + day.waterMl, 0) / Math.max(1, activePrevious.length);
    const goalDays = currentDays.filter((day) => day.waterGoalMl > 0 && day.waterMl >= day.waterGoalMl).length;

    return [
      {
        id: "water-avg",
        label: "Avg water/day",
        value: formatMl(currentAvgWater),
        delta: formatChange(currentAvgWater, previousAvgWater, `${period} days`),
      },
      {
        id: "water-goal",
        label: "Water goal days",
        value: `${goalDays}/${period}`,
        delta: `${Math.round((goalDays / Math.max(1, period)) * 100)}% completion`,
      },
    ];
  }

  if (category === "habits") {
    const currentHabitRate =
      currentDays.reduce(
        (sum, day) =>
          sum + (day.totalHabitsCount > 0 ? day.completedHabitsCount / day.totalHabitsCount : 0),
        0,
      ) / Math.max(1, currentDays.length);
    const previousHabitRate =
      previousDays.reduce(
        (sum, day) =>
          sum + (day.totalHabitsCount > 0 ? day.completedHabitsCount / day.totalHabitsCount : 0),
        0,
      ) / Math.max(1, previousDays.length);

    return [
      {
        id: "habit-rate",
        label: "Habit consistency",
        value: formatPercent(currentHabitRate * 100),
        delta: formatChange(currentHabitRate, previousHabitRate, `${period} days`),
      },
      {
        id: "habit-count",
        label: "Avg habits/day",
        value: (
          currentDays.reduce((sum, day) => sum + day.completedHabitsCount, 0) /
          Math.max(1, currentDays.length)
        ).toFixed(1),
        delta: "Completion tracked daily",
      },
    ];
  }

  if (category === "symptoms") {
    const currentSymptoms = currentDays.reduce((sum, day) => sum + day.symptomCount, 0);
    const previousSymptoms = previousDays.reduce((sum, day) => sum + day.symptomCount, 0);

    return [
      {
        id: "symptom-total",
        label: "Symptoms logged",
        value: `${currentSymptoms}`,
        delta: formatChange(currentSymptoms, previousSymptoms, `${period} days`),
      },
      {
        id: "symptom-days",
        label: "Days with symptoms",
        value: `${currentDays.filter((day) => day.symptomCount > 0).length}/${period}`,
        delta: "Track with context notes",
      },
    ];
  }

  if (category === "journal") {
    const journalDays = currentDays.filter((day) => day.hasJournal).length;
    const previousJournalDays = previousDays.filter((day) => day.hasJournal).length;

    return [
      {
        id: "journal-days",
        label: "Journal days",
        value: `${journalDays}/${period}`,
        delta: formatChange(journalDays, previousJournalDays, `${period} days`),
      },
      {
        id: "journal-rate",
        label: "Journal rate",
        value: formatPercent((journalDays / Math.max(1, period)) * 100),
        delta: "Short notes are enough",
      },
    ];
  }

  const avgWater = activeCurrent.reduce((sum, day) => sum + day.waterMl, 0) / Math.max(1, activeCurrent.length);
  const prevAvgWater = activePrevious.reduce((sum, day) => sum + day.waterMl, 0) / Math.max(1, activePrevious.length);
  const goalDays = currentDays.filter((day) => day.waterGoalMl > 0 && day.waterMl >= day.waterGoalMl).length;
  const habitConsistency =
    currentDays.reduce(
      (sum, day) =>
        sum + (day.totalHabitsCount > 0 ? day.completedHabitsCount / day.totalHabitsCount : 0),
      0,
    ) / Math.max(1, currentDays.length);
  const loggingRate = currentDays.filter((day) => day.hasAnyActivity).length / Math.max(1, currentDays.length);

  return [
    {
      id: "avg-water",
      label: "Avg water/day",
      value: formatMl(avgWater),
      delta: formatChange(avgWater, prevAvgWater, `${period} days`),
    },
    {
      id: "goal-days",
      label: "Water goal days",
      value: `${goalDays}/${period}`,
      delta: "Hydration consistency",
    },
    {
      id: "habit-consistency",
      label: "Habit consistency",
      value: formatPercent(habitConsistency * 100),
      delta: "Completed habits across days",
    },
    {
      id: "logging-rate",
      label: "Logging rate",
      value: formatPercent(loggingRate * 100),
      delta: `${currentDays.filter((day) => day.hasAnyActivity).length}/${period} days with entries`,
    },
  ];
}

function DaySummaryRow({
  day,
  onPress,
}: {
  day: HistoryDaySummary;
  onPress: () => void;
}) {
  const statusMeta = getStatusMeta(day.status);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open review for ${day.dateLabel}`}
      style={({ pressed }) => [styles.dayRow, pressed ? styles.pressed : null]}
    >
      <View style={styles.dayTopRow}>
        <View>
          <AppText variant="title" style={styles.dayDate}>
            {day.dateLabel}
          </AppText>
          {day.relativeLabel ? (
            <AppText variant="meta" style={styles.relativeLabel}>
              {day.relativeLabel}
            </AppText>
          ) : null}
        </View>
        <View style={[styles.badge, { backgroundColor: statusMeta.backgroundColor }]}>
          <AppText variant="caption" style={[styles.badgeText, { color: statusMeta.textColor }]}>
            {statusMeta.label}
          </AppText>
        </View>
      </View>

      <View style={styles.quickSignalsRow}>
        <AppText variant="caption" style={styles.signalText}>
          {day.waterMl >= day.waterGoalMl && day.waterGoalMl > 0 ? "Water goal hit" : "Water goal missed"}
        </AppText>
        <AppText variant="caption" style={styles.signalText}>
          Habits {day.completedHabitsCount}/{day.totalHabitsCount}
        </AppText>
      </View>
      <View style={styles.quickSignalsRow}>
        <AppText variant="caption" style={styles.signalText}>
          Symptoms {day.symptomCount}
        </AppText>
        <AppText variant="caption" style={styles.signalText}>
          Journal {day.hasJournal ? "saved" : "empty"}
        </AppText>
      </View>

      <View style={styles.reviewHintRow}>
        <AppText variant="label" style={styles.reviewHintText}>
          Review
        </AppText>
        <Ionicons name="chevron-forward" size={18} color="#87a49d" />
      </View>
    </Pressable>
  );
}

export function HistoryScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<HistoryPeriodDays>(7);
  const [category, setCategory] = useState<HistoryCategoryFilter>("all");
  const historyQuery = useHistoryListQuery(period * 2);

  const currentDays = useMemo(() => (historyQuery.data ?? []).slice(0, period), [historyQuery.data, period]);
  const previousDays = useMemo(
    () => (historyQuery.data ?? []).slice(period, period * 2),
    [historyQuery.data, period],
  );

  const insights = useMemo(() => selectInsights(currentDays, period), [currentDays, period]);
  const kpis = useMemo(
    () => buildKpis(currentDays, previousDays, period, category),
    [currentDays, previousDays, period, category],
  );

  const chartValues = useMemo(
    () => [...currentDays].reverse().map((day) => getDayMetricValue(day, category)),
    [currentDays, category],
  );

  const chartMax = useMemo(
    () => Math.max(1, ...chartValues.map((value) => (Number.isFinite(value) ? value : 0))),
    [chartValues],
  );

  const latestPendingDate = useMemo(() => {
    const pending = currentDays.find((day) => day.status === "pending_review");
    if (pending) {
      return pending.dateKey;
    }

    const today = currentDays.find((day) => day.relativeLabel === "Today");
    return today?.dateKey ?? currentDays[0]?.dateKey ?? null;
  }, [currentDays]);

  if (historyQuery.isLoading) {
    return (
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.centerState}>
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
        <View style={styles.centerState}>
          <AppText variant="title" style={styles.errorTitle}>
            Could not load history
          </AppText>
          <AppText variant="body" style={styles.stateText}>
            {historyQuery.error.message}
          </AppText>
          <Pressable
            onPress={() => historyQuery.refetch()}
            style={({ pressed }) => [styles.retryButton, pressed ? styles.pressed : null]}
          >
            <AppText variant="button" style={styles.retryButtonText}>
              Retry
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const hasAnyActivity = currentDays.some((day) => day.hasAnyActivity);
  const lowSignal = currentDays.filter((day) => day.hasAnyActivity).length < 4;

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <FlatList
        data={currentDays}
        keyExtractor={(item) => item.dateKey}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.periodRow}>
              {PERIOD_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setPeriod(option.value)}
                  style={({ pressed }) => [
                    styles.periodChip,
                    period === option.value ? styles.periodChipActive : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <AppText
                    variant="label"
                    style={period === option.value ? styles.periodLabelActive : styles.periodLabel}
                  >
                    {option.label}
                  </AppText>
                </Pressable>
              ))}
              <View style={styles.customSoonChip}>
                <AppText variant="meta" style={styles.customSoonText}>
                  Custom soon
                </AppText>
              </View>
            </View>

            <View style={styles.categoryRow}>
              {CATEGORY_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setCategory(option.value)}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    category === option.value ? styles.categoryChipActive : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <AppText
                    variant="meta"
                    style={category === option.value ? styles.categoryLabelActive : styles.categoryLabel}
                  >
                    {option.label}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles" size={14} color="#38e88c" />
                <AppText variant="label" style={styles.insightHeaderText}>
                  Quick Insight
                </AppText>
              </View>
              {insights.map((text) => (
                <AppText key={text} variant="body" style={styles.insightBody}>
                  {text}
                </AppText>
              ))}
            </View>

            {!hasAnyActivity ? (
              <View style={styles.stateCard}>
                <AppText variant="title" style={styles.stateCardTitle}>
                  No history yet
                </AppText>
                <AppText variant="body" style={styles.stateCardText}>
                  Start logging today to unlock your trends.
                </AppText>
              </View>
            ) : lowSignal ? (
              <View style={styles.stateCard}>
                <AppText variant="title" style={styles.stateCardTitle}>
                  Early trend signal
                </AppText>
                <AppText variant="body" style={styles.stateCardText}>
                  Not enough data for strong patterns yet. Keep logging for a few more days.
                </AppText>
              </View>
            ) : null}

            <View style={styles.kpiGrid}>
              {kpis.map((kpi) => (
                <View key={kpi.id} style={styles.kpiCard}>
                  <AppText variant="meta" style={styles.kpiLabel}>
                    {kpi.label}
                  </AppText>
                  <AppText variant="title" style={styles.kpiValue}>
                    {kpi.value}
                  </AppText>
                  <AppText variant="caption" style={styles.kpiDelta} numberOfLines={2}>
                    {kpi.delta}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.chartCard}>
              <AppText variant="label" style={styles.chartTitle}>
                {category === "all" ? "Progress trend" : `${CATEGORY_OPTIONS.find((item) => item.value === category)?.label} trend`}
              </AppText>
              <View style={styles.chartBarsRow}>
                {chartValues.map((value, index) => (
                  <View key={`${index}-${value}`} style={styles.chartBarWrap}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${Math.max(6, (value / chartMax) * 100)}%`,
                          opacity: index >= chartValues.length - 3 ? 1 : 0.58,
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.chartFooterRow}>
                <AppText variant="meta" style={styles.chartMeta}>
                  Start
                </AppText>
                <AppText variant="meta" style={styles.chartMeta}>
                  End
                </AppText>
              </View>
            </View>

            <AppText variant="label" style={styles.listTitle}>
              Daily review list
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <DaySummaryRow
            day={item}
            onPress={() =>
              router.push({
                pathname: "/review-day",
                params: { date: item.dateKey },
              })
            }
          />
        )}
      />

      <View style={styles.bottomCtaWrap}>
        <Pressable
          disabled={!latestPendingDate}
          onPress={() => {
            if (!latestPendingDate) {
              return;
            }

            router.push({
              pathname: "/review-day",
              params: { date: latestPendingDate },
            });
          }}
          style={({ pressed }) => [styles.bottomCta, pressed ? styles.pressed : null]}
        >
          <Ionicons name="checkmark-done" size={20} color="#04331b" />
          <AppText variant="button" style={styles.bottomCtaText}>
            {hasAnyActivity ? "Open latest pending review" : "Review today"}
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#031313",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 10,
  },
  headerContent: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  stateText: {
    color: "#9eb4ac",
    textAlign: "center",
    lineHeight: 22,
  },
  errorTitle: {
    color: "#eef7f2",
    fontSize: 28,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 48,
    minWidth: 130,
    borderRadius: 12,
    backgroundColor: "#38e58b",
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#05301a",
    fontWeight: "700",
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  periodChip: {
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#133127",
    borderWidth: 1,
    borderColor: "#1e4a3c",
  },
  periodChipActive: {
    backgroundColor: "#1a5a43",
    borderColor: "#37e689",
  },
  periodLabel: {
    color: "#8da89f",
  },
  periodLabelActive: {
    color: "#dff3e8",
    fontWeight: "700",
  },
  customSoonChip: {
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#112826",
    borderWidth: 1,
    borderColor: "#1a3536",
  },
  customSoonText: {
    color: "#6f8a82",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#102a24",
    borderWidth: 1,
    borderColor: "#1d463a",
  },
  categoryChipActive: {
    backgroundColor: "#184636",
    borderColor: "#36e58b",
  },
  categoryLabel: {
    color: "#8ea49d",
  },
  categoryLabelActive: {
    color: "#d4eee0",
    fontWeight: "700",
  },
  insightCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1b6147",
    backgroundColor: "#0e3026",
    padding: 14,
    gap: 8,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  insightHeaderText: {
    color: "#37ea8b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontSize: 12,
    fontWeight: "700",
  },
  insightBody: {
    color: "#e2efe9",
    lineHeight: 21,
  },
  stateCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1d4a3b",
    backgroundColor: "#0f2e25",
    padding: 14,
    gap: 4,
  },
  stateCardTitle: {
    color: "#eaf4ef",
    fontSize: 20,
    lineHeight: 26,
  },
  stateCardText: {
    color: "#9db2aa",
    lineHeight: 22,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  kpiCard: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#184538",
    backgroundColor: "#102f25",
    padding: 12,
    gap: 6,
  },
  kpiLabel: {
    color: "#8ea39d",
  },
  kpiValue: {
    color: "#eff7f3",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
  },
  kpiDelta: {
    color: "#8ca59d",
    fontSize: 12,
    lineHeight: 17,
  },
  chartCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#174638",
    backgroundColor: "#102d24",
    padding: 12,
    gap: 8,
  },
  chartTitle: {
    color: "#dff0e7",
    fontWeight: "700",
    fontSize: 13,
  },
  chartBarsRow: {
    minHeight: 80,
    maxHeight: 80,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  chartBarWrap: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "100%",
    borderRadius: 4,
    backgroundColor: "#37e48a",
  },
  chartFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartMeta: {
    color: "#819c93",
  },
  listTitle: {
    color: "#dbece3",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 4,
    marginBottom: 2,
  },
  dayRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#184538",
    backgroundColor: "#0f2b23",
    padding: 12,
    gap: 8,
    marginBottom: 9,
  },
  dayTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  dayDate: {
    color: "#ecf5f0",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },
  relativeLabel: {
    color: "#8aa299",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontSize: 11,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.4,
    fontWeight: "700",
  },
  quickSignalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  signalText: {
    color: "#9eb3ac",
    fontSize: 13,
    flex: 1,
  },
  reviewHintRow: {
    borderTopWidth: 1,
    borderTopColor: "#1f4a3e",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewHintText: {
    color: "#c9e7d9",
    fontWeight: "700",
  },
  bottomCtaWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 10,
  },
  bottomCta: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#38e58b",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  bottomCtaText: {
    color: "#05331c",
    fontWeight: "700",
    fontSize: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
