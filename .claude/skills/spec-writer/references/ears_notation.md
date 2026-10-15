# EARS notation for requirements.md

Every acceptance criterion names a trigger and a mandatory system response:

```
WHEN <trigger>, THE SYSTEM SHALL <behavior>. (<product ID>)
```

Forms used here (see `Docs/specs/features/login/requirements.md`):

- `WHEN <event>, THE SYSTEM SHALL <behavior>.`
- `WHEN <event>, THE SYSTEM SHALL <behavior>, then:` with `- on success: …` / `- on failure: …`
  branches, for submit-and-wait flows.
- `WHEN <state holds>, THE SYSTEM SHALL …` for conditions ("WHEN there is no `il_token` cookie but
  there is an `il_refresh` cookie").

Criteria are written in English (see the Language policy in `AGENTS.md`). The existing login
example is still Vietnamese until that file is next edited.

## Examples

Bad: "The login form handles errors."

Good:

> WHEN the visitor presses `login_submit` with valid input, THE SYSTEM SHALL call
> `POST /v1/auth/login` from the server, then:
>
> - on success: set the session cookies and redirect to `localizeHref('/')`;
> - on failure: stay on `/login`, show the string from the Error → UI table and keep the phone
>   number. (FR-AUTH-002)

## Rules

1. **One criterion = one trigger**; outcomes are branches of it.
2. **Always "THE SYSTEM SHALL"** — a testable obligation, not a description.
3. **Tag every criterion** with the product ID it implements — `(FR-MEM-002)`, `(BR-MEM-04)` — or
   `(platform)` for website-only behavior (cookies, redirects, SEO, i18n). See
   `upstream_product_spec.md`.
4. **Don't restate the rule** — "THE SYSTEM SHALL compute the next memorial date per BR-MEM-03",
   not the rule's content.
5. **Name hidden steps** (server re-validation, cookie write, redirect) here; the _how_ goes in
   `design.md`'s Step-by-step Flow.
6. **Strings are keys** — refer to copy by Paraglide key, or quote the `messages/vi.json` text
   verbatim with its key and an English gloss; never imply hardcoded text.
7. Out of scope / Pending / Open questions are plain English prose, not EARS.
