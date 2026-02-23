import { RefObject, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  NewSymptomPresetFormValues,
  newSymptomPresetSchema,
} from "@/src/features/today/forms/today-form-schemas";
import { SymptomLogEntry, SymptomPreset } from "@/src/features/today/types";
import { AppText } from "@/src/ui/app-text";
import { TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER } from "@/src/ui/typography";

interface LogSymptomSheetProps {
  modalRef: RefObject<BottomSheetModal | null>;
  symptomPresets: SymptomPreset[];
  isSavingSymptom: boolean;
  isAddingPreset: boolean;
  onSaveSymptom: (input: Omit<SymptomLogEntry, "id">) => Promise<void>;
  onAddPreset: (name: string) => Promise<void>;
}

const INTENSITY_LEVELS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

export function LogSymptomSheet({
  modalRef,
  symptomPresets,
  isSavingSymptom,
  isAddingPreset,
  onSaveSymptom,
  onAddPreset,
}: LogSymptomSheetProps) {
  const [selectedSymptomName, setSelectedSymptomName] = useState<string>("");
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [note, setNote] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const snapPoints = useMemo(() => ["92%"], []);
  const {
    control,
    formState: { isValid: isNewPresetValid },
    handleSubmit,
    reset,
  } = useForm<NewSymptomPresetFormValues>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(newSymptomPresetSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const nowLabel = useMemo(
    () =>
      new Date().toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    [],
  );

  const canSave = selectedSymptomName.trim().length > 1 && !isSavingSymptom;
  const canAddPreset = isNewPresetValid && !isAddingPreset;

  const resetSheet = () => {
    setSelectedSymptomName(symptomPresets[0]?.name ?? "");
    setIntensity(3);
    setNote("");
    setIsAddingNew(false);
    reset();
    setLocalError(null);
  };

  const handleAddPreset = handleSubmit(async ({ name }) => {
    try {
      await onAddPreset(name);
      setSelectedSymptomName(name);
      reset();
      setIsAddingNew(false);
      setLocalError(null);
    } catch (error) {
      const typedError =
        error instanceof Error ? error : new Error("Could not add symptom.");
      setLocalError(typedError.message);
    }
  });

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    try {
      await onSaveSymptom({
        symptomName: selectedSymptomName.trim(),
        intensity,
        note,
        loggedAt: new Date().toISOString(),
      });
      modalRef.current?.dismiss();
      resetSheet();
    } catch (error) {
      const typedError =
        error instanceof Error ? error : new Error("Could not save symptom.");
      setLocalError(typedError.message);
    }
  };

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={resetSheet}
      onChange={(nextIndex) => {
        if (nextIndex >= 0 && !selectedSymptomName) {
          setSelectedSymptomName(symptomPresets[0]?.name ?? "");
        }
      }}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.headerRow}>
          <AppText variant="title" style={styles.title}>
            Log Symptom
          </AppText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>
            What are you feeling?
          </AppText>

          <View style={styles.chipsWrap}>
            {symptomPresets.map((preset) => {
              const isSelected = selectedSymptomName === preset.name;
              return (
                <Pressable
                  key={preset.id}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipDefault,
                  ]}
                  onPress={() => setSelectedSymptomName(preset.name)}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={18} color="#053319" />
                  ) : null}
                  <AppText
                    variant="label"
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {preset.name}
                  </AppText>
                </Pressable>
              );
            })}

            <Pressable
              testID="symptom-sheet-add-new-toggle"
              style={styles.addNewChip}
              onPress={() => setIsAddingNew((prev) => !prev)}
            >
              <Ionicons name="add" size={20} color="#37e389" />
              <AppText variant="button" style={styles.addNewChipText}>
                Add New
              </AppText>
            </Pressable>
          </View>

          {isAddingNew ? (
            <View style={styles.newPresetRow}>
              <Controller
                control={control}
                name="name"
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
                      style={[
                        styles.newPresetInput,
                        showInvalidState && styles.newPresetInputInvalid,
                      ]}
                      placeholder="New symptom name"
                      placeholderTextColor="#739688"
                      allowFontScaling
                      maxFontSizeMultiplier={
                        TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER.input
                      }
                    />
                  );
                }}
              />
              <Pressable
                testID="symptom-sheet-add-new-save"
                style={[
                  styles.newPresetButton,
                  !canAddPreset && styles.newPresetButtonDisabled,
                ]}
                onPress={handleAddPreset}
                disabled={!canAddPreset}
              >
                <AppText variant="button" style={styles.newPresetButtonText}>
                  {isAddingPreset ? "..." : "Add"}
                </AppText>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.intensityHeader}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              Intensity
            </AppText>
            <AppText variant="headline" style={styles.intensityLabel}>
              {getIntensityLabel(intensity)}
            </AppText>
          </View>

          <View style={styles.intensityRow}>
            {INTENSITY_LEVELS.map((level) => {
              const isActive = intensity === level;
              return (
                <Pressable
                  key={level}
                  style={[
                    styles.intensityButton,
                    isActive
                      ? styles.intensityButtonActive
                      : styles.intensityButtonInactive,
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <AppText
                    variant="display"
                    style={[
                      styles.intensityButtonText,
                      isActive
                        ? styles.intensityButtonTextActive
                        : styles.intensityButtonTextInactive,
                    ]}
                  >
                    {level}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.timeCard}>
            <Ionicons name="time-outline" size={22} color="#9db8ad" />
            <View>
              <AppText variant="caption" style={styles.timeLabel}>
                Time
              </AppText>
              <AppText variant="body" style={styles.timeValue}>
                Today, {nowLabel}
              </AppText>
            </View>
          </View>

          <BottomSheetTextInput
            value={note}
            onChangeText={setNote}
            style={styles.noteInput}
            placeholder="Add a short note about triggers or context..."
            placeholderTextColor="#7d9f92"
            multiline
            allowFontScaling
            maxFontSizeMultiplier={TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER.input}
          />

          {localError ? (
            <AppText variant="caption" style={styles.errorText}>
              {localError}
            </AppText>
          ) : null}
        </ScrollView>

        <Pressable
          testID="symptom-sheet-save"
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <AppText variant="button" style={styles.saveButtonText}>
            {isSavingSymptom ? "Saving..." : "Save Symptom"}
          </AppText>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function getIntensityLabel(intensity: 1 | 2 | 3 | 4 | 5): string {
  if (intensity <= 2) {
    return "Mild";
  }
  if (intensity === 3) {
    return "Moderate";
  }
  return "Severe";
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#031f16",
    borderWidth: 1,
    borderColor: "#174633",
  },
  indicator: {
    backgroundColor: "#5f8476",
    width: 84,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  headerRow: {
    paddingTop: 2,
  },
  title: {
    color: "#e7f1ec",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 14,
  },
  sectionTitle: {
    color: "#d5e3dc",
    fontSize: 18,
    fontWeight: "600",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipDefault: {
    backgroundColor: "#163327",
    borderWidth: 1,
    borderColor: "#2d4f41",
  },
  chipSelected: {
    backgroundColor: "#37e389",
  },
  chipText: {
    color: "#b8cbc3",
    fontSize: 15,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#052e17",
  },
  addNewChip: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#2d7a59",
    backgroundColor: "#102f23",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addNewChipText: {
    color: "#37e389",
    fontSize: 15,
    fontWeight: "600",
  },
  newPresetRow: {
    flexDirection: "row",
    gap: 10,
  },
  newPresetInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2c5a47",
    backgroundColor: "#0f2a21",
    color: "#e8f3ee",
    fontSize: 16,
    paddingHorizontal: 12,
  },
  newPresetInputInvalid: {
    borderColor: "#f0a5a5",
    backgroundColor: "#2d1818",
  },
  newPresetButton: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c9f63",
    minWidth: 72,
  },
  newPresetButtonDisabled: {
    backgroundColor: "#2d5f47",
  },
  newPresetButtonText: {
    color: "#082c1b",
    fontWeight: "700",
    fontSize: 16,
  },
  intensityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  intensityLabel: {
    color: "#38e189",
    fontSize: 16,
    fontWeight: "600",
  },
  intensityRow: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#2f4f44",
    borderRadius: 18,
    padding: 6,
    backgroundColor: "#0f2a21",
  },
  intensityButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  intensityButtonInactive: {
    backgroundColor: "transparent",
  },
  intensityButtonActive: {
    backgroundColor: "#37e389",
  },
  intensityButtonText: {
    fontSize: 22,
    fontWeight: "700",
  },
  intensityButtonTextInactive: {
    color: "#708d84",
  },
  intensityButtonTextActive: {
    color: "#042c16",
  },
  timeCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2f5447",
    backgroundColor: "#112e24",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeLabel: {
    color: "#84a397",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  timeValue: {
    color: "#e2eee8",
    fontSize: 17,
    fontWeight: "600",
  },
  noteInput: {
    minHeight: 104,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2f5447",
    backgroundColor: "#112e24",
    color: "#e8f3ee",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ff9f9f",
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 16,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#37e389",
  },
  saveButtonDisabled: {
    backgroundColor: "#2f7f56",
  },
  saveButtonText: {
    color: "#052e17",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
  },
});
