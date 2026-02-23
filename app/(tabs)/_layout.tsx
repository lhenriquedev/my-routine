import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BackHeaderButton } from "@/src/ui/navigation/back-header-button";
import { TodayAppHeader } from "@/src/features/today/components/today-app-header";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#031313",
        },
        headerTintColor: "#e8f2ee",
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "700",
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: "#36e38a",
        tabBarInactiveTintColor: "#7f92a0",
        tabBarStyle: {
          backgroundColor: "#0a1818",
          borderTopColor: "#1b2e2e",
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          header: () => <TodayAppHeader />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerLeft: () => <BackHeaderButton />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
