import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTodayQuery } from "@/src/features/today/hooks/use-today-query";
import { getLocalDateKey } from "@/src/features/today/selectors/today-selectors";
import {
  createDefaultTodayEntry,
  selectLastSymptom,
} from "@/src/features/today/services/today-service";
import { AppText } from "@/src/ui/app-text";

interface MetricMiniCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  value: string;
  footnote: string;
  footnoteColor: string;
}

function MetricMiniCard({
  icon,
  iconColor,
  title,
  value,
  footnote,
  footnoteColor,
}: MetricMiniCardProps) {
  return (
    <View style={styles.miniCard}>
      <View style={styles.miniCardHeader}>
        <Ionicons name={icon} size={16} color={iconColor} />
        <AppText variant="caption" style={styles.miniCardTitle}>
          {title}
        </AppText>
      </View>
      <AppText variant="title" style={styles.miniCardValue}>
        {value}
      </AppText>
      <AppText variant="label" style={[styles.miniCardFootnote, { color: footnoteColor }]}>
        {footnote}
      </AppText>
    </View>
  );
}

function formatLiters(valueMl: number): string {
  const liters = valueMl / 1000;
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(liters);

  return `${formatted}L`;
}

export function ReviewDayScreen() {
  const router = useRouter();
  const dateKey = useMemo(() => getLocalDateKey(new Date()), []);
  const todayQuery = useTodayQuery(dateKey);
  const entry = todayQuery.data ?? createDefaultTodayEntry(dateKey);
  const completedHabitsCount = useMemo(
    () => Object.values(entry.habitsCompletion).filter(Boolean).length,
    [entry.habitsCompletion],
  );
  const totalHabitsCount = useMemo(
    () => Object.keys(entry.habitsCompletion).length,
    [entry.habitsCompletion],
  );
  const waterProgressPercent = useMemo(() => {
    if (entry.waterGoalMl <= 0) {
      return 0;
    }

    return Math.min(Math.round((entry.waterMl / entry.waterGoalMl) * 100), 100);
  }, [entry.waterGoalMl, entry.waterMl]);
  const lastSymptom = useMemo(() => selectLastSymptom(entry), [entry]);
  const latestSymptomText =
    lastSymptom === null
      ? "No symptoms logged"
      : `${lastSymptom.symptomName} · Intensity ${lastSymptom.intensity}/5`;
  const notePreview = entry.quickNote.trim();
  const hasSolidMomentum =
    completedHabitsCount >= Math.ceil(totalHabitsCount * 0.6) &&
    waterProgressPercent >= 60;

  const reviewLabel = useMemo(() => {
    const now = new Date();
    const date = now.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return `Review ${date}`;
  }, []);

  const insightTitle = hasSolidMomentum
    ? "Great Momentum Today"
    : "Small Win for Tomorrow";

  const insightBody = hasSolidMomentum
    ? "You kept habits and hydration moving in the right direction. Try repeating the same first habit tomorrow morning to keep the streak alive."
    : "Start tomorrow with one easy habit and one glass of water in the first hour. A fast start usually makes the rest of the day easier.";

  const goBackToToday = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/today");
  };

  const goToTodayForEdit = () => {
    router.replace("/(tabs)/today");
  };

  if (todayQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#37e389" />
          <AppText variant="body" style={styles.loadingText}>
            Loading your daily review...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (todayQuery.error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <AppText variant="title" style={styles.errorTitle}>
            Could not load review
          </AppText>
          <AppText variant="body" style={styles.errorMessage}>
            {todayQuery.error.message}
          </AppText>
          <Pressable
            onPress={() => todayQuery.refetch()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading review"
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.viewport}>
        <View style={styles.panel}>
          <View style={styles.panelGlow} />

          <View style={styles.headerRow}>
            <Pressable
              onPress={goBackToToday}
              accessibilityRole="button"
              accessibilityLabel="Close review"
              hitSlop={8}
              style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
            >
              <Ionicons name="close" size={24} color="#9fb4ae" />
            </Pressable>

            <AppText variant="title" style={styles.screenTitle}>
              {reviewLabel}
            </AppText>

            <Pressable
              onPress={goToTodayForEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit today entries"
              hitSlop={8}
              style={({ pressed }) => [styles.editButton, pressed ? styles.pressed : null]}
            >
              <AppText variant="button" style={styles.editText}>
                Edit
              </AppText>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.highlightCard}>
              <View style={styles.highlightCopy}>
                <View style={styles.highlightLabelRow}>
                  <Ionicons name="water" size={15} color="#66a6f8" />
                  <AppText variant="body" style={styles.highlightLabel}>
                    Water
                  </AppText>
                </View>

                <AppText variant="display" style={styles.highlightValue}>
                  {formatLiters(entry.waterMl)}
                </AppText>
                <AppText variant="caption" style={styles.highlightGoal}>
                  Goal: {formatLiters(entry.waterGoalMl)}
                </AppText>
              </View>

              <View style={styles.progressRing}>
                <View style={styles.progressInner}>
                  <AppText variant="button" style={styles.progressValue}>
                    {waterProgressPercent}%
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.miniGrid}>
                <MetricMiniCard
                  icon="medkit"
                  iconColor="#ff6f6f"
                  title="Symptoms"
                  value={`${entry.symptomLogs.length} Logged`}
                  footnote={latestSymptomText}
                  footnoteColor={lastSymptom ? "#f36e6e" : "#9cb2aa"}
                />
                <MetricMiniCard
                  icon="checkmark-circle"
                  iconColor="#31e986"
                  title="Habits"
                  value={`${completedHabitsCount}/${totalHabitsCount}`}
                  footnote={
                    completedHabitsCount === totalHabitsCount
                      ? "All complete"
                      : "Progress tracked"
                  }
                  footnoteColor="#56db8f"
                />
              </View>

            <View style={styles.insightCard}>
              <View style={styles.insightBadgeRow}>
                <View style={styles.insightBadgeIconWrap}>
                  <Ionicons name="sparkles" size={13} color="#36e38a" />
                </View>
                <AppText variant="label" style={styles.insightBadgeText}>
                  AI Insight
                </AppText>
              </View>

              <AppText variant="title" style={styles.insightTitle}>
                {insightTitle}
              </AppText>

              <AppText variant="body" style={styles.insightBody}>
                {insightBody}
              </AppText>

              <View style={styles.insightFooter}>
                <AppText variant="meta" style={styles.insightMeta}>
                  Based on today&apos;s entries
                </AppText>
                <Pressable
                  onPress={goToTodayForEdit}
                  accessibilityRole="button"
                  accessibilityLabel="Open today to adjust entries"
                  hitSlop={8}
                  style={({ pressed }) => [styles.insightLink, pressed ? styles.pressed : null]}
                >
                  <AppText variant="button" style={styles.insightLinkText}>
                    Adjust entries
                  </AppText>
                  <Ionicons name="arrow-forward" size={14} color="#3ce58e" />
                </Pressable>
              </View>
            </View>

            <View style={styles.quoteCard}>
              <Ionicons
                name={notePreview ? "document-text" : "leaf"}
                size={56}
                color="#8bbf88"
                style={styles.quoteLeaf}
              />
              <AppText variant="label" style={styles.noteLabel}>
                {notePreview ? "Today note" : "Reflection"}
              </AppText>
              <AppText variant="body" style={styles.quoteText}>
                {notePreview || "Take one minute tonight to write how your body felt today."}
              </AppText>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={goBackToToday}
              accessibilityRole="button"
              accessibilityLabel="Finish day"
              style={({ pressed }) => [styles.finishButton, pressed ? styles.finishPressed : null]}
            >
              <Ionicons name="checkmark" size={22} color="#033118" />
              <AppText variant="button" style={styles.finishText}>
                Back to Today
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#031313",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  loadingText: {
    color: "#98b2a8",
    fontSize: 15,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: "#f1faf6",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  errorMessage: {
    color: "#a8c0b7",
    fontSize: 15,
    lineHeight: 22,
  },
  retryButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#37e389",
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#032c18",
    fontSize: 16,
    fontWeight: "700",
  },
  viewport: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  panel: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#174437",
    backgroundColor: "#05201a",
    overflow: "hidden",
  },
  panelGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0a2d24",
    opacity: 0.22,
  },
  headerRow: {
    minHeight: 60,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    color: "#e8f3ef",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
  },
  editButton: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  editText: {
    color: "#2fe083",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.74,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 18,
    gap: 10,
  },
  highlightCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#164338",
    backgroundColor: "#113326",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  highlightCopy: {
    flex: 1,
    gap: 4,
  },
  highlightLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  highlightLabel: {
    color: "#91a8a0",
    fontSize: 16,
  },
  highlightValue: {
    color: "#edf5f1",
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
  },
  highlightGoal: {
    color: "#7d968f",
    fontSize: 14,
  },
  progressRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 7,
    borderColor: "#265243",
    borderTopColor: "#68a9ff",
    borderRightColor: "#68a9ff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  progressInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#13352b",
  },
  progressValue: {
    color: "#eef7f3",
    fontSize: 13,
    fontWeight: "700",
  },
  miniGrid: {
    flexDirection: "row",
    gap: 10,
  },
  miniCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#163f35",
    backgroundColor: "#103125",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  miniCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniCardTitle: {
    color: "#90a8a0",
    fontSize: 14,
  },
  miniCardValue: {
    color: "#eff7f2",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
  },
  miniCardFootnote: {
    fontSize: 14,
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1a5a43",
    backgroundColor: "#0d3026",
    padding: 16,
    gap: 12,
  },
  insightBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightBadgeIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#114234",
  },
  insightBadgeText: {
    color: "#d8e8df",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  insightTitle: {
    color: "#eef6f2",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "700",
  },
  insightBody: {
    color: "#9cb4ad",
    fontSize: 16,
    lineHeight: 24,
  },
  insightFooter: {
    marginTop: 2,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#235645",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  insightMeta: {
    color: "#79958c",
    fontSize: 13,
  },
  insightLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  insightLinkText: {
    color: "#3ce58e",
    fontSize: 15,
    fontWeight: "700",
  },
  quoteCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#194737",
    backgroundColor: "#173821",
    minHeight: 116,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  quoteLeaf: {
    position: "absolute",
    right: 18,
    top: 14,
    opacity: 0.32,
  },
  noteLabel: {
    color: "#8cb3a0",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  quoteText: {
    color: "#dcebdd",
    fontSize: 18,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
  },
  finishButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#39e07f",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  finishPressed: {
    opacity: 0.84,
  },
  finishText: {
    color: "#04371a",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
  },
});
