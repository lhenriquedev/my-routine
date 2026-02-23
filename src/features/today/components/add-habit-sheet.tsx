import { RefObject, useMemo, useState } from "react";
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import {
  customHabitSchema,
  CustomHabitFormValues,
} from "@/src/features/today/forms/today-form-schemas";
import { AppText } from "@/src/ui/app-text";
import { TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER } from "@/src/ui/typography";

interface AddHabitSheetProps {
  modalRef: RefObject<BottomSheetModal | null>;
  isSubmitting: boolean;
  onSubmit: (input: { label: string }) => Promise<void>;
}

export function AddHabitSheet({
  modalRef,
  isSubmitting,
  onSubmit,
}: AddHabitSheetProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const snapPoints = useMemo(() => ["48%"], []);
  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
  } = useForm<CustomHabitFormValues>({
    defaultValues: {
      label: "",
    },
    resolver: zodResolver(customHabitSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const canSubmit = isValid && !isSubmitting;

  const resetSheet = () => {
    reset();
    setLocalError(null);
  };

  const handleSave = handleSubmit(async ({ label }) => {
    try {
      await onSubmit({ label });
      modalRef.current?.dismiss();
      resetSheet();
    } catch (error) {
      const typedError =
        error instanceof Error ? error : new Error("Could not create habit.");
      setLocalError(typedError.message);
    }
  });

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={resetSheet}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      <BottomSheetView style={styles.content}>
        <AppText variant="title" style={styles.title}>
          Create Habit
        </AppText>
        <AppText variant="body" style={styles.subtitle}>
          Add a custom habit for today.
        </AppText>

        <View style={styles.formGroup}>
          <AppText variant="label" style={styles.inputLabel}>
            Habit name
          </AppText>
          <Controller
            control={control}
            name="label"
            render={({ field, fieldState }) => {
              const showInvalidState =
                fieldState.invalid && field.value.trim().length > 0;

              return (
                <BottomSheetTextInput
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={(value) => {
                    field.onChange(value);
                    if (localError) {
                      setLocalError(null);
                    }
                  }}
                  style={[styles.input, showInvalidState && styles.inputInvalid]}
                  placeholder="Ex: Meditation"
                  placeholderTextColor="#739688"
                  returnKeyType="done"
                  allowFontScaling
                  maxFontSizeMultiplier={
                    TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER.input
                  }
                />
              );
            }}
          />
        </View>

        {localError ? (
          <AppText variant="caption" style={styles.errorText}>
            {localError}
          </AppText>
        ) : null}

        <Pressable
          testID="habit-sheet-save"
          style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSubmit}
        >
          <AppText variant="button" style={styles.saveButtonText}>
            {isSubmitting ? "Saving..." : "Save Habit"}
          </AppText>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#062118",
    borderWidth: 1,
    borderColor: "#1d4d3a",
  },
  indicator: {
    backgroundColor: "#6d8f82",
    width: 78,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    color: "#edf5f0",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9ab6ac",
    fontSize: 16,
  },
  formGroup: {
    gap: 8,
  },
  inputLabel: {
    color: "#c7dad2",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2c5a47",
    backgroundColor: "#0f2a21",
    color: "#e8f3ee",
    fontSize: 16,
    paddingHorizontal: 14,
  },
  inputInvalid: {
    borderColor: "#f0a5a5",
    backgroundColor: "#2d1818",
  },
  errorText: {
    color: "#ff9f9f",
    fontSize: 14,
  },
  saveButton: {
    marginTop: "auto",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#37e389",
    minHeight: 56,
  },
  saveButtonDisabled: {
    backgroundColor: "#2f7f56",
  },
  saveButtonText: {
    color: "#07351f",
    fontSize: 16,
    fontWeight: "700",
  },
});
