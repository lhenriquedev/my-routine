export const todayKeys = {
  all: ["today"] as const,
  byDate: (dateKey: string) => ["today", dateKey] as const,
};
