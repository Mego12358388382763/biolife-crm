---
name: ui-design
description: Design or redesign screens and components for BioLife CRM (Next.js App Router + Tailwind + shadcn/ui), including layout, spacing, typography, colour, states, responsiveness, dark mode, RTL and accessibility. Use when the user asks to design, beautify, "make it look better", improve UX, or build a new page or component UI in this codebase.
---

# UI Design — BioLife CRM

This is an internal operating system used all day by sales and growth teams. Optimise for
**speed, scannability and zero ambiguity** over decoration.

## 1. Before designing
- Read the existing components in `components/ui/` (shadcn primitives), `components/shell/` and the neighbouring feature folder. Reuse them; don't create a parallel style.
- Check `app/globals.css` for the theme tokens (CSS variables). Use the tokens (`bg-background`, `text-muted-foreground`, `border`, `primary`…) and never hard-code hex values in components.
- Keep business logic out of UI: data comes from `lib/data/*`, validation from `lib/validations/*` (see CLAUDE.md).

## 2. Layout & hierarchy
- One primary action per screen (the `default` button variant); secondary actions use `outline` or `ghost`.
- Page structure: header (title + short description + primary action) → filters/toolbar → content → pagination.
- Spacing scale: stick to Tailwind steps (`gap-2/4/6`, `p-4/6`); consistent within a page.
- Tables for lists of records (leads, companies, tasks): sticky header, right-aligned numbers, truncated long text with a tooltip, row click opens the detail view.
- Keep forms to a single column unless the fields are short and naturally paired; labels above inputs; inline zod error messages under the field.

## 3. Every component needs all its states
Loading (skeleton, not a spinner, for lists), empty (explain + primary action), error (what happened + retry), disabled, and success feedback (toast). Destructive actions need a confirmation dialog (Admin-only deletes; see CLAUDE.md).

## 4. Typography & colour
- At most 3 text sizes per view; weight and colour carry hierarchy before size does.
- Status colours carry meaning consistently across the app (e.g. pipeline stage badges). Stage colours come from the database, never hard-coded (pipeline stages are DB-driven).
- Contrast: WCAG AA minimum (4.5:1 for body text). Check both light and dark themes.

## 5. Responsiveness, RTL, accessibility
- Must work at 375px wide: tables collapse into cards or scroll horizontally inside their container, never the whole page.
- Use logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`) so Arabic RTL works without rewrites.
- Semantic elements, labelled inputs, visible focus rings, keyboard reachable dialogs and menus (shadcn/Radix handles most of this; don't break it).

## 6. Deliverable
- Short rationale (what problem the layout solves).
- The component or page code, following existing patterns.
- A check of states, mobile width, dark mode and RTL, then run `npm run lint` and `npx tsc --noEmit` before calling it done. Use the `run` skill to screenshot the result when possible.
