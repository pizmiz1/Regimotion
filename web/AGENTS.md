# AI Agent Instructions (AGENTS.md)

## 1. Project Overview & Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** SCSS / Sass (CSS Modules & Global Styles)
- **Rule:** Always inspect `node_modules/next/dist/docs/` for version-exact docs before refactoring core framework features.

---

## 2. Core Development Commands

- **Start local server:** `npm run dev`
- **Production build:** `npm run build`
- **Code linting:** `npm run lint`

---

## 3. SCSS Styling Architecture

- **File Naming:** Use `.module.scss` for component-scoped styles. Use `.scss` strictly for global styles.
- **Global Location:** Store global stylesheets, mixins, and design tokens inside `@/constants/mixins`.
- **Importing Mixings:** Import utility mixins/variables explicitly inside modules: `@use '@/constants/mixins' as *;`.
- **Importing Variables:** Import utility variables explicitly inside modules: `@use '@/constants/variables' as *;`.
- **Component Usage:** Import styles as an object: `import styles from './component.module.scss';`.
- **Class Names:** Apply scoped classes via object properties: `className={styles.container}`.

---

## 4. Next.js Routing & Component Rules

- **Routing:** Use the `app/` directory convention (`page.tsx`, `layout.tsx`, `loading.tsx`).
- **Server Default:** Treat all components as Server Components by default.
- **Client Boundary:** Use `'use client'` strictly when using state hooks, context, or browser APIs.
- **Data Fetching:** Fetch data inline within Server Components via `async/await`. Use Server Actions for mutations.

---

## 5. Coding Standards & Guardrails

- **TypeScript:** Strictly avoid the `any` type. Define explicit interfaces for component props.
- **Path Aliases:** Always use absolute imports via `@/` instead of relative paths (`../../`).
- **Error Resilience:** Wrap route segments in an `error.tsx` boundary rather than letting UI trees crash.
