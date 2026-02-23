# History Screen Design

Date: 2026-02-23
Status: Validated

## Goal

Design a `History` experience that stores and displays past days, with a compact day list and a full day-detail screen.

- Replace `Insights` tab with `History`.
- Keep list cards compact and scannable.
- Open day details in a dedicated stack route (`history/[date]`).
- Scope for V1: design and architecture aligned with current data model (no new status table yet).

## Decisions Confirmed

1. Navigation: **Replace `Insights` tab** with `History`.
2. Day card information: **compact summary** (date, status, hydration, top symptom, up to two habits + overflow count).
3. Detail scope: **full detail** (hydration, habits, symptoms, evening journal).
4. Day status strategy: **computed status in V1** (no new persistence table).
5. Detail opening behavior: **push in stack** (not modal/sheet).

## Approaches Considered

1. **Timeline monthly sections + compact cards (Chosen)**
   - Best match to reference visuals and scanning behavior.
   - Keeps implementation incremental and low risk.
2. Calendar-first + list
   - Better date jumping, but more complexity for V1.
3. Continuous date list
   - Simpler technical model, weaker month context and visual hierarchy.

Chosen rationale: Option 1 gives the best UX/effort balance for a first release.

## Architecture and Routing

### Route Layout

- Replace tab route `app/(tabs)/insights.tsx` with `app/(tabs)/history.tsx`.
- Add stack detail route: `app/history/[date].tsx`.
- Keep route modules thin and delegate UI to feature components.

### Feature Modules

Suggested structure:

- `src/features/history/components/history-screen.tsx`
- `src/features/history/components/weekly-insight-card.tsx`
- `src/features/history/components/month-section.tsx`
- `src/features/history/components/day-summary-card.tsx`
- `src/features/history/components/history-day-details-screen.tsx`
- `src/features/history/types.ts`
- `src/features/history/mappers/history-mappers.ts`
- `src/features/history/selectors/history-selectors.ts`

## Component Design

### History List Screen

- Header with `History` title and optional calendar/filter affordance.
- `WeeklyInsightCard` at top (static/rule-based in V1).
- Month-grouped timeline sections.
- `DaySummaryCard` rows with:
  - Date label + relative day text when relevant.
  - Status badge (`In Progress`, `Reviewed`, `Logged`).
  - Compact metrics row (hydration + symptom highlight + habits summary).
  - Right-chevron affordance.

### Day Details Screen (`history/[date]`)

Ordered blocks:

1. Day summary stats (hydration and habits)
2. Daily insight card
3. Hydration log card
4. Symptoms list
5. Habits completed list
6. Evening journal card

Order is intentional: result-first, context-after for quick mobile sessions.

## Data Contracts and Mapping

Use a dedicated view-model layer so list/detail UIs consume stable contracts.

Example summary contract:

- `dateKey`
- `dateLabel`
- `relativeLabel`
- `status`
- `waterMl`
- `waterGoalMl`
- `symptomsCount`
- `topSymptoms[]`
- `completedHabitsCount`
- `totalHabitsCount`
- `quickNotePreview`
- `lastEntryAt`

Status is computed in V1:

- `In Progress`: current day or day with partial active progress.
- `Reviewed`: day meets completion threshold.
- `Logged`: has records but below review threshold.

## Interaction and UX Rules

- Card touch targets >= 44pt (iOS) / 48dp (Android).
- Immediate pressed feedback for all touchables.
- No gesture-only critical actions.
- Keep critical information visible without entering detail.
- Preserve visual continuity with current green palette and card system.

## States and Error Handling

### List Screen

- `loading`: skeleton/placeholder cards.
- `ready`: grouped month sections.
- `empty`: explicit empty message and guidance.
- `error`: retry action with clear failure text.

### Detail Screen

- Full error state only when day fetch fails completely.
- Partial failures degrade by block (never blank whole screen).
- Empty fallbacks:
  - no symptoms -> `No symptoms logged`
  - no journal -> reflection placeholder text

## Performance and Scalability

- Use `FlatList`/section virtualization for history list growth.
- Keep item components stable and mapping outside render path.
- Avoid inline heavy calculations in list item render.
- Preserve battery and scroll smoothness for long histories.

## Testing and Validation Plan

### Unit Tests

- Mapper tests (`entry -> summary/detail view model`).
- Status calculation tests with boundary scenarios.

### Component Tests

- `HistoryScreen`: loading/error/success/empty.
- `DaySummaryCard`: badge and compact metadata rendering.
- `HistoryDayDetailsScreen`: section presence and fallback text.

### Flow Validation

- Open `History` tab -> tap day -> open `history/[date]` -> back returns to list context.

### Quality Checks

- `npm run lint`
- `npx tsc --noEmit`

## Incremental Implementation Plan

1. Routing swap: `Insights` -> `History`, add detail route.
2. Build list screen with month sections and compact cards.
3. Build full day details screen with section fallbacks.
4. Add mapper/status tests and run lint/typecheck.

## Mobile Checkpoint

Platform: iOS + Android
Framework: Expo Router + React Native + TypeScript
MFRI estimate: **+4 (moderate-safe)**

Principles applied:

1. Touch-first, thumb-friendly interactions.
2. Fast scan in list, deep detail on demand.
3. Progressive architecture (computed now, persistable later).

Anti-patterns avoided:

1. Non-virtualized long lists.
2. Gesture-only critical actions.
