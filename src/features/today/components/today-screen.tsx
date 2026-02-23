import { useRef } from "react";
import { router } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AddHabitSheet } from "@/src/features/today/components/add-habit-sheet";
import { ActionFeedbackToast } from "@/src/features/today/components/action-feedback-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { DayHeaderCard } from "@/src/features/today/components/day-header-card";
import { HabitsSection } from "@/src/features/today/components/habits-section";
import { HydrationSection } from "@/src/features/today/components/hydration-section";
import { LogSymptomSheet } from "@/src/features/today/components/log-symptom-sheet";
import { NextBestActionCard } from "@/src/features/today/components/next-best-action-card";
import { QuickSummaryRow } from "@/src/features/today/components/quick-summary-row";
import { QuickNoteSection } from "@/src/features/today/components/quick-note-section";
import { ReviewDayCta } from "@/src/features/today/components/review-day-cta";
import { SymptomsSection } from "@/src/features/today/components/symptoms-section";
import { TodayTimelineSection } from "@/src/features/today/components/today-timeline-section";
import { useTodayScreen } from "@/src/features/today/hooks/use-today-screen";
import { AppText } from "@/src/ui/app-text";

export function TodayScreen() {
  const symptomSheetModalRef = useRef<BottomSheetModal>(null);
  const habitSheetModalRef = useRef<BottomSheetModal>(null);
  const { habits, entry, lastSymptom, vm, nextBestAction, quickSummary, timelineEvents, actions, ui } =
    useTodayScreen();

  const openSymptomSheet = () => {
    symptomSheetModalRef.current?.present();
  };

  const openHabitSheet = () => {
    habitSheetModalRef.current?.present();
  };

  const handleNextBestAction = () => {
    switch (nextBestAction.action) {
      case "add_water":
        actions.addWater(250);
        break;
      case "complete_habit":
        if (nextBestAction.habitId) {
          actions.toggleHabit(nextBestAction.habitId);
          break;
        }

        openHabitSheet();
        break;
      case "log_symptom":
        openSymptomSheet();
        break;
      case "add_note":
        actions.setFeedbackMessage("Notes section is ready below.");
        break;
      case "go_review":
        actions.goToReviewDay();
        break;
      default:
        break;
    }
  };

  if (ui.isLoading) {
    return (
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#37e389" />
          <AppText variant="body" style={styles.loadingText}>
            Loading today...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <DayHeaderCard vm={vm} />

        <NextBestActionCard action={nextBestAction} onPress={handleNextBestAction} />

        <QuickSummaryRow summary={quickSummary} />

        <TodayTimelineSection
          events={timelineEvents}
          onPressPrimaryAction={handleNextBestAction}
          onPressSeeMore={() => router.push("/(tabs)/history")}
        />

        {ui.errorMessage ? (
          <Pressable onPress={actions.dismissError} style={styles.errorBanner}>
            <AppText variant="body" style={styles.errorText}>
              {ui.errorMessage}
            </AppText>
          </Pressable>
        ) : null}

        <HabitsSection
          habits={habits}
          completion={entry.habitsCompletion}
          onToggleHabit={actions.toggleHabit}
          onAddHabit={openHabitSheet}
        />

        <SymptomsSection
          lastSymptom={lastSymptom}
          onOpenLogSymptom={openSymptomSheet}
        />

        <HydrationSection
          waterMl={entry.waterMl}
          waterGoalMl={entry.waterGoalMl}
          waterProgressPercent={vm.waterProgressPercent}
          isMutating={ui.isMutatingWater}
          onAddWater={actions.addWater}
        />

        <QuickNoteSection
          savedNote={entry.quickNote}
          onSave={actions.saveQuickNote}
          isSaving={ui.isSavingNote}
        />

        <ReviewDayCta
          variant={vm.reviewCtaVariant}
          onPress={actions.goToReviewDay}
        />
      </ScrollView>

      <LogSymptomSheet
        modalRef={symptomSheetModalRef}
        symptomPresets={entry.symptomPresets}
        isSavingSymptom={ui.isSavingSymptom}
        isAddingPreset={ui.isAddingSymptomPreset}
        onSaveSymptom={actions.logSymptom}
        onAddPreset={actions.addSymptomPreset}
      />

      <AddHabitSheet
        modalRef={habitSheetModalRef}
        isSubmitting={ui.isAddingHabit}
        onSubmit={actions.addCustomHabit}
      />

      {ui.feedbackMessage ? <ActionFeedbackToast message={ui.feedbackMessage} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#031313",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#98b2a8",
    fontSize: 16,
  },
  errorBanner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#874343",
    backgroundColor: "#3a1d1d",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: "#f6b9b9",
    fontSize: 15,
  },
});
