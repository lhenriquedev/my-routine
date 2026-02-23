import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { ReviewCtaVariant } from "@/src/features/today/types";
import { AppText } from "@/src/ui/app-text";

interface ReviewDayCtaProps {
  variant: ReviewCtaVariant;
  onPress: () => void;
}

export function ReviewDayCta({ variant, onPress }: ReviewDayCtaProps) {
  return (
    <Pressable
      testID="review-day-button"
      style={[
        styles.button,
        variant === "emphasized" ? styles.emphasized : styles.default,
      ]}
      onPress={onPress}
    >
      <AppText variant="button" style={styles.buttonText}>
        Review Day
      </AppText>
      <Ionicons name="arrow-forward" size={22} color="#062f18" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 4,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  default: {
    backgroundColor: "#5fcb92",
  },
  emphasized: {
    backgroundColor: "#37e389",
  },
  buttonText: {
    color: "#062f18",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
  },
});
