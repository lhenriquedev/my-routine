import { SymptomLogEntry, TodayEntry } from "@/src/features/today/types";

export type HistoryDayStatus = "reviewed" | "pending_review" | "no_data";
export type HistoryPeriodDays = 7 | 30 | 90;
export type HistoryCategoryFilter =
  | "all"
  | "hydration"
  | "habits"
  | "symptoms"
  | "journal";

export interface HistoryDaySummary {
  dateKey: string;
  dateLabel: string;
  relativeLabel: string | null;
  status: HistoryDayStatus;
  waterMl: number;
  waterGoalMl: number;
  completedHabitsCount: number;
  totalHabitsCount: number;
  completedHabitLabels: string[];
  symptomCount: number;
  topSymptoms: string[];
  quickNotePreview: string;
  lastEntryAt: string | null;
  hasJournal: boolean;
  hasAnyActivity: boolean;
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
