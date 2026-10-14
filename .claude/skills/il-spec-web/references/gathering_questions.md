# Gathering questions

## Read the product spec before asking

Read innerlamp-be `docs/product/<feature>/product.md` first (see `upstream_product_spec.md`). Do not
ask again what it already answers (user story, business rules, scope, edge cases) — cite the ID. A
product decision it is missing is not settled here: record `⚠️ Not confirmed (product)` and hand it
back to `ba-writer`. What is left is website-specific.

## Phrasing

Vietnamese, "anh"/"em", technical terms in English. One topic per question, concrete, with a
suggested default the user can just confirm. One line when possible.

## Questions for a new spec

1. **Feature slug** — normally the product spec's slug (`memorial`). Confirm, don't invent.
2. **Mode** — already running on the site (Retroactive) or not built yet (Prospective)?
3. **Route(s)** and group — `(site)` public, `(auth)`, or `(app)` (signed-in area)? URL path?
4. **Auth** — public, or needs the session cookie? What happens to a guest (redirect to `/login`
   — default — or a read-only view)?
5. **Data path** — server `load`/form action (default) or an interactive browser call through
   `src/routes/api/<name>/+server.ts` (live search, load more)?
6. **Operations** — which backend operations, and is each in innerlamp-be `openapi.yaml`? Missing
   ones become `⚠️ Not confirmed` and a backend hand-off.
7. **Session effects** — does it read/write cookies or change `locals.user`?
8. **Multi-call flow** — 2+ sequential backend calls or side effects? If yes, Step-by-step Flow.
9. **SEO / prerender** — indexable public page, or private/no-index?
10. **i18n prefix** for new keys (e.g. `mem_`).

## Updating an existing spec

1. What changed — a product spec version bump (which IDs?), a contract change, or a website-only
   change?
2. If it answers a `⚠️`: the answer, plainly.
3. Does it change an existing criterion, or add one?

## Never skip

Unanswered → inline `⚠️ Not confirmed` (or `(product)`) where it bites, never a silent default,
never asked twice in one session.
