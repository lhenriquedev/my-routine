# Review Day Screen Design

Date: 2026-02-23
Status: Validated

## Goal

Design a `review-day` screen that closes the user day with clear summary cards and a single strong CTA.

- Scope for this phase: **design only** with static content (no AI integration yet).
- Target platforms: **iOS + Android** with shared layout and light platform tuning.
- Language: **English**.
- Primary action behavior: **Finish Day returns to `/(tabs)/today`**.

## Approaches Considered

1. **Card Narrative (Chosen)**
   - Mirrors the provided reference and keeps cognitive load low.
   - Strong top-to-bottom story: summary -> insight -> closure action.
2. **Compact Timeline**
   - Better for chronological analysis, weaker visual closure.
3. **Dense Dashboard**
   - Better for heavy analysis, but busier and less calm for end-of-day flow.

Chosen rationale: Card Narrative provides the best clarity/impact balance for short mobile sessions.

## Screen Architecture

Route composition in `app/review-day.tsx` should remain thin and delegate UI blocks to feature components.

Planned component structure:

- `ReviewHeader` (`Close`, title, `Edit`)
- `MetricHighlightCard` (hydration + circular progress)
- `MetricMiniCard` (symptoms)
- `MetricMiniCard` (habits)
- `InsightCard` (`AI Insight` badge + static insight copy + secondary action)
- `QuoteCard` (decorative image + quote)
- `FinishDayBar` (sticky or bottom-anchored primary CTA)

Suggested location for extraction after first implementation:

- `src/features/review-day/components/*`
- `src/features/review-day/types.ts`

## Interaction and UX Rules

- One clear primary action: `Finish Day`.
- Touch targets: minimum 44pt (iOS) / 48dp (Android).
- Primary CTA positioned in thumb-friendly lower zone.
- No gesture-only critical action; all critical actions remain explicit buttons.
- Press feedback required on all touchables (opacity/scale; ripple feel on Android).

## Visual Direction

- Keep existing app direction (deep green + mint accent) for continuity.
- Add subtle depth with layered surfaces/gradients, without heavy decoration.
- Emphasize hierarchy:
  - Title/primary metric high contrast
  - Supporting copy medium contrast
  - Meta information low contrast but still readable
- Keep card spacing and corner radius consistent to avoid visual noise.

## Data Flow (Designed for Future Integration)

Current mode is static, but contracts should be shaped for drop-in data later.

Future view-model interface (example):

- `hydration: { valueLabel, goalLabel, progressPercent }`
- `symptoms: { countLabel, highlightLabel }`
- `habits: { completionLabel, encouragementLabel }`
- `insight: { title, body, sourceLabel }`

Recommended layering:

1. Presentation components (pure UI)
2. Mapper function (`TodayEntry -> ReviewDayViewModel`)
3. Route container binding navigation and actions

This avoids redesign when AI insights are introduced.

## States and Error Handling

Planned UI states:

1. `static-preview` (current phase)
2. `ready` (future real data)
3. `empty` (insufficient day logs)
4. `error` (failed insight/data generation)

Error handling principles:

- Never blank the full screen on partial failure.
- Degrade only affected blocks (especially `InsightCard`).
- Keep closure action available unless a true blocking condition exists.
- Prevent accidental double-submission on `Finish Day` (temporary disabled state).

## Testing and Validation Plan

For this phase (no test framework yet), validate with manual checks + lint/typecheck.

Manual checks:

1. Visual order matches reference intent.
2. `Close` works.
3. `Finish Day` returns to `/(tabs)/today`.
4. CTA remains visible with safe-area insets on iOS/Android.
5. Touch feedback and tap areas feel reliable.
6. Text contrast remains readable in typical and bright conditions.

Code quality checks:

- `npm run lint`
- `npx tsc --noEmit`

Future testing when data is connected:

- Unit tests for view-model mapping.
- Component tests for `ready/empty/error` rendering.
- One E2E path: open review -> finish day -> return to today.

## Mobile Checkpoint

Platform: iOS + Android  
Framework: Expo Router + React Native (TypeScript)  
MFRI (initial): **+4 (moderate-safe)**

Principles applied:

1. Touch-first interactions and reachable primary action
2. Low cognitive load with one dominant CTA
3. Progressive enhancement path (static -> data -> AI)

Anti-patterns explicitly avoided:

1. Gesture-only critical actions
2. Over-engineering early (no unnecessary framework/tooling in design phase)
