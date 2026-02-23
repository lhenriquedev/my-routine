import {
  NextBestActionVM,
  QuickSummaryVM,
  TimelineEventVM,
  TodayEntry,
  TodayStatus,
  TodayViewModel,
} from "@/src/features/today/types";
import { TODAY_HABITS } from "@/src/features/today/constants";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getCompletedHabitsCount(entry: TodayEntry): number {
  return Object.values(entry.habitsCompletion).filter(Boolean).length;
}

function getTotalHabitsCount(entry: TodayEntry): number {
  return TODAY_HABITS.length + entry.customHabits.length;
}

function getPendingHabit(entry: TodayEntry): { id: string; label: string } | null {
  const allHabits = [...TODAY_HABITS, ...entry.customHabits];

  for (const habit of allHabits) {
    if (!(entry.habitsCompletion[habit.id] ?? false)) {
      return { id: habit.id, label: habit.label };
    }
  }

  return null;
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
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
  const completedHabits = getCompletedHabitsCount(entry);
  const waterCount = entry.waterMl > 0 ? 1 : 0;
  const symptomCount = entry.symptomLogs.length > 0 ? 1 : 0;
  const noteCount = entry.quickNote.trim().length > 0 ? 1 : 0;
  return completedHabits + waterCount + symptomCount + noteCount;
}

export function getTrackedItemsTotal(entry: TodayEntry): number {
  return getTotalHabitsCount(entry) + 3;
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

export function selectQuickSummary(entry: TodayEntry): QuickSummaryVM {
  return {
    water: {
      current: entry.waterMl,
      goal: entry.waterGoalMl,
    },
    habits: {
      completed: getCompletedHabitsCount(entry),
      total: getTotalHabitsCount(entry),
    },
    symptoms: {
      count: entry.symptomLogs.length,
    },
  };
}

export function selectNextBestAction(
  entry: TodayEntry,
  now: Date,
): NextBestActionVM {
  const progressCount = getLoggedItemsCount(entry);
  const pendingHabit = getPendingHabit(entry);
  const hour = now.getHours();
  const waterProgressPercent = clamp(
    Math.round((entry.waterMl / entry.waterGoalMl) * 100),
    0,
    100,
  );

  if (progressCount === 0) {
    if (hour < 16) {
      return {
        title: "Good start",
        subtitle: "Log your first action of the day.",
        buttonLabel: "+250 ml now",
        action: "add_water",
      };
    }

    return {
      title: "Start your routine",
      subtitle: "One quick habit can kick off your day.",
      buttonLabel: pendingHabit
        ? `Complete ${pendingHabit.label}`
        : "Log a habit",
      action: pendingHabit ? "complete_habit" : "add_water",
      habitId: pendingHabit?.id,
    };
  }

  if (progressCount >= 4 || hour >= 20) {
    return {
      title: "Almost there",
      subtitle: "Your day looks consistent.",
      buttonLabel: "Go to Review",
      action: "go_review",
    };
  }

  if (waterProgressPercent < 60) {
    return {
      title: "Hydration check",
      subtitle: "A quick water update keeps momentum.",
      buttonLabel: "+250 ml now",
      action: "add_water",
    };
  }

  if (pendingHabit) {
    return {
      title: "Next step",
      subtitle: "Keep your streak going with one habit.",
      buttonLabel: `Complete ${pendingHabit.label}`,
      action: "complete_habit",
      habitId: pendingHabit.id,
    };
  }

  if (entry.symptomLogs.length === 0 && hour >= 14) {
    return {
      title: "Body check",
      subtitle: "No symptoms yet. Log if anything changed.",
      buttonLabel: "Log symptom",
      action: "log_symptom",
    };
  }

  if (entry.quickNote.trim().length === 0 && hour >= 17) {
    return {
      title: "Quick reflection",
      subtitle: "Save a short note before day review.",
      buttonLabel: "Add a note",
      action: "add_note",
    };
  }

  return {
    title: "Ready when you are",
    subtitle: "Review your day whenever it feels right.",
    buttonLabel: "Go to Review",
    action: "go_review",
  };
}

export function selectTimelineEvents(entry: TodayEntry): TimelineEventVM[] {
  const events: (TimelineEventVM & { timestamp: number })[] = [];

  for (const symptom of entry.symptomLogs) {
    const loggedAt = new Date(symptom.loggedAt);
    events.push({
      id: `symptom-${symptom.id}`,
      time: formatTimeLabel(loggedAt),
      icon: "bandage",
      label: `${symptom.symptomName} intensity ${symptom.intensity}`,
      type: "symptom",
      timestamp: loggedAt.getTime(),
    });
  }

  if (entry.lastEntryAt) {
    const lastEntryAt = new Date(entry.lastEntryAt);
    const timestamp = lastEntryAt.getTime();
    const completedHabits = [...TODAY_HABITS, ...entry.customHabits].filter(
      (habit) => entry.habitsCompletion[habit.id] ?? false,
    );

    if (entry.waterMl > 0) {
      events.push({
        id: `water-${entry.dateKey}`,
        time: formatTimeLabel(lastEntryAt),
        icon: "water",
        label: `${entry.waterMl} ml water logged`,
        type: "water",
        timestamp,
      });
    }

    for (const habit of completedHabits.slice(0, 2)) {
      events.push({
        id: `habit-${habit.id}`,
        time: formatTimeLabel(lastEntryAt),
        icon: "checkmark-circle",
        label: `${habit.label} completed`,
        type: "habit",
        timestamp,
      });
    }

    if (entry.quickNote.trim().length > 0) {
      events.push({
        id: `note-${entry.dateKey}`,
        time: formatTimeLabel(lastEntryAt),
        icon: "create",
        label: "Quick note updated",
        type: "note",
        timestamp,
      });
    }
  }

  return events
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map(({ timestamp: _timestamp, ...event }) => event);
}
