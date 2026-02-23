# Gemini Daily Insights Design

Date: 2026-02-23
Status: Validated

## Goal

Integrate Gemini to generate actionable daily insights in the routine app with strong security, predictable cost, and a clean mobile UX.

## Decisions Confirmed

1. **Runtime model**: Backend-first
2. **Insight type (MVP)**: Daily summary
3. **Input scope (MVP)**: Completed habits only
4. **Trigger**: On demand (user taps button)
5. **Output format**: 3 short blocks (`ponto_forte`, `atencao`, `proxima_acao`)
6. **Backend path**: Supabase Edge Function -> Gemini

## Approaches Considered

### 1) Supabase Edge Function -> Gemini (**Selected**)

- Best fit with existing stack (Supabase already in project)
- Keeps API key server-side
- Good balance of implementation speed, security, and observability

### 2) Separate Node service

- More deployment flexibility and isolation
- Adds extra infrastructure and operational overhead for MVP

### 3) DB trigger + async queue

- Better for high-scale asynchronous pipelines
- Too complex and unnecessary for initial release

## Architecture

Three-layer flow:

1. **App (Expo/React Native)**
   - User taps "Gerar insight" in Today flow.
   - React Query mutation calls backend endpoint.
   - UI handles idle/loading/success/error states.

2. **Backend (Supabase Edge Function `generate-daily-insight`)**
   - Validates authenticated user.
   - Loads day data (completed habits only).
   - Builds structured prompt.
   - Calls Gemini and validates response.
   - Optionally persists/reuses same-day insight.

3. **Gemini API**
   - Receives controlled prompt and returns strict JSON.

## Components and Contracts

### App components

- `InsightCard`
- `GenerateInsightButton`
- `useDailyInsight(date)` hook (React Query)

### Request

```ts
{
  date: "YYYY-MM-DD";
  forceRegenerate?: boolean;
}
```

### Response

```ts
{
  date: string;
  insight: {
    ponto_forte: string;
    atencao: string;
    proxima_acao: string;
  };
  source: "cache" | "generated";
  generatedAt: string;
}
```

## Prompt Design

- Prefer structured input over free text
- Constrain output to strict JSON with exactly 3 keys
- Portuguese (pt-BR), concise, practical, non-clinical language
- No promises or deterministic claims
- Keep each block short for mobile readability

Suggested block limits:

- `ponto_forte`: 140-220 chars
- `atencao`: 140-220 chars
- `proxima_acao`: 120-200 chars

## Data Handling and Storage

Use a same-day cache strategy (per `user_id + date`) to reduce cost and latency:

- If insight exists for date and `forceRegenerate` is not set, return cached insight
- If user requests refresh, regenerate and overwrite

Suggested table: `daily_insights`

- `id`
- `user_id`
- `date`
- `ponto_forte`
- `atencao`
- `proxima_acao`
- `source_model`
- `created_at`
- `updated_at`

## Errors and Resilience

### Product-level validation

- If no completed habits for the day: return `422` + code `NO_DATA_FOR_DAY`
- App message: "Conclua ao menos 1 hábito para gerar insight."

### Technical failures

- Timeouts, provider errors, quota issues: `5xx`
- App message: "Não foi possível gerar agora. Tente novamente em instantes."
- Retry strategy: max 1 retry with short backoff
- Gemini call timeout: 8-12s

### Safety and logging

- Never expose Gemini API key to client
- Avoid logging raw sensitive user content
- Log request id, latency, status, cache vs generated, token/cost estimate

## Testing Strategy

1. Unit test: `buildPrompt` output shape and deterministic fields
2. Unit test: Zod parsing for valid/invalid model responses
3. Integration test: Edge Function with Gemini mock
4. UI state test: idle/loading/success/error rendering

## Success Criteria (First 2 Weeks)

- Insight generation success rate > 95%
- p95 latency < 4s for cache hit
- p95 latency < 10s for fresh generation
- At least 30% of daily active users triggering insight once/day

## YAGNI Boundaries (MVP)

Not included in this phase:

- Mood/energy inputs
- Free-text notes in prompt
- Weekly pattern intelligence
- Risk prediction and proactive alerts

These can be added after validating daily summary utility and usage.
