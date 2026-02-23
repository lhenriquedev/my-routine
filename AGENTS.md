# AGENTS.md

Guidance for coding agents working in this repository.

## Project Snapshot

- Stack: Expo + React Native + Expo Router + TypeScript.
- Package manager: npm (`package-lock.json` is present).
- Router entrypoint: `expo-router/entry` from `package.json`.
- TypeScript is strict (`tsconfig.json` sets `"strict": true`).
- Path alias: `@/*` maps to project root.
- Linting: ESLint via `eslint-config-expo` flat config.
- Current app code is minimal and lives in `app/`.

## Source of Truth Files

- App config: `app.json`.
- TypeScript config: `tsconfig.json`.
- Lint config: `eslint.config.js`.
- NPM scripts: `package.json`.
- Editor save actions: `.vscode/settings.json`.

## Install and Run

- Install dependencies: `npm install`
- Start Expo dev server: `npm run start`
- Start Android: `npm run android`
- Start iOS: `npm run ios`
- Start web: `npm run web`
- Reset scaffold app: `npm run reset-project`

## Build, Lint, Test Commands

### Lint

- Run lint: `npm run lint`
- Lint uses Expo's ESLint preset (`expo lint`).
- Ignore pattern currently configured: `dist/*`.

### Type Check

- No dedicated npm script exists yet.
- Run TypeScript check manually: `npx tsc --noEmit`

### Build / Export

- There is no explicit `build` npm script today.
- For web static export, use Expo CLI directly: `npx expo export --platform web`
- For local runtime verification, prefer `npm run web` or native targets.

### Tests

- There is currently no test framework configured in `package.json`.
- There is no `npm test` script at the moment.
- If adding tests, prefer Jest + React Native Testing Library for Expo apps.

Suggested test scripts to add when introducing tests:

- `"test": "jest"`
- `"test:watch": "jest --watch"`
- `"test:ci": "jest --runInBand --coverage"`

Single-test execution patterns (after Jest is installed):

- Run one test file: `npx jest app/index.test.tsx`
- Run by test name: `npx jest -t "renders home screen"`
- Run one file + one test name: `npx jest app/index.test.tsx -t "renders home screen"`

## Agent Workflow Expectations

- Prefer minimal, focused diffs.
- Keep changes aligned with Expo Router conventions.
- Do not introduce a new framework without clear need.
- Update docs/scripts when adding tooling (test/build/typecheck).
- Validate with lint and typecheck before finishing substantial work.

## Code Style Guidelines

### Language and Typing

- Use TypeScript for all new app logic and components.
- Keep `strict` mode clean; avoid `any` unless unavoidable.
- Prefer explicit interfaces/types for component props.
- Use union types and literal types for finite state values.
- Use `unknown` instead of `any` for untrusted data.
- Narrow types before use (type guards, `in`, `typeof`).
- Export reusable types from the module where they are owned.

### Imports and Module Structure

- Keep imports at top of file.
- Group imports: external packages first, then internal aliases/relative imports.
- Use the `@/` alias for cross-folder imports when it improves clarity.
- Use relative imports for nearby sibling files.
- Avoid deep relative chains when aliasing is clearer.
- Remove unused imports; keep import list lean.
- Prefer named exports for shared utilities; default exports are fine for route components.

### Formatting and Layout

- Follow existing formatting in repo files.
- Use double quotes to match existing code style.
- Keep semicolons (current files use semicolons).
- Prefer small components and short functions.
- Break long JSX props across lines for readability.
- Keep one responsibility per module where practical.
- Do not add decorative comments; comment only non-obvious intent.

### Naming Conventions

- Components: PascalCase (`RootLayout`, `RoutineCard`).
- Hooks: `useXxx` naming and keep hook rules intact.
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE for module-level constants.
- Route files: follow Expo Router conventions (`index.tsx`, `_layout.tsx`, segment folders).
- Type names: PascalCase; avoid `I` prefix unless already established.

### React / React Native Practices

- Prefer functional components.
- Keep render paths simple and deterministic.
- Derive UI from props/state; avoid mutable module state.
- Memoize only when profiling indicates value.
- Use `StyleSheet.create` for reusable styles in non-trivial components.
- For tiny one-off examples, inline style objects are acceptable.
- Avoid blocking work in render; move expensive work outside render path.
- Keep platform-specific behavior explicit when needed.

### State and Data Flow

- Keep state close to where it is used.
- Lift state only when multiple children need shared ownership.
- Prefer props/context over event buses.
- Keep side effects in `useEffect` with accurate dependency arrays.
- Clean up subscriptions, timers, and listeners on unmount.

### Error Handling

- Fail fast on programmer errors; handle runtime errors gracefully.
- Wrap async logic in `try/catch` where failures are expected.
- Provide actionable error messages (what failed + context).
- Do not silently swallow errors.
- Surface user-facing failures with clear UI states when applicable.
- Keep thrown error types consistent (usually `Error`).

### Lint and Quality Bar

- Code must pass `npm run lint`.
- Code should pass `npx tsc --noEmit` (manual command until scripted).
- Keep new dependencies minimal and justified.
- Prefer built-in Expo/React Native capabilities before adding packages.

## Cursor and Copilot Rules

- Checked `.cursor/rules/`: not present.
- Checked `.cursorrules`: not present.
- Checked `.github/copilot-instructions.md`: not present.
- Therefore, no Cursor/Copilot-specific repository rules are currently defined.

## When You Add Tooling

- If you add a test framework, add scripts in `package.json` and update this file.
- If you add build/release automation, document exact commands here.
- If you add repo policies (Cursor/Copilot rules), mirror their key points here.
- Keep this file current so future agents can execute without guesswork.
