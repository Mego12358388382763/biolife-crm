---
name: nextjs16-conventions
description: Check and fix code for Next.js 16 conventions in BioLife CRM — proxy.ts instead of middleware.ts, async params/searchParams/cookies/headers, Server Actions, caching and revalidation APIs. Use before writing any Next.js routing, page, layout, action, or caching code, when a build shows Next.js type errors or deprecation warnings, or when code from tutorials/older projects is pasted in.
---

# Next.js 16 conventions

Training data mostly describes Next 13–15. This project runs Next 16 (`next` in package.json), so older patterns compile-fail or silently misbehave. The source of truth is the installed docs: `node_modules/next/dist/docs/` — grep there before relying on memory.

## Known differences to check

- Route protection: `proxy.ts` at the root exporting `function proxy(request)`; `middleware.ts` must not be created.
- `params` and `searchParams` in pages/layouts/route handlers are Promises: `export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; }`
- `cookies()`, `headers()`, `draftMode()` are async — always `await`.
- Server Actions: `"use server"` files may export only async functions; shared constants go in plain modules (see `lib/constants.ts` comment).
- Server-only modules start with `import "server-only"`.
- Revalidation / caching APIs: confirm names and signatures in the local docs before using (`revalidatePath`, `revalidateTag`, any `"use cache"` directive) — they changed between versions.

## Procedure

1. Grep the target files for: `middleware`, `params.` without await, `searchParams.` without await, `cookies().`, `headers().`, `getServerSideProps`, `next/router`, `useRouter` from the wrong package.
2. Look up anything uncertain in `node_modules/next/dist/docs/` (use `grep -ril <topic>`).
3. Fix, then `npx tsc --noEmit` and `npm run build` — the build surfaces most convention errors.
4. Report what was changed and cite the doc file you relied on.
