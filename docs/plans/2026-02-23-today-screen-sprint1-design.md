# Today Screen Sprint 1 Design

Date: 2026-02-23
Status: Validated

## Goal

Improve the Today screen polish and UX without changing the core visual identity (dark/green theme). Make it feel more "alive" with better action flow, visual feedback, and product-like quality.

## Decisions Confirmed

1. **Approach**: Guided Today with dynamic CTA
2. **Timeline density**: Compact (3-5 events + "See more")
3. **CTA logic**: Rule-based simple (no AI)
4. **Implementation**: Simple version first, then polish

## Screen Architecture

New block order (reduces cognitive load, clear action hierarchy):

```
1. Header (existing, improved spacing)
2. Next Best Action Card (NEW - protagonist block)
3. Quick Summary Row (NEW - 3 instant-read chips)
4. Today Timeline (NEW - compact, last 3-5 events)
5. Habits Section (existing, improved empty state)
6. Symptoms Section (existing, improved empty state)
7. Notes Section (existing, improved empty state)
8. Review Day CTA (existing, contextual emphasis)
```

## New Components

### Next Best Action Card

Single recommendation based on day state:

**Logic (rule-based, priority order):**
1. No records -> Start action (water or first habit)
2. Partial progress -> Lowest friction next step
3. Day nearly complete -> Push to review

**Card structure:**
- Title (short)
- Contextual subtitle
- Single primary button

**Microcopy examples:**

| State | Title | Subtitle | Button |
|-------|-------|----------|--------|
| Start | "Good start" | "Log your first action of the day." | "+250 ml now" |
| Middle | "Next step" | "Almost there with your habits." | "Complete Study" |
| End | "Almost there" | "Your day looks consistent." | "Go to Review" |

### Quick Summary Row

3 instant-read indicators (no buttons, read-only):

```
[ 💧 750/2000 ml ]  [ ✅ 2/5 habits ]  [ 🩺 1 symptom ]
```

- Water: current/goal ml
- Habits: completed/total
- Symptoms: count or "None"

### Today Timeline

Compact event list (3-5 items, reverse chronological):

**Event format:**
```
08:20 • 💧 +250 ml water
12:10 • ✅ Study completed
18:38 • 🩺 Headache intensity 3
```

**Empty state:**
- Icon: circular background
- Text: "Your day hasn't started here yet."
- CTA: "Log now"

**See more:** Links to History screen for full day view

## Empty States Pattern

Consistent across all sections (Symptoms, Habits, Notes, Timeline):

```
┌─────────────────────────────────────┐
│         [Icon in circle]            │
│                                     │
│         Title text                  │
│    Contextual description           │
│                                     │
│      [Optional CTA button]          │
└─────────────────────────────────────┘
```

**Examples:**

| Section | Title | Description | CTA |
|---------|-------|-------------|-----|
| Symptoms | "No symptoms today 🎉" | "Log if anything changes." | "Log Symptom" |
| Habits | "No habits completed yet" | "Start with the easiest one." | None |
| Notes | "No notes yet" | "Add a quick observation." | None |
| Timeline | "Your day hasn't started" | "Log water or your first habit." | "Log now" |

## Feedback and Microinteractions

### After Each Action

| Action | Text Feedback | Visual Feedback |
|--------|---------------|-----------------|
| Water logged | "+250 ml registered" | Progress animates X% → Y% |
| Habit completed | "Habit completed" | Card micro-pop + check icon |
| Symptom saved | "Symptom saved" | Timeline item fades in |
| Note saved | "Saved" (button state) | Button text change 1.5s |

### Animation Rules

- Duration: 120-260ms
- Properties: opacity, transform (scale, translate) only
- One animation per action
- Never block action for animation
- Optional: light haptic on success

### Snackbar Pattern

- Position: Above tab bar
- Duration: 1.6-2.2s
- Style: High contrast on dark theme
- Avoid thumb zone conflict

## Data Flow

### New View Model Properties

Add to `TodayViewModel`:

```typescript
interface NextBestActionVM {
  title: string;
  subtitle: string;
  buttonLabel: string;
  action: 'add_water' | 'complete_habit' | 'log_symptom' | 'add_note' | 'go_review';
  habitId?: string;
}

interface QuickSummaryVM {
  water: { current: number; goal: number };
  habits: { completed: number; total: number };
  symptoms: { count: number };
}

interface TimelineEventVM {
  id: string;
  time: string;
  icon: string;
  label: string;
  type: 'water' | 'habit' | 'symptom' | 'note';
}
```

### Selector Updates

Add to `today-selectors.ts`:

- `selectNextBestAction(entry, now): NextBestActionVM`
- `selectQuickSummary(entry): QuickSummaryVM`
- `selectTimelineEvents(entry): TimelineEventVM[]`

## Implementation Plan

### Phase 1: Core Structure (Simple)

1. Reorganize `TodayScreen` block order
2. Add spacing improvements
3. Create `NextBestActionCard` component
4. Create `QuickSummaryRow` component
5. Create `TodayTimelineSection` component
6. Update empty states for all sections
7. Add snackbar for action feedback

### Phase 2: Polish (If Time Permits)

1. Animate timeline item entry
2. Add count-up animation to hydration
3. Add haptic feedback on success
4. Micro-animations on habit completion
5. Phase-specific microcopy refinement

## Component Locations

```
src/features/today/components/
├── today-screen.tsx (update order)
├── next-best-action-card.tsx (NEW)
├── quick-summary-row.tsx (NEW)
├── today-timeline-section.tsx (NEW)
├── day-header-card.tsx (existing)
├── habits-section.tsx (update empty state)
├── symptoms-section.tsx (update empty state)
├── hydration-section.tsx (add animation)
├── quick-note-section.tsx (update empty state)
└── review-day-cta.tsx (existing)
```

## States and Error Handling

### Day States

1. **Empty** - No entries yet
2. **In Progress** - Partial entries
3. **Nearly Complete** - Ready for review

### Error Handling

- Keep existing error banner pattern
- Partial errors don't block other sections
- Clear recovery path for failed mutations
- Never show blank screen on error

## Visual Guidelines

### Colors (Existing)

- Background: `#031313`
- Card background: `#103227`
- Primary accent: `#37e389`
- Secondary text: `#94aca3`
- Water accent: `#71b4ff`
- Symptom accent: `#f28b8b`

### Spacing

- Screen horizontal padding: 16px
- Section gap: 12px
- Card internal padding: 18px
- Button minimum height: 48px

### Typography

- CTA title: 20-22px, bold
- CTA subtitle: 15-16px, regular
- Timeline time: 13-14px, medium
- Timeline label: 15-16px, regular

## Testing Checklist

### Manual

- [ ] Start of day (empty) state
- [ ] Middle of day (partial) state
- [ ] End of day (nearly complete) state
- [ ] Feedback after each action
- [ ] Timeline updates correctly
- [ ] Empty states display properly
- [ ] Contrast readable in various lighting
- [ ] Touch targets >= 44pt (iOS) / 48dp (Android)

### Code Quality

- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] No console.logs in production code

## Mobile Checkpoint

Platform: iOS + Android
Framework: Expo + React Native + TypeScript
MFRI: **+6 (safe)**

Principles applied:
1. Clear action hierarchy (one CTA at a time)
2. Instant feedback on all interactions
3. Progressive disclosure (timeline compact, see more for detail)

Anti-patterns avoided:
1. Multiple competing CTAs
2. Heavy animations on main thread
3. Complex state for simple feature
