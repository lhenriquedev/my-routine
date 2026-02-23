import { useMemo, useState } from "react";
import { router } from "expo-router";
import { TODAY_HABITS } from "@/src/features/today/constants";
import { useTodayMutations } from "@/src/features/today/hooks/use-today-mutations";
import { useTodayQuery } from "@/src/features/today/hooks/use-today-query";
import {
  getLocalDateKey,
  selectTodayViewModel,
} from "@/src/features/today/selectors/today-selectors";
import {
  createDefaultTodayEntry,
  selectLastSymptom,
} from "@/src/features/today/services/today-service";
import { HabitDefinition, HabitIcon } from "@/src/features/today/types";

interface LogSymptomInput {
  symptomName: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  note?: string;
  loggedAt?: string;
}

export function useTodayScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dateKey = useMemo(() => getLocalDateKey(new Date()), []);
  const todayQuery = useTodayQuery(dateKey);
  const mutations = useTodayMutations(dateKey);

  const entry = todayQuery.data ?? createDefaultTodayEntry(dateKey);
  const vm = selectTodayViewModel(entry, new Date());
  const habits: HabitDefinition[] = useMemo(
    () => [...TODAY_HABITS, ...entry.customHabits],
    [entry.customHabits],
  );
  const lastSymptom = useMemo(() => selectLastSymptom(entry), [entry]);

  const setMutationError = (error: Error) => {
    setErrorMessage(error.message || "Something went wrong.");
  };

  const actions = {
    dismissError: () => setErrorMessage(null),
    toggleHabit: (habitId: string) => {
      mutations.toggleHabitMutation.mutate(
        { habitId },
        {
          onError: setMutationError,
        },
      );
    },
    addWater: (amountMl: number) => {
      mutations.addWaterMutation.mutate(
        { amountMl },
        {
          onError: setMutationError,
        },
      );
    },
    addCustomHabit: async (input: { label: string; icon?: HabitIcon }) => {
      setErrorMessage(null);
      try {
        await mutations.addCustomHabitMutation.mutateAsync(input);
      } catch (error) {
        const typedError =
          error instanceof Error ? error : new Error("Something went wrong.");
        setMutationError(typedError);
        throw typedError;
      }
    },
    addSymptomPreset: async (name: string) => {
      setErrorMessage(null);
      try {
        await mutations.addSymptomPresetMutation.mutateAsync({ name });
      } catch (error) {
        const typedError =
          error instanceof Error ? error : new Error("Something went wrong.");
        setMutationError(typedError);
        throw typedError;
      }
    },
    logSymptom: async (input: LogSymptomInput) => {
      setErrorMessage(null);
      try {
        await mutations.logSymptomDetailedMutation.mutateAsync(input);
      } catch (error) {
        const typedError =
          error instanceof Error ? error : new Error("Something went wrong.");
        setMutationError(typedError);
        throw typedError;
      }
    },
    saveQuickNote: (note: string) => {
      mutations.saveQuickNoteMutation.mutate(
        { note },
        {
          onError: setMutationError,
        },
      );
    },
    goToReviewDay: () => {
      router.push("/review-day");
    },
  };

  return {
    habits,
    entry,
    lastSymptom,
    vm,
    actions,
    ui: {
      isLoading: todayQuery.isLoading,
      isFetching: todayQuery.isFetching,
      isSavingNote: mutations.saveQuickNoteMutation.isPending,
      isMutatingWater: mutations.addWaterMutation.isPending,
      isAddingHabit: mutations.addCustomHabitMutation.isPending,
      isSavingSymptom: mutations.logSymptomDetailedMutation.isPending,
      isAddingSymptomPreset: mutations.addSymptomPresetMutation.isPending,
      errorMessage,
    },
  };
}
