import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/src/ui/app-text";
import { supabase } from "@/src/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthMode = "sign_in" | "sign_up";

interface FieldErrors {
  email?: string;
  password?: string;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validateInputs(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.includes("@")) {
    errors.email = "Enter a valid email.";
  }

  if (password.trim().length < 6) {
    errors.password = "Password must have at least 6 characters.";
  }

  return errors;
}

export default function AuthRoute() {
  const [mode, setMode] = useState<AuthMode>("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === "sign_in" ? "Welcome back" : "Create your account"),
    [mode],
  );

  const subtitle = useMemo(
    () =>
      mode === "sign_in"
        ? "Sign in to continue your routine."
        : "Create an account to save and sync your daily data.",
    [mode],
  );

  const submitLabel = mode === "sign_in" ? "Sign in" : "Create account";

  const switchMode = () => {
    setMode((current) => (current === "sign_in" ? "sign_up" : "sign_in"));
    setErrors({});
    setFormMessage(null);
  };

  const handleSubmit = async () => {
    const normalizedEmail = normalizeEmail(email);
    const nextErrors = validateInputs(normalizedEmail, password);
    setErrors(nextErrors);
    setFormMessage(null);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "sign_in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (error) {
          throw error;
        }

        setFormMessage("Account created. You are now signed in.");
      }
    } catch (error) {
      const typedError =
        error instanceof Error ? error : new Error("Authentication failed.");
      setFormMessage(typedError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.copyBlock}>
          <AppText variant="title" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            {subtitle}
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldBlock}>
            <AppText variant="label" style={styles.label}>
              Email
            </AppText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@example.com"
              placeholderTextColor="#6f8780"
            />
            {errors.email ? (
              <AppText variant="meta" style={styles.errorText}>
                {errors.email}
              </AppText>
            ) : null}
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="label" style={styles.label}>
              Password
            </AppText>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Your password"
              placeholderTextColor="#6f8780"
            />
            {errors.password ? (
              <AppText variant="meta" style={styles.errorText}>
                {errors.password}
              </AppText>
            ) : null}
          </View>

          {formMessage ? (
            <View style={styles.messageBox}>
              <AppText variant="body" style={styles.messageText}>
                {formMessage}
              </AppText>
            </View>
          ) : null}

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.submitButton,
              (isSubmitting || pressed) && styles.submitButtonPressed,
            ]}
          >
            <AppText variant="button" style={styles.submitButtonText}>
              {isSubmitting ? "Please wait..." : submitLabel}
            </AppText>
          </Pressable>

          <Pressable
            onPress={switchMode}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.secondaryActionPressed,
            ]}
          >
            <AppText variant="body" style={styles.secondaryActionText}>
              {mode === "sign_in"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </AppText>
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
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 18,
  },
  copyBlock: {
    gap: 8,
  },
  title: {
    color: "#e8f3ef",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
  },
  subtitle: {
    color: "#95aea6",
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1c3530",
    backgroundColor: "#0b1f1c",
    padding: 16,
    gap: 14,
  },
  fieldBlock: {
    gap: 6,
  },
  label: {
    color: "#cce0d9",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#23443c",
    backgroundColor: "#082320",
    paddingHorizontal: 12,
    color: "#e9f4f0",
    fontSize: 16,
  },
  errorText: {
    color: "#f8b8b8",
    fontSize: 13,
  },
  messageBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2b5b4d",
    backgroundColor: "#11352b",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageText: {
    color: "#cde9dd",
    fontSize: 14,
  },
  submitButton: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#38e189",
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: "#06381d",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryAction: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionPressed: {
    opacity: 0.75,
  },
  secondaryActionText: {
    color: "#79d3a9",
    fontSize: 14,
    fontWeight: "600",
  },
});
