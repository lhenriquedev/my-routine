import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/src/ui/app-text";

interface ActionFeedbackToastProps {
  message: string;
}

export function ActionFeedbackToast({ message }: ActionFeedbackToastProps) {
  return (
    <View pointerEvents="none" style={styles.container}>
      <Ionicons name="checkmark-circle" size={18} color="#70e8ad" />
      <AppText variant="button" style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2c684e",
    backgroundColor: "#103527",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  message: {
    color: "#d6efe3",
    fontSize: 14,
    fontWeight: "600",
  },
});
