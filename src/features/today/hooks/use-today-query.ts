import { useQuery } from "@tanstack/react-query";
import { todayKeys } from "@/src/features/today/query/today-keys";
import { todayService } from "@/src/features/today/services/today-service";

export function useTodayQuery(dateKey: string) {
  return useQuery({
    queryKey: todayKeys.byDate(dateKey),
    queryFn: () => todayService.getByDate(dateKey),
  });
}
