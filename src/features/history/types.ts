import { SymptomLogEntry, TodayEntry } from "@/src/features/today/types";

export type HistoryDayStatus = "in_progress" | "reviewed" | "logged";

export interface HistoryDaySummary {
  dateKey: string;
  dateLabel: string;
  relativeLabel: string | null;
  status: HistoryDayStatus;
  waterMl: number;
  waterGoalMl: number;
  completedHabitsCount: number;
  completedHabitLabels: string[];
  symptomCount: number;
  topSymptoms: string[];
  quickNotePreview: string;
  lastEntryAt: string | null;
}

export interface HistoryMonthSection {
  title: string;
  data: HistoryDaySummary[];
}

export interface HistoryDetailViewModel {
  entry: TodayEntry;
  dateLabel: string;
  hydrationValueLabel: string;
  hydrationGoalLabel: string;
  hydrationProgressPercent: number;
  completedHabitsCount: number;
  totalHabitsCount: number;
  completedHabitLabels: string[];
  symptoms: SymptomLogEntry[];
  insightTitle: string;
  insightBody: string;
  journalText: string;
}
