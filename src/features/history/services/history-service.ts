import { TODAY_HABITS } from "@/src/features/today/constants";
import { todayService } from "@/src/features/today/services/today-service";
import { SymptomLogEntry, TodayEntry } from "@/src/features/today/types";
import {
  formatDayLabel,
  formatLongDateLabel,
  formatMlToLiterLabel,
  getRelativeDateLabel,
} from "@/src/features/history/selectors/history-selectors";
import { HistoryDaySummary, HistoryDetailViewModel } from "@/src/features/history/types";
import { supabase } from "@/src/lib/supabase";

interface DailyEntryRow {
  id: string;
  entry_date: string;
  water_ml: number;
  water_goal_ml: number;
  quick_note: string;
  last_entry_at: string | null;
}

interface SymptomLogRow {
  entry_id: string;
  symptom_name: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  note: string;
  logged_at: string;
}

interface SystemHabitStatusRow {
  entry_id: string;
  habit_id: string;
  is_completed: boolean;
}

interface CustomHabitStatusRow {
  entry_id: string;
  custom_habit_id: string;
  is_completed: boolean;
}

interface CustomHabitRow {
  id: string;
  label: string;
}

function assertSupabaseError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

async function requireUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user.id;

  if (!userId) {
    throw new Error("You must be logged in.");
  }

  return userId;
}

