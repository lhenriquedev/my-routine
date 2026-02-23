import { useQuery } from "@tanstack/react-query";
import { historyKeys } from "@/src/features/history/query/history-keys";
import { historyService } from "@/src/features/history/services/history-service";

export function useHistoryListQuery(days: number = 60) {
  return useQuery({
    queryKey: historyKeys.list(days),
    queryFn: () => historyService.listDays(days),
  });
}
