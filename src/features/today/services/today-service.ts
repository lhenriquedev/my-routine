import {
  DEFAULT_SYMPTOM_PRESETS,
  DEFAULT_WATER_GOAL_ML,
  HABIT_NAME_MAX_LENGTH,
  HABIT_NAME_MIN_LENGTH,
  SYMPTOM_NAME_MAX_LENGTH,
  SYMPTOM_NAME_MIN_LENGTH,
  TODAY_HABITS,
} from "@/src/features/today/constants";
import { supabase } from "@/src/lib/supabase";
import {
  CustomHabit,
  HabitIcon,
  SymptomLogEntry,
  SymptomPreset,
  TodayEntry,
} from "@/src/features/today/types";

interface AddCustomHabitInput {
  label: string;
  icon?: HabitIcon;
}

interface AddSymptomPresetInput {
  name: string;
}

interface LogSymptomDetailedInput {
  symptomName: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  note?: string;
  loggedAt?: string;
}

interface DailyEntryRow {
  id: string;
  user_id: string;
  entry_date: string;
  water_ml: number;
  water_goal_ml: number;
  quick_note: string;
  last_entry_at: string | null;
}

interface CustomHabitRow {
  id: string;
  label: string;
  icon: HabitIcon;
  created_at: string;
}

interface SymptomPresetRow {
  id: string;
  name: string;
}

interface SymptomLogRow {
  id: string;
  symptom_name: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  note: string;
  logged_at: string;
}

interface DailySystemHabitStatusRow {
  habit_id: string;
  is_completed: boolean;
}

