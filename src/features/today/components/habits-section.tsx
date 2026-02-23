import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { SectionCard } from "@/src/features/today/components/section-card";
import { HabitDefinition } from "@/src/features/today/types";
import { AppText } from "@/src/ui/app-text";

interface HabitsSectionProps {
  habits: HabitDefinition[];
  completion: Record<string, boolean>;
  onToggleHabit: (habitId: string) => void;
  onAddHabit: () => void;
}

const iconByHabit = {
  cafe: "cafe",
  book: "book",
  barbell: "barbell",
  leaf: "leaf",
} as const;

export function HabitsSection({
  habits,
  completion,
  onToggleHabit,
  onAddHabit,
}: HabitsSectionProps) {
  return (
    <SectionCard.Root>
      <SectionCard.Header>
        <SectionCard.Title>Habits</SectionCard.Title>
      </SectionCard.Header>
      <SectionCard.Body>
        <View style={styles.grid}>
          {habits.map((habit) => {
            const isCompleted = completion[habit.id] ?? false;
            return (
              <Pressable
                key={habit.id}
                testID={`habit-${habit.id}-toggle`}
                onPress={() => onToggleHabit(habit.id)}
                style={[
                  styles.item,
                  isCompleted ? styles.itemCompleted : styles.itemPending,
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    isCompleted
                      ? styles.iconCircleCompleted
                      : styles.iconCirclePending,
                  ]}
                >
                  <Ionicons
                    name={iconByHabit[habit.icon]}
                    color={isCompleted ? "#083019" : "#8aa69c"}
                    size={20}
                  />
                </View>
                <AppText
                  variant="label"
                  style={[styles.itemLabel, isCompleted && styles.itemLabelCompleted]}
                >
                  {habit.label}
                </AppText>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={20} color="#083019" />
                ) : null}
              </Pressable>
            );
          })}

          <Pressable
            testID="habit-add-button"
            onPress={onAddHabit}
            style={styles.addHabitButton}
          >
            <Ionicons name="add" size={24} color="#37e389" />
            <AppText variant="button" style={styles.addHabitText}>
              Add New
            </AppText>
          </Pressable>
        </View>
      </SectionCard.Body>
    </SectionCard.Root>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  item: {
    width: "31%",
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    gap: 8,
    minHeight: 126,
    justifyContent: "center",
  },
  itemPending: {
    backgroundColor: "#163c2f",
    borderWidth: 1,
    borderColor: "#224b3b",
  },
  itemCompleted: {
    backgroundColor: "#3de58c",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCirclePending: {
    backgroundColor: "#214938",
  },
  iconCircleCompleted: {
    backgroundColor: "#75efad",
  },
  itemLabel: {
    color: "#c8d7d0",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  itemLabelCompleted: {
    color: "#083019",
  },
  addHabitButton: {
    width: "31%",
    minHeight: 126,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#2c6f51",
    backgroundColor: "#102e24",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addHabitText: {
    color: "#37e389",
    fontSize: 15,
    fontWeight: "600",
  },
});
