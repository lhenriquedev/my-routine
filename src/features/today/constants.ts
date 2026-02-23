import { HabitDefinition } from "@/src/features/today/types";

export const DEFAULT_WATER_GOAL_ML = 2000;

export const HABIT_NAME_MIN_LENGTH = 2;
export const HABIT_NAME_MAX_LENGTH = 32;
export const SYMPTOM_NAME_MIN_LENGTH = 2;
export const SYMPTOM_NAME_MAX_LENGTH = 40;

export const TODAY_HABITS: HabitDefinition[] = [
  { id: "coffee", label: "Coffee", icon: "cafe" },
  { id: "study", label: "Study", icon: "book" },
  { id: "workout", label: "Workout", icon: "barbell" },
];

export const DEFAULT_SYMPTOM_PRESETS = [
  "Headache",
  "Negative thoughts",
  "Fatigue",
  "Anxiety",
  "Bloating",
];