interface DailyCustomHabitStatusRow {
  custom_habit_id: string;
  is_completed: boolean;
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function toNameKey(value: string): string {
  return normalizeName(value).toLowerCase();
}

function toSlug(value: string): string {
  return normalizeName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createSymptomPreset(name: string): SymptomPreset {
  return {
    id: `symptom-${toSlug(name)}`,
    name,
    isDefault: true,
  };
}

function buildInitialHabitsCompletion(): TodayEntry["habitsCompletion"] {
  return TODAY_HABITS.reduce<TodayEntry["habitsCompletion"]>((acc, habit) => {
    acc[habit.id] = false;
    return acc;
  }, {});
}

function buildInitialSymptomPresets(): SymptomPreset[] {
  return DEFAULT_SYMPTOM_PRESETS.map(createSymptomPreset);
}

async function requireUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user.id;

  if (!userId) {
    throw new Error("You must be logged in.");
  }

  return userId;
}

function assertSupabaseError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

async function ensureDailyEntry(
  userId: string,
  dateKey: string,
): Promise<DailyEntryRow> {
  const { data, error } = await supabase
    .from("daily_entries")
    .upsert(
      {
        user_id: userId,
        entry_date: dateKey,
      },
      {
        onConflict: "user_id,entry_date",
      },
    )
    .select(
      "id,user_id,entry_date,water_ml,water_goal_ml,quick_note,last_entry_at",
    )
    .single();

  assertSupabaseError(error);

  return data as DailyEntryRow;
}

function toTodayEntry(
  row: DailyEntryRow,
  customHabitsRows: CustomHabitRow[],
  symptomPresetRows: SymptomPresetRow[],
  symptomLogRows: SymptomLogRow[],
  systemStatusRows: DailySystemHabitStatusRow[],
  customStatusRows: DailyCustomHabitStatusRow[],
): TodayEntry {
  const habitsCompletion = buildInitialHabitsCompletion();

  customHabitsRows.forEach((habit) => {
    habitsCompletion[habit.id] = false;
  });

  systemStatusRows.forEach((status) => {
    habitsCompletion[status.habit_id] = status.is_completed;
  });

  customStatusRows.forEach((status) => {
    habitsCompletion[status.custom_habit_id] = status.is_completed;
  });

  const defaultSymptomPresets = buildInitialSymptomPresets();
  const defaultSymptomNames = new Set(
    defaultSymptomPresets.map((preset) => toNameKey(preset.name)),
  );
  const customSymptomPresets = symptomPresetRows
    .filter((preset) => !defaultSymptomNames.has(toNameKey(preset.name)))
    .map((preset) => ({
      id: preset.id,
      name: preset.name,
      isDefault: false,
    }));

  return {
    dateKey: row.entry_date,
    waterMl: row.water_ml,
    waterGoalMl: row.water_goal_ml,
    quickNote: row.quick_note,
    habitsCompletion,
    customHabits: customHabitsRows.map((habit) => ({
      id: habit.id,
      label: habit.label,
      icon: habit.icon,
      createdAt: habit.created_at,
    })),
    symptomPresets: [...defaultSymptomPresets, ...customSymptomPresets],
    symptomLogs: symptomLogRows.map((log) => ({
      id: log.id,
      symptomName: log.symptom_name,
      intensity: log.intensity,
      note: log.note,
      loggedAt: log.logged_at,
    })),
    lastEntryAt: row.last_entry_at,
  };
}

async function getTodayEntryFromDb(dateKey: string): Promise<TodayEntry> {
  const userId = await requireUserId();
  const entryRow = await ensureDailyEntry(userId, dateKey);

  const [customHabitsResult, symptomPresetsResult, symptomLogsResult, systemStatusResult, customStatusResult] =
    await Promise.all([
      supabase
        .from("custom_habits")
        .select("id,label,icon,created_at")
        .eq("user_id", userId)
        .is("archived_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("symptom_presets")
        .select("id,name")
        .eq("user_id", userId)
        .is("archived_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("symptom_logs")
        .select("id,symptom_name,intensity,note,logged_at")
        .eq("entry_id", entryRow.id)
        .eq("user_id", userId)
        .order("logged_at", { ascending: true }),
      supabase
        .from("daily_system_habit_status")
        .select("habit_id,is_completed")
        .eq("entry_id", entryRow.id)
        .eq("user_id", userId),
      supabase
        .from("daily_custom_habit_status")
        .select("custom_habit_id,is_completed")
        .eq("entry_id", entryRow.id)
        .eq("user_id", userId),
    ]);

  assertSupabaseError(customHabitsResult.error);
  assertSupabaseError(symptomPresetsResult.error);
  assertSupabaseError(symptomLogsResult.error);
  assertSupabaseError(systemStatusResult.error);
  assertSupabaseError(customStatusResult.error);

  return toTodayEntry(
    entryRow,
    (customHabitsResult.data ?? []) as CustomHabitRow[],
    (symptomPresetsResult.data ?? []) as SymptomPresetRow[],
    (symptomLogsResult.data ?? []) as SymptomLogRow[],
    (systemStatusResult.data ?? []) as DailySystemHabitStatusRow[],
    (customStatusResult.data ?? []) as DailyCustomHabitStatusRow[],
  );
}

async function touchLastEntryAt(entryId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("daily_entries")
    .update({
      last_entry_at: new Date().toISOString(),
    })
    .eq("id", entryId)
    .eq("user_id", userId);

  assertSupabaseError(error);
}

export function createDefaultTodayEntry(dateKey: string): TodayEntry {
  return {
    dateKey,
    waterMl: 0,
    waterGoalMl: DEFAULT_WATER_GOAL_ML,
    quickNote: "",
    habitsCompletion: buildInitialHabitsCompletion(),
    customHabits: [],
    symptomPresets: buildInitialSymptomPresets(),
    symptomLogs: [],
    lastEntryAt: null,
  };
}

export function applyToggleHabit(
  entry: TodayEntry,
  habitId: string,
  nowIso: string,
): TodayEntry {
  const currentValue = entry.habitsCompletion[habitId] ?? false;

  return {
    ...entry,
    habitsCompletion: {
      ...entry.habitsCompletion,
      [habitId]: !currentValue,
    },
    lastEntryAt: nowIso,
  };
}

export function applyAddWater(
  entry: TodayEntry,
  amountMl: number,
  nowIso: string,
): TodayEntry {
  const nextWaterMl = Math.max(0, entry.waterMl + amountMl);

  return {
    ...entry,
    waterMl: nextWaterMl,
    lastEntryAt: nowIso,
  };
}

export function applySaveQuickNote(
  entry: TodayEntry,
  note: string,
  nowIso: string,
): TodayEntry {
  return {
    ...entry,
    quickNote: note,
    lastEntryAt: nowIso,
  };
}

export function applyAddCustomHabit(
  entry: TodayEntry,
  input: AddCustomHabitInput,
  nowIso: string,
): TodayEntry {
  const label = normalizeName(input.label);
  if (
    label.length < HABIT_NAME_MIN_LENGTH ||
    label.length > HABIT_NAME_MAX_LENGTH
  ) {
    throw new Error(
      `Habit name should be ${HABIT_NAME_MIN_LENGTH}-${HABIT_NAME_MAX_LENGTH} characters.`,
    );
  }

  const existingNames = [
    ...TODAY_HABITS.map((habit) => habit.label),
    ...entry.customHabits.map((habit) => habit.label),
  ];
  const alreadyExists = existingNames.some(
    (name) => toNameKey(name) === toNameKey(label),
  );

  if (alreadyExists) {
    throw new Error("This habit already exists.");
  }

  const habitId = `habit-${toSlug(label)}-${Date.now()}`;
  const customHabit: CustomHabit = {
    id: habitId,
    label,
    icon: input.icon ?? "leaf",
    createdAt: nowIso,
  };

  return {
    ...entry,
    customHabits: [...entry.customHabits, customHabit],
    habitsCompletion: {
      ...entry.habitsCompletion,
      [habitId]: false,
    },
    lastEntryAt: nowIso,
  };
}

export function applyAddSymptomPreset(
  entry: TodayEntry,
  input: AddSymptomPresetInput,
  nowIso: string,
): TodayEntry {
  const name = normalizeName(input.name);
  if (
    name.length < SYMPTOM_NAME_MIN_LENGTH ||
    name.length > SYMPTOM_NAME_MAX_LENGTH
  ) {
    throw new Error(
      `Symptom name should be ${SYMPTOM_NAME_MIN_LENGTH}-${SYMPTOM_NAME_MAX_LENGTH} characters.`,
    );
  }

  const alreadyExists = entry.symptomPresets.some(
    (preset) => toNameKey(preset.name) === toNameKey(name),
  );
  if (alreadyExists) {
    throw new Error("This symptom already exists.");
  }

  const preset: SymptomPreset = {
    id: `symptom-${toSlug(name)}-${Date.now()}`,
    name,
    isDefault: false,
  };

  return {
    ...entry,
    symptomPresets: [...entry.symptomPresets, preset],
    lastEntryAt: nowIso,
  };
}

export function applyLogSymptomDetailed(
  entry: TodayEntry,
  input: LogSymptomDetailedInput,
  nowIso: string,
): TodayEntry {
  const symptomName = normalizeName(input.symptomName);
  if (
    symptomName.length < SYMPTOM_NAME_MIN_LENGTH ||
    symptomName.length > SYMPTOM_NAME_MAX_LENGTH
  ) {
    throw new Error(
      `Symptom name should be ${SYMPTOM_NAME_MIN_LENGTH}-${SYMPTOM_NAME_MAX_LENGTH} characters.`,
    );
  }

  const symptomLog: SymptomLogEntry = {
    id: `symptom-log-${Date.now()}`,
    symptomName,
    intensity: input.intensity,
    note: normalizeName(input.note ?? ""),
    loggedAt: input.loggedAt ?? nowIso,
  };

  return {
    ...entry,
    symptomLogs: [...entry.symptomLogs, symptomLog],
    lastEntryAt: nowIso,
  };
}

export function selectLastSymptom(entry: TodayEntry): SymptomLogEntry | null {
  if (entry.symptomLogs.length === 0) {
    return null;
  }

  return entry.symptomLogs[entry.symptomLogs.length - 1];
}

export const todayService = {
  async getByDate(dateKey: string): Promise<TodayEntry> {
    return getTodayEntryFromDb(dateKey);
  },

  async toggleHabit(dateKey: string, habitId: string): Promise<TodayEntry> {
    const userId = await requireUserId();
    const entryRow = await ensureDailyEntry(userId, dateKey);
    const isSystemHabit = TODAY_HABITS.some((habit) => habit.id === habitId);

    if (isSystemHabit) {
      const { data: existing, error: existingError } = await supabase
        .from("daily_system_habit_status")
        .select("is_completed")
        .eq("entry_id", entryRow.id)
        .eq("user_id", userId)
        .eq("habit_id", habitId)
        .maybeSingle();

      assertSupabaseError(existingError);

      const { error } = await supabase.from("daily_system_habit_status").upsert(
        {
          entry_id: entryRow.id,
          user_id: userId,
          habit_id: habitId,
          is_completed: !existing?.is_completed,
        },
        {
          onConflict: "entry_id,habit_id",
        },
      );

      assertSupabaseError(error);
    } else {
      const { data: existing, error: existingError } = await supabase
        .from("daily_custom_habit_status")
        .select("is_completed")
        .eq("entry_id", entryRow.id)
        .eq("user_id", userId)
        .eq("custom_habit_id", habitId)
        .maybeSingle();

      assertSupabaseError(existingError);

      const { error } = await supabase.from("daily_custom_habit_status").upsert(
        {
          entry_id: entryRow.id,
          user_id: userId,
          custom_habit_id: habitId,
          is_completed: !existing?.is_completed,
        },
        {
          onConflict: "entry_id,custom_habit_id",
        },
      );

      assertSupabaseError(error);
    }

    await touchLastEntryAt(entryRow.id, userId);
    return getTodayEntryFromDb(dateKey);
  },

  async addWater(dateKey: string, amountMl: number): Promise<TodayEntry> {
    const userId = await requireUserId();
    const entryRow = await ensureDailyEntry(userId, dateKey);
    const nextWaterMl = Math.max(0, entryRow.water_ml + amountMl);

    const { error } = await supabase
      .from("daily_entries")
      .update({
        water_ml: nextWaterMl,
        last_entry_at: new Date().toISOString(),
      })
      .eq("id", entryRow.id)
      .eq("user_id", userId);

    assertSupabaseError(error);
    return getTodayEntryFromDb(dateKey);
  },

  async saveQuickNote(dateKey: string, note: string): Promise<TodayEntry> {
    const userId = await requireUserId();
    const entryRow = await ensureDailyEntry(userId, dateKey);

    const { error } = await supabase
      .from("daily_entries")
      .update({
        quick_note: note,
        last_entry_at: new Date().toISOString(),
      })
      .eq("id", entryRow.id)
      .eq("user_id", userId);

    assertSupabaseError(error);
    return getTodayEntryFromDb(dateKey);
  },

  async addCustomHabit(
    dateKey: string,
    input: AddCustomHabitInput,
  ): Promise<TodayEntry> {
    const userId = await requireUserId();
    const entryRow = await ensureDailyEntry(userId, dateKey);
    const label = normalizeName(input.label);
    const alreadyExistsInSystemHabits = TODAY_HABITS.some(
      (habit) => toNameKey(habit.label) === toNameKey(label),
    );

    if (alreadyExistsInSystemHabits) {
      throw new Error("This habit already exists.");
    }

    if (
      label.length < HABIT_NAME_MIN_LENGTH ||
      label.length > HABIT_NAME_MAX_LENGTH
    ) {
      throw new Error(
        `Habit name should be ${HABIT_NAME_MIN_LENGTH}-${HABIT_NAME_MAX_LENGTH} characters.`,
      );
    }

    const { data: insertedHabit, error: insertError } = await supabase
      .from("custom_habits")
      .insert({
        user_id: userId,
        label,
        icon: input.icon ?? "leaf",
      })
      .select("id")
      .single();

    if (insertError) {
      if ((insertError as { code?: string }).code === "23505") {
        throw new Error("This habit already exists.");
      }

      throw new Error(insertError.message);
    }

    const { error: statusError } = await supabase
      .from("daily_custom_habit_status")
      .upsert(
        {
          entry_id: entryRow.id,
          user_id: userId,
          custom_habit_id: insertedHabit.id,
          is_completed: false,
        },
        {
          onConflict: "entry_id,custom_habit_id",
        },
      );

    assertSupabaseError(statusError);
    await touchLastEntryAt(entryRow.id, userId);
    return getTodayEntryFromDb(dateKey);
  },

  async addSymptomPreset(
    dateKey: string,
    input: AddSymptomPresetInput,
  ): Promise<TodayEntry> {
    const userId = await requireUserId();
    const entryRow = await ensureDailyEntry(userId, dateKey);
    const name = normalizeName(input.name);
    const alreadyExistsInDefaults = DEFAULT_SYMPTOM_PRESETS.some(
      (defaultName) => toNameKey(defaultName) === toNameKey(name),
    );

    if (alreadyExistsInDefaults) {
      throw new Error("This symptom already exists.");
    }

    if (
      name.length < SYMPTOM_NAME_MIN_LENGTH ||
      name.length > SYMPTOM_NAME_MAX_LENGTH
    ) {
      throw new Error(
        `Symptom name should be ${SYMPTOM_NAME_MIN_LENGTH}-${SYMPTOM_NAME_MAX_LENGTH} characters.`,
      );
    }

    const { error: insertError } = await supabase.from("symptom_presets").insert({
      user_id: userId,
      name,
    });

    if (insertError) {
      if ((insertError as { code?: string }).code === "23505") {
        throw new Error("This symptom already exists.");
      }

      throw new Error(insertError.message);
    }

    await touchLastEntryAt(entryRow.id, userId);
    return getTodayEntryFromDb(dateKey);
  },

  async logSymptomDetailed(
    dateKey: string,
    input: LogSymptomDetailedInput,
  ): Promise<TodayEntry> {
    const userId = await requireUserId();
    const entryRow = await ensureDailyEntry(userId, dateKey);
    const symptomName = normalizeName(input.symptomName);

    if (
      symptomName.length < SYMPTOM_NAME_MIN_LENGTH ||
      symptomName.length > SYMPTOM_NAME_MAX_LENGTH
    ) {
      throw new Error(
        `Symptom name should be ${SYMPTOM_NAME_MIN_LENGTH}-${SYMPTOM_NAME_MAX_LENGTH} characters.`,
      );
    }

    const { error: insertError } = await supabase.from("symptom_logs").insert({
      entry_id: entryRow.id,
      user_id: userId,
      symptom_name: symptomName,
      intensity: input.intensity,
      note: normalizeName(input.note ?? ""),
      logged_at: input.loggedAt ?? new Date().toISOString(),
    });

    assertSupabaseError(insertError);
    await touchLastEntryAt(entryRow.id, userId);
    return getTodayEntryFromDb(dateKey);
  },
};
