This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Code Map (Graphify)

`graphify-out/` holds a map of the CRM's code, built locally with [Graphify](https://github.com/safishamsi/graphify) (tree-sitter only, no AI calls, no telemetry):

- `graphify-out/graph.html` — open in a browser to explore how pages, Server Actions, data functions and migrations connect.
- `graphify-out/GRAPH_REPORT.md` — the core functions and the main areas of the code.
- `graphify-out/graph.json` — the full graph, for `graphify query "…"`, `graphify path "A" "B"` or `graphify explain "X"`.

Only code is mapped (`app/`, `components/`, `lib/`, `supabase/`, `types/`, `proxy.ts`); `.graphifyignore` keeps docs, media and data files out. To refresh after code changes:

```bash
uv tool install "graphifyy[sql]"   # once
graphify update .
```

No git hooks or Claude Code hooks are installed for it.

## Video & Motion Skills (moved out)

The video/motion skills (anatomy, anatomy-reveal, hairline-adopt, hairline-create, motion, motion-design, motion-studio-toolkit) and the `video-studio/` workspace were removed from this repo so CRM sessions don't load them. They are kept in git history; to bring them back (e.g. into a separate repo):

```bash
git checkout 8a4ab44 -- .claude/skills/anatomy .claude/skills/anatomy-reveal .claude/skills/hairline-adopt .claude/skills/hairline-create .claude/skills/motion .claude/skills/motion-design .claude/skills/motion-studio-toolkit video-studio
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
