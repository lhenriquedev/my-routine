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
