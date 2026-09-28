---
name: ui-rtl-arabic
description: Build or fix BioLife CRM UI with shadcn/ui and Tailwind so it's consistent, responsive, accessible, and handles Arabic text and RTL correctly (names, notes, mixed Arabic/English, Egyptian phone numbers). Use for any new screen, form, table, dialog, or when the user reports layout, mobile, dark mode, or Arabic display problems.
---

# UI: consistent, responsive, Arabic-safe

## Consistency

- Use primitives from `components/ui/*` (shadcn). Check `components.json` and existing components before adding a new one; add new shadcn components with the CLI rather than hand-copying.
- Follow the patterns in `components/leads/*` for tables, forms and dialogs; toasts via `sonner`; icons via `lucide-react`.
- Colors via the theme tokens in `app/globals.css`, never raw hex — dark mode (`next-themes`) depends on it.

## Arabic & mixed text

- User-entered text (names, notes, company names) may be Arabic. Add `dir="auto"` on inputs, textareas and table cells that show user text, so each string lays out in its own direction.
- Prefer logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `start-0`) over `ml/mr/pl/pr/left/right` so a future RTL layout works.
- Phone numbers, emails and URLs: wrap in `dir="ltr"` so `+20 10…` doesn't flip.
- Make sure the font stack renders Arabic well (check `app/layout.tsx`; add an Arabic-capable font via `next/font` if Arabic looks like a fallback font).
- Sorting/searching: use `localeCompare(b, ["ar", "en"])` where it matters.

## Responsive & accessible

- Test at 375px width: tables scroll horizontally inside a container, not the page; forms stack to one column.
- Every input has a `<Label>`; icon-only buttons have `aria-label`; destructive actions use a confirmation dialog.

Verify visually with the `run` skill (screenshot at mobile and desktop width, light and dark) before calling it done.