function getTodayDateKey(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function countCompletedHabits(entry: TodayEntry): number {
  return Object.values(entry.habitsCompletion).filter(Boolean).length;
}

function getCompletedHabitLabels(entry: TodayEntry): string[] {
  const customHabitById = new Map(
    entry.customHabits.map((habit) => [habit.id, habit.label]),
  );

  return Object.entries(entry.habitsCompletion)
    .filter(([, completed]) => completed)
    .map(([habitId]) => {
      const systemHabit = TODAY_HABITS.find((habit) => habit.id === habitId);

      if (systemHabit) {
        return systemHabit.label;
      }

      return customHabitById.get(habitId) ?? "Custom habit";
    });
}

function buildInsight(entry: TodayEntry): Pick<HistoryDetailViewModel, "insightTitle" | "insightBody"> {
  const completedCount = countCompletedHabits(entry);
  const totalHabits = Object.keys(entry.habitsCompletion).length;
  const completionRatio = totalHabits > 0 ? completedCount / totalHabits : 0;
  const waterGoalReached = entry.waterGoalMl > 0 && entry.waterMl >= entry.waterGoalMl;

  if (waterGoalReached && completionRatio >= 0.7) {
    return {
      insightTitle: "Daily insight",
      insightBody:
        "You protected your baseline today with strong hydration and consistent habits. Repeating your first completed habit tomorrow can help keep that momentum.",
    };
  }

  if (entry.symptomLogs.length > 0) {
    return {
      insightTitle: "Daily insight",
      insightBody:
        "Symptoms appeared today, but your logs make patterns visible. Keep tracking timing and intensity so tomorrow starts with better context.",
    };
  }

  return {
    insightTitle: "Daily insight",
    insightBody:
      "Your routine data is building useful signal over time. A small win tomorrow morning is enough to keep progress moving.",
  };
}

export const historyService = {
  async listDays(days: number = 60): Promise<HistoryDaySummary[]> {
    const userId = await requireUserId();
    const now = new Date();
    const todayDateKey = getTodayDateKey(now);

    const { data: entriesData, error: entriesError } = await supabase
      .from("daily_entries")
      .select("id,entry_date,water_ml,water_goal_ml,quick_note,last_entry_at")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .limit(days);

    assertSupabaseError(entriesError);

    const entries = (entriesData ?? []) as DailyEntryRow[];
    const entryIds = entries.map((entry) => entry.id);

    if (entryIds.length === 0) {
      return [];
    }

    const [symptomLogsResult, systemHabitsResult, customHabitsResult, customHabitLabelsResult] =
      await Promise.all([
        supabase
          .from("symptom_logs")
          .select("entry_id,symptom_name,intensity,note,logged_at")
          .eq("user_id", userId)
          .in("entry_id", entryIds)
          .order("logged_at", { ascending: false }),
        supabase
          .from("daily_system_habit_status")
          .select("entry_id,habit_id,is_completed")
          .eq("user_id", userId)
          .in("entry_id", entryIds),
        supabase
          .from("daily_custom_habit_status")
          .select("entry_id,custom_habit_id,is_completed")
          .eq("user_id", userId)
          .in("entry_id", entryIds),
        supabase
          .from("custom_habits")
          .select("id,label")
          .eq("user_id", userId),
      ]);

    assertSupabaseError(symptomLogsResult.error);
    assertSupabaseError(systemHabitsResult.error);
    assertSupabaseError(customHabitsResult.error);
    assertSupabaseError(customHabitLabelsResult.error);

    const symptomLogs = (symptomLogsResult.data ?? []) as SymptomLogRow[];
    const systemStatuses = (systemHabitsResult.data ?? []) as SystemHabitStatusRow[];
    const customStatuses = (customHabitsResult.data ?? []) as CustomHabitStatusRow[];
    const customHabits = (customHabitLabelsResult.data ?? []) as CustomHabitRow[];
    const customHabitLabelById = new Map(customHabits.map((habit) => [habit.id, habit.label]));

    const symptomsByEntryId = new Map<string, SymptomLogRow[]>();
    symptomLogs.forEach((log) => {
      const existing = symptomsByEntryId.get(log.entry_id);
      if (existing) {
        existing.push(log);
      } else {
        symptomsByEntryId.set(log.entry_id, [log]);
      }
    });

    const completedSystemHabitsByEntryId = new Map<string, string[]>();
    systemStatuses.forEach((row) => {
      if (!row.is_completed) {
        return;
      }

      const existing = completedSystemHabitsByEntryId.get(row.entry_id);
      const systemLabel = TODAY_HABITS.find((habit) => habit.id === row.habit_id)?.label;
      const habitLabel = systemLabel ?? "Habit";

      if (existing) {
        existing.push(habitLabel);
      } else {
        completedSystemHabitsByEntryId.set(row.entry_id, [habitLabel]);
      }
    });

    const completedCustomHabitsByEntryId = new Map<string, string[]>();
    customStatuses.forEach((row) => {
      if (!row.is_completed) {
        return;
      }

      const existing = completedCustomHabitsByEntryId.get(row.entry_id);
      const habitLabel = customHabitLabelById.get(row.custom_habit_id) ?? "Custom habit";

      if (existing) {
        existing.push(habitLabel);
      } else {
        completedCustomHabitsByEntryId.set(row.entry_id, [habitLabel]);
      }
    });

    return entries
      .map((entry): HistoryDaySummary => {
        const entrySymptoms = symptomsByEntryId.get(entry.id) ?? [];
        const symptomNames = Array.from(
          new Set(entrySymptoms.map((symptom) => symptom.symptom_name)),
        );
        const completedHabits = [
          ...(completedSystemHabitsByEntryId.get(entry.id) ?? []),
          ...(completedCustomHabitsByEntryId.get(entry.id) ?? []),
        ];
        const hasAnyActivity =
          entry.water_ml > 0 ||
          completedHabits.length > 0 ||
          entrySymptoms.length > 0 ||
          entry.quick_note.trim().length > 0 ||
          entry.last_entry_at !== null;
        const isToday = entry.entry_date === todayDateKey;

        let status: HistoryDaySummary["status"];

        if (isToday) {
          status = "in_progress";
        } else if (entry.water_goal_ml > 0 && entry.water_ml >= entry.water_goal_ml && completedHabits.length > 0) {
          status = "reviewed";
        } else {
          status = hasAnyActivity ? "logged" : "in_progress";
        }

        return {
          dateKey: entry.entry_date,
          dateLabel: formatDayLabel(entry.entry_date),
          relativeLabel: getRelativeDateLabel(entry.entry_date, now),
          status,
          waterMl: entry.water_ml,
          waterGoalMl: entry.water_goal_ml,
          completedHabitsCount: completedHabits.length,
          completedHabitLabels: completedHabits.slice(0, 2),
          symptomCount: entrySymptoms.length,
          topSymptoms: symptomNames.slice(0, 2),
          quickNotePreview: entry.quick_note.trim(),
          lastEntryAt: entry.last_entry_at,
        };
      })
      .filter((entry) =>
        entry.relativeLabel === "Today"
          ? true
          : entry.completedHabitsCount > 0 ||
            entry.symptomCount > 0 ||
            entry.waterMl > 0 ||
            entry.quickNotePreview.length > 0,
      );
  },

  async getDayDetails(dateKey: string): Promise<HistoryDetailViewModel> {
    const entry = await todayService.getByDate(dateKey);
    const completedHabitsCount = countCompletedHabits(entry);
    const totalHabitsCount = Object.keys(entry.habitsCompletion).length;
    const hydrationProgressPercent =
      entry.waterGoalMl <= 0
        ? 0
        : Math.min(Math.round((entry.waterMl / entry.waterGoalMl) * 100), 100);
    const insight = buildInsight(entry);

    return {
      entry,
      dateLabel: formatLongDateLabel(dateKey),
      hydrationValueLabel: `${entry.waterMl.toLocaleString()} ml`,
      hydrationGoalLabel: `Target: ${entry.waterGoalMl.toLocaleString()} ml`,
      hydrationProgressPercent,
      completedHabitsCount,
      totalHabitsCount,
      completedHabitLabels: getCompletedHabitLabels(entry),
      symptoms: [...entry.symptomLogs].sort(
        (a: SymptomLogEntry, b: SymptomLogEntry) =>
          new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
      ),
      insightTitle: insight.insightTitle,
      insightBody: insight.insightBody,
      journalText:
        entry.quickNote.trim().length > 0
          ? entry.quickNote.trim()
          : "No evening journal saved for this day.",
    };
  },

  formatHydrationCompactLabel(waterMl: number, waterGoalMl: number): string {
    return `${formatMlToLiterLabel(waterMl)} / ${formatMlToLiterLabel(waterGoalMl)}`;
  },
};
