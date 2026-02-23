import { useQuery } from "@tanstack/react-query";
import { historyKeys } from "@/src/features/history/query/history-keys";
import { historyService } from "@/src/features/history/services/history-service";

export function useHistoryDayQuery(dateKey: string) {
  return useQuery({
    queryKey: historyKeys.day(dateKey),
    queryFn: () => historyService.getDayDetails(dateKey),
    enabled: dateKey.length > 0,
  });
}
