export const historyKeys = {
  all: ["history"] as const,
  list: (days: number) => ["history", "list", days] as const,
  day: (dateKey: string) => ["history", "day", dateKey] as const,
};
