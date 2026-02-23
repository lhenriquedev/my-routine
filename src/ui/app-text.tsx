import { PropsWithChildren } from "react";
import { Text, TextProps } from "react-native";
import {
  AppTextVariant,
  TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER,
} from "@/src/ui/typography";

export interface AppTextProps extends PropsWithChildren, TextProps {
  variant?: AppTextVariant;
}

export function AppText({
  variant = "body",
  allowFontScaling = true,
  maxFontSizeMultiplier,
  ...props
}: AppTextProps) {
  const resolvedMaxFontSizeMultiplier =
    maxFontSizeMultiplier ?? TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER[variant];

  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={resolvedMaxFontSizeMultiplier}
      {...props}
    />
  );
}
