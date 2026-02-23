import { HistoryDaySummary, HistoryMonthSection } from "@/src/features/history/types";

export function parseDateKey(dateKey: string): Date | null {
  const parts = dateKey.split("-");

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function formatDayLabel(dateKey: string): string {
  const parsedDate = parseDateKey(dateKey);

  if (!parsedDate) {
    return dateKey;
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatLongDateLabel(dateKey: string): string {
  const parsedDate = parseDateKey(dateKey);

  if (!parsedDate) {
    return dateKey;
  }

  return parsedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function getRelativeDateLabel(dateKey: string, now: Date): string | null {
  const target = parseDateKey(dateKey);

  if (!target) {
    return null;
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const differenceMs = startOfToday.getTime() - startOfTarget.getTime();
  const differenceDays = Math.round(differenceMs / (1000 * 60 * 60 * 24));

  if (differenceDays === 0) {
    return "Today";
  }

  if (differenceDays === 1) {
    return "Yesterday";
  }

  return null;
}

export function formatMlToLiterLabel(valueMl: number): string {
  const liters = valueMl / 1000;

  return `${liters.toFixed(1)}L`;
}

export function groupHistoryByMonth(
  days: HistoryDaySummary[],
): HistoryMonthSection[] {
  const grouped = new Map<string, HistoryDaySummary[]>();

  days.forEach((day) => {
    const parsedDate = parseDateKey(day.dateKey);
    const monthTitle = parsedDate
      ? parsedDate.toLocaleDateString(undefined, {
          month: "long",
        })
      : "Unknown";

    const existing = grouped.get(monthTitle);

    if (existing) {
      existing.push(day);
      return;
    }

    grouped.set(monthTitle, [day]);
  });

  return Array.from(grouped.entries()).map(([title, data]) => ({
    title,
    data,
  }));
}
