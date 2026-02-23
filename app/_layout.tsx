import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, router, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppText } from "@/src/ui/app-text";
import { supabase } from "@/src/lib/supabase";
import { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient();

export default function RootLayout() {
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session ?? null);
      setIsLoadingSession(false);
    });

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoadingSession) {
      return;
    }

    const rootSegment = segments[0] as string | undefined;
    const inAuthGroup = rootSegment === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/auth");
      return;
    }

    if (session && inAuthGroup) {
      router.replace("/today");
    }
  }, [isLoadingSession, segments, session]);

  if (isLoadingSession) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#37e389" />
          <AppText variant="body" style={styles.loadingText}>
            Loading session...
          </AppText>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="history/[date]" options={{ headerShown: false }} />
            <Stack.Screen
              name="review-day"
              options={{ headerShown: false, presentation: "modal" }}
            />
          </Stack>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#031313",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#98b2a8",
    fontSize: 16,
  },
});
