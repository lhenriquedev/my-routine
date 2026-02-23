import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todayKeys } from "@/src/features/today/query/today-keys";
import {
  applyAddWater,
  applyAddCustomHabit,
  applyAddSymptomPreset,
  applyLogSymptomDetailed,
  applySaveQuickNote,
  applyToggleHabit,
  todayService,
} from "@/src/features/today/services/today-service";
import { HabitIcon, TodayEntry } from "@/src/features/today/types";

interface MutationContext {
  previousEntry?: TodayEntry;
}

export function useTodayMutations(dateKey: string) {
  const queryClient = useQueryClient();
  const queryKey = todayKeys.byDate(dateKey);

  const toggleHabitMutation = useMutation<
    TodayEntry,
    Error,
    { habitId: string },
    MutationContext
  >({
    mutationFn: ({ habitId }) => todayService.toggleHabit(dateKey, habitId),
    onMutate: async ({ habitId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousEntry = queryClient.getQueryData<TodayEntry>(queryKey);
      if (previousEntry) {
        queryClient.setQueryData(
          queryKey,
          applyToggleHabit(previousEntry, habitId, new Date().toISOString()),
        );
      }
      return { previousEntry };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEntry) {
        queryClient.setQueryData(queryKey, context.previousEntry);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const addWaterMutation = useMutation<
    TodayEntry,
    Error,
    { amountMl: number },
    MutationContext
  >({
    mutationFn: ({ amountMl }) => todayService.addWater(dateKey, amountMl),
    onMutate: async ({ amountMl }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousEntry = queryClient.getQueryData<TodayEntry>(queryKey);
      if (previousEntry) {
        queryClient.setQueryData(
          queryKey,
          applyAddWater(previousEntry, amountMl, new Date().toISOString()),
        );
      }
      return { previousEntry };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEntry) {
        queryClient.setQueryData(queryKey, context.previousEntry);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const saveQuickNoteMutation = useMutation<
    TodayEntry,
    Error,
    { note: string },
    MutationContext
  >({
    mutationFn: ({ note }) => todayService.saveQuickNote(dateKey, note),
    onMutate: async ({ note }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousEntry = queryClient.getQueryData<TodayEntry>(queryKey);
      if (previousEntry) {
        queryClient.setQueryData(
          queryKey,
          applySaveQuickNote(previousEntry, note, new Date().toISOString()),
        );
      }
      return { previousEntry };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEntry) {
        queryClient.setQueryData(queryKey, context.previousEntry);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const logSymptomDetailedMutation = useMutation<
    TodayEntry,
    Error,
    {
      symptomName: string;
      intensity: 1 | 2 | 3 | 4 | 5;
      note?: string;
      loggedAt?: string;
    },
    MutationContext
  >({
    mutationFn: (input) => todayService.logSymptomDetailed(dateKey, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previousEntry = queryClient.getQueryData<TodayEntry>(queryKey);
      if (previousEntry) {
        queryClient.setQueryData(
          queryKey,
          applyLogSymptomDetailed(
            previousEntry,
            input,
            new Date().toISOString(),
          ),
        );
      }
      return { previousEntry };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEntry) {
        queryClient.setQueryData(queryKey, context.previousEntry);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const addCustomHabitMutation = useMutation<
    TodayEntry,
    Error,
    { label: string; icon?: HabitIcon },
    MutationContext
  >({
    mutationFn: (input) => todayService.addCustomHabit(dateKey, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previousEntry = queryClient.getQueryData<TodayEntry>(queryKey);
      if (previousEntry) {
        queryClient.setQueryData(
          queryKey,
          applyAddCustomHabit(previousEntry, input, new Date().toISOString()),
        );
      }
      return { previousEntry };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEntry) {
        queryClient.setQueryData(queryKey, context.previousEntry);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const addSymptomPresetMutation = useMutation<
    TodayEntry,
    Error,
    { name: string },
    MutationContext
  >({
    mutationFn: (input) => todayService.addSymptomPreset(dateKey, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previousEntry = queryClient.getQueryData<TodayEntry>(queryKey);
      if (previousEntry) {
        queryClient.setQueryData(
          queryKey,
          applyAddSymptomPreset(previousEntry, input, new Date().toISOString()),
        );
      }
      return { previousEntry };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEntry) {
        queryClient.setQueryData(queryKey, context.previousEntry);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    toggleHabitMutation,
    addWaterMutation,
    saveQuickNoteMutation,
    logSymptomDetailedMutation,
    addCustomHabitMutation,
    addSymptomPresetMutation,
  };
}
