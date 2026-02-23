import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { SectionCard } from "@/src/features/today/components/section-card";
import { AppText } from "@/src/ui/app-text";

interface HydrationSectionProps {
  waterMl: number;
  waterGoalMl: number;
  waterProgressPercent: number;
  isMutating: boolean;
  onAddWater: (amountMl: number) => void;
}

export function HydrationSection({
  waterMl,
  waterGoalMl,
  waterProgressPercent,
  isMutating,
  onAddWater,
}: HydrationSectionProps) {
  const progressAnim = useRef(new Animated.Value(waterProgressPercent)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: waterProgressPercent,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, waterProgressPercent]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <SectionCard.Root>
      <SectionCard.Header>
        <View style={styles.titleRow}>
          <Ionicons name="water" size={22} color="#6cb0ff" />
          <SectionCard.Title>Hydration</SectionCard.Title>
        </View>
      </SectionCard.Header>
      <SectionCard.Body>
        <View style={styles.metricsRow}>
          <View style={styles.metricCircle}>
            <AppText variant="headline" style={styles.metricValue}>
              {waterProgressPercent}%
            </AppText>
          </View>
          <View>
            <AppText variant="display" style={styles.current}>
              {waterMl} ml
            </AppText>
            <AppText variant="body" style={styles.goal}>
              Goal: {waterGoalMl} ml
            </AppText>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            testID="water-add-250"
            onPress={() => onAddWater(250)}
            style={styles.addButton}
            disabled={isMutating}
          >
            <AppText variant="button" style={styles.addButtonText}>
              +250 ml
            </AppText>
          </Pressable>
          <Pressable
            testID="water-add-500"
            onPress={() => onAddWater(500)}
            style={styles.addButton}
            disabled={isMutating}
          >
            <AppText variant="button" style={styles.addButtonText}>
              +500 ml
            </AppText>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </SectionCard.Body>
    </SectionCard.Root>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  metricCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: "#254241",
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    color: "#71b4ff",
    fontSize: 20,
    fontWeight: "700",
  },
  current: {
    color: "#ecf4ef",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
  },
  goal: {
    color: "#94aca3",
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  addButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2d5f8a",
    backgroundColor: "#184363",
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#7fc1ff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#1c3b39",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#6cb0ff",
  },
});
