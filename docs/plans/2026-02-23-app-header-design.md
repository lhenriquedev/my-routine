# App Header Design

Date: 2026-02-23
Status: Validated

## Goal

Implement an app header experience with two behaviors:

- `Today` gets a custom hero-style header with date, greeting, fixed name (`Alex`), and a tappable avatar.
- `Insights` and `Profile` use a standard header with back arrow + screen title.

The back action must attempt normal back navigation and fall back to `/(tabs)/today` if no history exists.

## Recommended Approach

Use a hybrid tab-header configuration in `app/(tabs)/_layout.tsx`:

- `today`: `header: () => <TodayAppHeader />`
- `insights` and `profile`: standard header with `headerLeft` wired to a reusable back button component.

This keeps navigation behavior aligned with Expo Router while allowing fully custom visuals on `Today`.

## Architecture

### Navigation

- Configure all tab headers in one place (`app/(tabs)/_layout.tsx`) to avoid duplicated per-screen options.
- Keep tab bar styling unchanged.

### Components

- `TodayAppHeader`
  - Renders date label and time-based greeting (`Good Morning/Afternoon/Evening`).
  - Highlights `Alex` in accent color.
  - Avatar button navigates to `/(tabs)/profile`.
- `BackHeaderButton`
  - Reusable left button for standard headers.
  - Behavior:
    1. If `router.canGoBack()`, call `router.back()`.
    2. Else, `router.replace("/(tabs)/today")`.

## Data Flow

- `TodayAppHeader` computes date and greeting locally from `Date`.
- User name is fixed constant (`Alex`) for this iteration.
- Navigation actions are event-driven from header button presses.

## UI/UX Notes

- Remove duplicated date/greeting from `DayHeaderCard` so `TodayAppHeader` is the single source for this information.
- Preserve dark green visual direction already used in the app.
- Ensure touch targets are accessible (44x44+) and labels are set.

## Error Handling and Edge Cases

- Back button never becomes a dead action because of safe fallback to `Today`.
- If header rendering changes in future (e.g., profile image loading), default icon path should remain available.

## Validation Strategy

Manual checks:

1. `Today` shows custom header and avatar navigation works.
2. `Insights` and `Profile` show title + back arrow.
3. Back arrow returns to previous screen when possible, otherwise goes to `Today`.
4. Content does not overlap with status bar on iOS/Android/Web.

Code quality checks:

- `npm run lint`
- `npx tsc --noEmit`
