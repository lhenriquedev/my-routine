import { z } from "zod";
import {
  HABIT_NAME_MAX_LENGTH,
  HABIT_NAME_MIN_LENGTH,
  SYMPTOM_NAME_MAX_LENGTH,
  SYMPTOM_NAME_MIN_LENGTH,
} from "@/src/features/today/constants";

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

const normalizedNameSchema = z
  .string()
  .trim()
  .min(
    HABIT_NAME_MIN_LENGTH,
    `Habit name should be ${HABIT_NAME_MIN_LENGTH}-${HABIT_NAME_MAX_LENGTH} characters.`,
  )
  .max(
    HABIT_NAME_MAX_LENGTH,
    `Habit name should be ${HABIT_NAME_MIN_LENGTH}-${HABIT_NAME_MAX_LENGTH} characters.`,
  )
  .transform((value) => normalizeText(value));

const normalizedSymptomNameSchema = z
  .string()
  .trim()
  .min(
    SYMPTOM_NAME_MIN_LENGTH,
    `Symptom name should be ${SYMPTOM_NAME_MIN_LENGTH}-${SYMPTOM_NAME_MAX_LENGTH} characters.`,
  )
  .max(
    SYMPTOM_NAME_MAX_LENGTH,
    `Symptom name should be ${SYMPTOM_NAME_MIN_LENGTH}-${SYMPTOM_NAME_MAX_LENGTH} characters.`,
  )
  .transform((value) => normalizeText(value));

export const customHabitSchema = z.object({
  label: normalizedNameSchema,
});

export const newSymptomPresetSchema = z.object({
  name: normalizedSymptomNameSchema,
});

export const logSymptomSchema = z.object({
  symptomName: normalizedSymptomNameSchema,
  intensity: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  note: z
    .string()
    .optional()
    .transform((value) => normalizeText(value ?? "")),
});

export type CustomHabitFormValues = z.input<typeof customHabitSchema>;
export type NewSymptomPresetFormValues = z.input<typeof newSymptomPresetSchema>;
