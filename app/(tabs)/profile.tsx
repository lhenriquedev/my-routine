import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/src/lib/supabase";
import { AppText } from "@/src/ui/app-text";

export default function ProfileRoute() {
  const [email, setEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
      setIsSigningOut(false);
      return;
    }

    setIsSigningOut(false);
  };

  const handleDeleteAccount = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (deleteConfirmation.trim() !== "DELETE") {
      setErrorMessage('Type "DELETE" to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You must be logged in.");
      }

      const [{ error: entriesError }, { error: habitsError }, { error: presetsError }] =
        await Promise.all([
          supabase.from("daily_entries").delete().eq("user_id", user.id),
          supabase.from("custom_habits").delete().eq("user_id", user.id),
          supabase.from("symptom_presets").delete().eq("user_id", user.id),
        ]);

      if (entriesError) {
        throw entriesError;
      }

      if (habitsError) {
        throw habitsError;
      }

      if (presetsError) {
        throw presetsError;
      }

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setSuccessMessage("Your routine data was deleted and you were signed out.");
    } catch (error) {
      const typedError =
        error instanceof Error
          ? error
          : new Error("Failed to delete account data.");
      setErrorMessage(typedError.message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.infoCard}>
          <AppText variant="label" style={styles.cardLabel}>
            Signed in as
          </AppText>
          <AppText variant="body" style={styles.emailText}>
            {email ?? "Loading..."}
          </AppText>
        </View>

        <AppText variant="body" style={styles.subtitle}>
          Manage your account details and data lifecycle.
        </AppText>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <AppText variant="body" style={styles.errorText}>
              {errorMessage}
            </AppText>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBanner}>
            <AppText variant="body" style={styles.successText}>
              {successMessage}
            </AppText>
          </View>
        ) : null}

        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut || isDeletingAccount}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={({ pressed }) => [
            styles.signOutButton,
            (pressed || isSigningOut) && styles.signOutButtonPressed,
          ]}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color="#042f18" />
          ) : (
            <AppText variant="button" style={styles.signOutText}>
              Sign out
            </AppText>
          )}
        </Pressable>

        <View style={styles.dangerCard}>
          <AppText variant="label" style={styles.dangerTitle}>
            Delete account data
          </AppText>
          <AppText variant="caption" style={styles.dangerHint}>
            This deletes all your daily logs, custom habits, and symptom presets.
          </AppText>
          <AppText variant="caption" style={styles.dangerHint}>
            Type DELETE to confirm.
          </AppText>
          <TextInput
            style={styles.confirmInput}
            value={deleteConfirmation}
            onChangeText={setDeleteConfirmation}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="DELETE"
            placeholderTextColor="#9c8888"
          />
          <Pressable
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount || isSigningOut}
            accessibilityRole="button"
            accessibilityLabel="Delete account data"
            style={({ pressed }) => [
              styles.deleteButton,
              (pressed || isDeletingAccount) && styles.deleteButtonPressed,
            ]}
          >
            {isDeletingAccount ? (
              <ActivityIndicator size="small" color="#ffd7d7" />
            ) : (
              <AppText variant="button" style={styles.deleteButtonText}>
                Delete data and sign out
              </AppText>
            )}
          </Pressable>
        </View>
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
    gap: 12,
    width: "100%",
  },
  infoCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1b3a32",
    backgroundColor: "#102520",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  cardLabel: {
    color: "#92aca3",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  emailText: {
    color: "#e6f2ec",
    fontSize: 16,
  },
  subtitle: {
    color: "#93a9a1",
    fontSize: 15,
    textAlign: "center",
  },
  errorBanner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#874343",
    backgroundColor: "#3a1d1d",
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: "100%",
  },
  successBanner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2d5c4d",
    backgroundColor: "#153529",
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: "100%",
  },
  errorText: {
    color: "#f6b9b9",
    fontSize: 14,
    textAlign: "center",
  },
  successText: {
    color: "#d5ebdf",
    fontSize: 14,
    textAlign: "center",
  },
  signOutButton: {
    marginTop: 4,
    minHeight: 48,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#37e389",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  signOutButtonPressed: {
    opacity: 0.82,
  },
  signOutText: {
    color: "#042f18",
    fontSize: 16,
    fontWeight: "700",
  },
  dangerCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5d2e2e",
    backgroundColor: "#2b1616",
    padding: 12,
    gap: 8,
  },
  dangerTitle: {
    color: "#ffd9d9",
    fontSize: 14,
    fontWeight: "700",
  },
  dangerHint: {
    color: "#d9b8b8",
    fontSize: 13,
    lineHeight: 18,
  },
  confirmInput: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#874343",
    backgroundColor: "#3a1d1d",
    color: "#ffe3e3",
    paddingHorizontal: 12,
    fontSize: 15,
  },
  deleteButton: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ad4f4f",
    backgroundColor: "#6b2f2f",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
  deleteButtonText: {
    color: "#ffe3e3",
    fontSize: 14,
    fontWeight: "700",
  },
});
