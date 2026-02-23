import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/src/lib/supabase";
import { AppText } from "@/src/ui/app-text";

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
}

function getNameFromEmail(email: string | undefined): string | null {
  if (!email) {
    return null;
  }

  const localPart = email.split("@")[0]?.trim();

  if (!localPart) {
    return null;
  }

  const cleaned = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return null;
  }

  return toTitleCase(cleaned);
}

function resolveDisplayName(user: User | null): string {
  if (!user) {
    return "Friend";
  }

  const metadata = user.user_metadata as
    | {
        full_name?: string;
        name?: string;
        display_name?: string;
        first_name?: string;
      }
    | undefined;

  const metadataName =
    metadata?.full_name ??
    metadata?.display_name ??
    metadata?.name ??
    metadata?.first_name;

  const normalizedMetadataName = metadataName?.trim();

  if (normalizedMetadataName) {
    return normalizedMetadataName;
  }

  const fallbackName = getNameFromEmail(user.email);

  return fallbackName ?? "Friend";
}

function getDateLabel() {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return formattedDate.toUpperCase();
}

function getGreetingPrefix() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 18) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

export function TodayAppHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Friend");

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setDisplayName(resolveDisplayName(data.user ?? null));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setDisplayName(resolveDisplayName(session?.user ?? null));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}>
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />
      <View style={styles.glowHighlight} />
      <View style={styles.contentRow}>
        <View style={styles.copyContainer}>
          <AppText variant="meta" style={styles.date}>
            {getDateLabel()}
          </AppText>
          <AppText
            variant="title"
            style={styles.greetingPrefix}
            maxFontSizeMultiplier={1.1}
          >
            {getGreetingPrefix()},
          </AppText>
          <AppText
            variant="title"
            style={styles.greetingName}
            maxFontSizeMultiplier={1.1}
          >
            {displayName}
          </AppText>
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarGlowInner} />
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            hitSlop={8}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed ? styles.avatarButtonPressed : null,
            ]}
          >
            <Ionicons name="person" color="#f2d5bc" size={22} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#041a15",
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#17352e",
    overflow: "hidden",
  },
  glowOuter: {
    position: "absolute",
    right: -64,
    top: -72,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "#0d6641",
    opacity: 0.2,
  },
  glowInner: {
    position: "absolute",
    right: -28,
    top: -36,
    width: 188,
    height: 188,
    borderRadius: 999,
    backgroundColor: "#0f7f4f",
    opacity: 0.22,
  },
  glowHighlight: {
    position: "absolute",
    right: 14,
    top: 24,
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: "#2acb75",
    opacity: 0.08,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  copyContainer: {
    flex: 1,
    paddingRight: 14,
  },
  date: {
    color: "#8da89f",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  greetingPrefix: {
    marginTop: 6,
    color: "#d4dfda",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "600",
  },
  greetingName: {
    color: "#2df07e",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
  },
  avatarContainer: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGlowInner: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#44d58b",
    opacity: 0.18,
  },
  avatarButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#c79e7d",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#d7b296",
  },
  avatarButtonPressed: {
    opacity: 0.8,
  },
});
