import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { TimelineEventVM } from "@/src/features/today/types";
import { SectionCard } from "@/src/features/today/components/section-card";
import { AppText } from "@/src/ui/app-text";

interface TodayTimelineSectionProps {
  events: TimelineEventVM[];
  onPressPrimaryAction: () => void;
  onPressSeeMore?: () => void;
}

export function TodayTimelineSection({
  events,
  onPressPrimaryAction,
  onPressSeeMore,
}: TodayTimelineSectionProps) {
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    listAnim.setValue(0);
    Animated.timing(listAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [events, listAnim]);

  const rowTranslateY = listAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  return (
    <SectionCard.Root>
      <SectionCard.Header>
        <SectionCard.Title>Timeline</SectionCard.Title>
        {events.length > 0 && onPressSeeMore ? (
          <Pressable onPress={onPressSeeMore}>
            <AppText variant="button" style={styles.seeMore}>
              See more
            </AppText>
          </Pressable>
        ) : null}
      </SectionCard.Header>

      {events.length === 0 ? (
        <SectionCard.Body>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="time-outline" size={24} color="#7a988d" />
          </View>
          <AppText variant="body" style={styles.emptyTitle}>
            Your day has not started here yet.
          </AppText>
          <AppText variant="body" style={styles.emptyDescription}>
            Log water or your first habit to begin.
          </AppText>
          <Pressable onPress={onPressPrimaryAction} style={styles.emptyCta}>
            <AppText variant="button" style={styles.emptyCtaText}>
              Log now
            </AppText>
          </Pressable>
        </SectionCard.Body>
      ) : (
        <SectionCard.Body>
          {events.map((event) => (
            <Animated.View
              key={event.id}
              style={[
                styles.eventRow,
                {
                  opacity: listAnim,
                  transform: [{ translateY: rowTranslateY }],
                },
              ]}
            >
              <AppText variant="meta" style={styles.eventTime}>
                {event.time}
              </AppText>

              <View style={styles.eventIconWrap}>
                <Ionicons
                  name={event.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color="#83e2af"
                />
              </View>

              <AppText variant="body" style={styles.eventLabel}>
                {event.label}
              </AppText>
            </Animated.View>
          ))}
        </SectionCard.Body>
      )}
    </SectionCard.Root>
  );
}

const styles = StyleSheet.create({
  seeMore: {
    color: "#6de6a4",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#173a2f",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    textAlign: "center",
    color: "#c0d4cb",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyDescription: {
    textAlign: "center",
    color: "#90ada2",
    fontSize: 14,
  },
  emptyCta: {
    marginTop: 2,
    alignSelf: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2d7c58",
    backgroundColor: "#14452f",
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCtaText: {
    color: "#6de6a4",
    fontSize: 15,
    fontWeight: "600",
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  eventTime: {
    width: 54,
    color: "#95b2a6",
    fontSize: 13,
  },
  eventIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#153b2e",
    borderWidth: 1,
    borderColor: "#2a5a47",
    alignItems: "center",
    justifyContent: "center",
  },
  eventLabel: {
    flex: 1,
    color: "#d5e3dc",
    fontSize: 15,
  },
});
