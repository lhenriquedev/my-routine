# History Sprint 2 - Review-First Design

Date: 2026-02-23
Status: Validated

## Goal

Evolve `History` from a simple past-log list into a useful, mobile-first progress view that helps users:

- scan 7/30/90 day performance quickly,
- spot simple patterns without heavy analytics,
- open daily review with one tap.

Primary success focus for Sprint 2: **engage daily review** from `History`.

## Decisions Confirmed

1. Strategy: **Option A - Review-First History**.
2. Day interaction: **tap day opens Review directly**.
3. Main structure: **overview + status list** (not calendar-first).
4. Period filter scope: **7/30/90 in Sprint 2**, custom range as nice-to-have.
5. UI copy language: **English**.
6. Primary action: **fixed bottom CTA** (`Open latest pending review`).

## Screen Architecture

`History` is organized for fast scan first, drill-down second:

1. Header (`History`, active period context, filter affordance)
2. Period filter (`7d`, `30d`, `90d`)
3. Category filter chips (`All`, `Hydration`, `Habits`, `Symptoms`, `Journal`)
4. Quick insights strip (rule-based, 1-2 short lines)
5. KPI cards (summary + comparison with previous period when available)
6. Primary chart (compact, easy-to-read in dark theme)
7. Chronological day status list (core navigation surface)
8. Fixed bottom CTA (`Open latest pending review` / `Review today`)

Rationale: this keeps the screen actionable while still giving meaningful analysis.

## Mobile Layout Direction (Dark + Green)

- Keep existing visual identity (deep green surfaces, mint accent, dark background).
- Use compact cards and high contrast text for one-hand scanning.
- Keep list rows dense but readable, with clear touch affordance.
- No heavy dashboard density; one dominant chart at a time.
- Touch targets: >= 44pt iOS, >= 48dp Android.

## Day Status List Design

Each day row should be instantly understandable:

- Date label (`Mon, Feb 22`)
- Review state badge (`Reviewed`, `Pending review`, `No data`)
- Quick health signals:
  - water goal hit (`yes/no`)
  - habits completion (`2/3`)
  - symptom count (`0`, `1`, `2+`)
  - journal presence (`yes/no`)
- End affordance (`Review >`)

Interaction:

- Entire row is tappable.
- Tap opens `review-day` directly with selected date context.

## Filters and Interaction Rules

### Period

- `7d`, `30d`, `90d` (required)
- `Custom` optional and deferred unless capacity remains

### Category

- `All`, `Hydration`, `Habits`, `Symptoms`, `Journal`

### Update Behavior

- Filter changes update KPI cards, chart, and list in sync.
- Use lightweight transition/loading state to avoid visual jumps.
- Preserve selected filters when returning from review.

## Metrics and Charts (Prioritized)

### Priority 1 (must-have)

- `Avg water/day`
- `Water goal days` (count in period)
- `Habit consistency` (avg completed habits/day)
- `Logging rate` (days with any entry)

### Priority 2 (should-have)

- `Top completed habit`
- `Most frequent symptom`

### Chart Priority

1. Hydration by day (bar chart)
2. Habits completion trend (line or bars)
3. Symptoms frequency by type (horizontal bars)

Default Sprint 2 implementation should include at least chart #1.

## Comparisons and Microcopy

Comparison style:

- `+12% vs previous 7 days`
- `-8% vs previous 30 days`
- `No previous period to compare`

Microcopy tone: simple, non-technical, supportive.

## Rule-Based Insights (No Advanced AI)

Examples:

- `You logged symptoms more often on low hydration days.`
- `Study is strongest on Mon-Wed.`
- `You logged data on 5 of the last 7 days.`

Low-confidence fallback:

- `Not enough data for reliable patterns yet. Keep logging for a few more days.`

Guardrail: never present strong causal language when sample size is small.

## States and Empty Cases

### No data

- Title: `No history yet`
- Body: `Start logging today to unlock your trends.`
- CTA: `Go to Today`

### Low signal

- Title: `Early trend signal`
- Body: `Not enough data for strong patterns yet. Keep logging for a few more days.`
- CTA: `Review today`

### Ready

- Title: `Your last 7 days`
- Body: `You logged data on 5/7 days. Keep momentum.`
- CTA: `Open latest pending review`

## Implementation Scope: Simple vs Polished

### Simple (Sprint 2 core)

- Period + category filters
- 4 primary KPI cards
- 1 primary hydration chart
- Day status list with one-tap review
- Fixed CTA to latest pending review
- `no_data`, `low_signal`, `ready` states

### Polished (if capacity remains)

- richer card comparison visuals
- category-based chart swapping
- subtle filter transition animations
- consistency/streak badge

## Data Flow and Contracts

Use view-model mapping to isolate UI from raw domain entities.

Suggested `HistoryViewModel` shape:

- `period`
- `categoryFilter`
- `kpis[]`
- `chart`
- `days[]`
- `insights[]`
- `primaryCta`

Suggested day item shape:

- `dateKey`
- `reviewStatus`
- `waterGoalHit`
- `habitsCompleted`
- `habitsTotal`
- `symptomCount`
- `hasJournal`
- `reviewRouteParams`

## Navigation Integration with Review

- Day row tap -> `router.push("/review-day", { date })`
- Fixed CTA -> resolves latest pending review date and pushes same route
- If nothing pending in selected range -> fallback to `Review today`
- Returning from review should keep filter and list context when possible

## Testing Plan

### Unit

- KPI and comparison mapper functions
- insights rule engine and weak-signal thresholds
- latest pending review date resolver

### Component

- `History` state rendering (`no_data`, `low_signal`, `ready`)
- filter updates propagate to cards/chart/list
- day row renders all quick signals correctly

### Flow

- open History -> tap day -> review opens with correct date -> back preserves context

### Quality checks

- `npm run lint`
- `npx tsc --noEmit`

## Sprint Backlog and Estimate

### P0

- Layout blocks + filters + day list + fixed CTA + direct review navigation + core states

### P1

- previous-period comparisons + rule-based insights + context preservation on return

### P2

- chart switching by category + microinteractions + custom range placeholder

Estimated effort (single dev): ~5.75 days.

## Mobile Checkpoint

Platform: iOS + Android
Framework: Expo + React Native + TypeScript
MFRI estimate: **+5 (moderate-safe)**

Principles applied:

1. Touch-first, thumb-friendly critical actions.
2. Fast scan before deep analysis.
3. Progressive enhancement (simple core, polished optional).

Anti-patterns avoided:

1. Dashboard overload on small screens.
2. Insight over-claiming with weak data.
3. Multi-step navigation to reach daily review.
