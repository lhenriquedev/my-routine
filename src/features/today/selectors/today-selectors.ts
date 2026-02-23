import {
  TodayEntry,
  TodayStatus,
  TodayViewModel,
} from "@/src/features/today/types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayStatus(entry: TodayEntry): TodayStatus {
  const hasCompletedHabit = Object.values(entry.habitsCompletion).some(Boolean);
  const hasWater = entry.waterMl > 0;
  const hasSymptom = entry.symptomLogs.length > 0;
  const hasNote = entry.quickNote.trim().length > 0;

  return hasCompletedHabit || hasWater || hasSymptom || hasNote
    ? "in_progress"
    : "empty";
}

export function getLoggedItemsCount(entry: TodayEntry): number {
  const completedHabits = Object.values(entry.habitsCompletion).filter(
    Boolean,
  ).length;
  const waterCount = entry.waterMl > 0 ? 1 : 0;
  const symptomCount = entry.symptomLogs.length > 0 ? 1 : 0;
  const noteCount = entry.quickNote.trim().length > 0 ? 1 : 0;
  return completedHabits + waterCount + symptomCount + noteCount;
}

export function getTrackedItemsTotal(entry: TodayEntry): number {
  return Object.keys(entry.habitsCompletion).length + 3;
}

export function getGreetingLabel(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function selectTodayViewModel(
  entry: TodayEntry,
  now: Date,
): TodayViewModel {
  const status = getTodayStatus(entry);
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const progressCount = getLoggedItemsCount(entry);
  const trackedItemsTotal = getTrackedItemsTotal(entry);
  const waterProgressPercent = clamp(
    Math.round((entry.waterMl / entry.waterGoalMl) * 100),
    0,
    100,
  );

  const lastEntryLabel =
    entry.lastEntryAt === null
      ? "No entries yet"
      : new Date(entry.lastEntryAt).toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        });

  return {
    dateLabel,
    greetingLabel: getGreetingLabel(now),
    dayStatus: status,
    dayStatusLabel:
      status === "empty" ? "Waiting for your first entry" : "Day in progress",
    progressLabel: `${progressCount} of ${trackedItemsTotal} items logged`,
    lastEntryLabel,
    waterProgressPercent,
    reviewCtaVariant: progressCount >= 4 ? "emphasized" : "default",
  };
}
