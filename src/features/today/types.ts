export type HabitIcon = "cafe" | "book" | "barbell" | "leaf";

export type TodayStatus = "empty" | "in_progress";

export type ReviewCtaVariant = "default" | "emphasized";

export interface HabitDefinition {
  id: string;
  label: string;
  icon: HabitIcon;
}

export interface CustomHabit extends HabitDefinition {
  createdAt: string;
}

export interface SymptomPreset {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface SymptomLogEntry {
  id: string;
  symptomName: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  note: string;
  loggedAt: string;
}

export interface TodayEntry {
  dateKey: string;
  waterMl: number;
  waterGoalMl: number;
  quickNote: string;
  habitsCompletion: Record<string, boolean>;
  customHabits: CustomHabit[];
  symptomPresets: SymptomPreset[];
  symptomLogs: SymptomLogEntry[];
  lastEntryAt: string | null;
}

export interface TodayViewModel {
  dateLabel: string;
  greetingLabel: string;
  dayStatus: TodayStatus;
  dayStatusLabel: string;
  progressLabel: string;
  lastEntryLabel: string;
  waterProgressPercent: number;
  reviewCtaVariant: ReviewCtaVariant;
}

export type NextBestActionType =
  | "add_water"
  | "complete_habit"
  | "log_symptom"
  | "add_note"
  | "go_review";

export interface NextBestActionVM {
  title: string;
  subtitle: string;
  buttonLabel: string;
  action: NextBestActionType;
  habitId?: string;
}

export interface QuickSummaryVM {
  water: { current: number; goal: number };
  habits: { completed: number; total: number };
  symptoms: { count: number };
}

export type TimelineEventType = "water" | "habit" | "symptom" | "note";

export interface TimelineEventVM {
  id: string;
  time: string;
  icon: string;
  label: string;
  type: TimelineEventType;
}
