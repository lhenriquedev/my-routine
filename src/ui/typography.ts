export type AppTextVariant =
  | "display"
  | "title"
  | "sectionTitle"
  | "headline"
  | "body"
  | "button"
  | "label"
  | "caption"
  | "meta"
  | "input";

export const TEXT_VARIANT_MAX_FONT_SIZE_MULTIPLIER: Record<AppTextVariant, number> = {
  display: 1.15,
  title: 1.2,
  sectionTitle: 1.25,
  headline: 1.25,
  body: 1.35,
  button: 1.2,
  label: 1.2,
  caption: 1.25,
  meta: 1.25,
  input: 1.3,
};
