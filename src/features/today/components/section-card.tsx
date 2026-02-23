import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { AppText } from "@/src/ui/app-text";

interface SectionCardRootProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

function Root({ children, style }: SectionCardRootProps) {
  return <View style={[styles.root, style]}>{children}</View>;
}

function Header({ children }: PropsWithChildren) {
  return <View style={styles.header}>{children}</View>;
}

function Title({ children }: PropsWithChildren) {
  return (
    <AppText variant="sectionTitle" style={styles.title}>
      {children}
    </AppText>
  );
}

function Body({ children }: PropsWithChildren) {
  return <View style={styles.body}>{children}</View>;
}

function Footer({ children }: PropsWithChildren) {
  return <View style={styles.footer}>{children}</View>;
}

export const SectionCard = {
  Root,
  Header,
  Title,
  Body,
  Footer,
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#103227",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1d4637",
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#ebf4ef",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  body: {
    gap: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
