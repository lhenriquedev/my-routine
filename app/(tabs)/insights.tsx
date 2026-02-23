import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/src/ui/app-text";

export default function InsightsRoute() {
  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <AppText variant="body" style={styles.subtitle}>
          Daily trends and insights are coming soon.
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#031313",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  subtitle: {
    color: "#93a9a1",
    fontSize: 16,
    textAlign: "center",
  },
});
