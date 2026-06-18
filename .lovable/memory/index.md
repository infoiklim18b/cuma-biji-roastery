# Project Memory — Cuma Biji

## Core
Indonesian specialty coffee e-commerce. All UI copy in Bahasa Indonesia, tone: friendly, premium, artisan, warm, educational.
Swiss / editorial design: Fraunces display + Inter sans, generous whitespace, hairline borders, no neon, no dark mode.
Brand colors: sage #A8BBA3, sage-deep #7E9579, cream #F6F1E7, coffee #4A3728, beige #DCC8A3, ink #2B2B2B, bg #FAF8F2. Tokens live in `src/styles.css` — never hardcode hex in components, use `var(--coffee)` etc or shadcn tokens.
Coffee-bean illustrations (BeanMark, BeanSilhouette) are a recurring brand motif — use them, not generic icons, for ambient decoration.
Order numbers: `CBJ-YYYY-NNNNNN` generated server-side via `order_seq` + insert trigger.
Manual bank transfer + manual flat ongkir (no Midtrans / RajaOngkir).

## Build is staged
Stage 0 done: Cloud, full DB schema with RLS, design system, public layout, homepage, auth (email + Google), reset-password, account shell, stub routes for nav. Stage 1: shop + product detail + custom builder. Stage 2: cart + checkout + tracking. Stage 3: admin. Stage 4: subscriptions + loyalty + community. Don't try to do later stages until asked.

## Memories
- [Schema](mem://features/schema) — full entity list and the order-number trigger
