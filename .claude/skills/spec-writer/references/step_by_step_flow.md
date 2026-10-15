# Step-by-step Flow in design.md

## Why

A one-line story ("visitor signs in") hides steps — the server re-validates, sets three cookies,
redirects; the hook later refreshes the token and may clear the session. Unnamed steps get
implemented wrong. The Step-by-step Flow writes each backend call and side effect out with its
trigger, precondition and every branch.

## When it is mandatory

When the flow makes **2 or more sequential backend calls or side effects** (a call plus a cookie
write and redirect counts), including steps owned by another feature or by `hooks.server.ts`.

## Shape

```
Step N — <name> (this feature | <other feature>, out of scope)
- Trigger: <what the visitor does, or which request/hook runs it>
- Pre-condition: <what must already be true>
- Where: <+page.server.ts action `default` | load | hooks.server.ts | api/<name>/+server.ts>
- API: <METHOD /v1/...> (key fields only — cite openapi.yaml, never paste the schema)
    - Success → <effect: cookies, redirect, data returned to the page>
    - Failure (<case>) → <what the visitor sees — must match the Error → UI table>
```

Steps owned by another feature say so and link that feature's design instead of duplicating it.

## Worked example (adapted in English from `Docs/specs/features/login/design.md`)

```
Step 1 — Sign in (this feature)
- Trigger: visitor presses `login_submit` with a valid phone and a non-empty password
- Pre-condition: the server re-checks that phone/password are non-empty
- Where: `src/routes/(auth)/login/+page.server.ts` action `default`
- API: POST /v1/auth/login (phone_number, password, device{platform:"web", device_model})
    - Success → startSession (3 cookies), 303 to `/`
    - Failure (INVALID_CREDENTIALS 401) → fail, stay on /login, one generic message
    - Failure (LOGIN_LOCKED 429) → fail, locked message

Step 2 — Refresh the session (hooks.server.ts, every request)
- Trigger: a request reaches the server with no `il_token` but an `il_refresh` cookie
- Where: `src/hooks.server.ts` `handleAuth`
- API: POST /v1/auth/refresh ({refresh_token})
    - Success → setTokens, continue the request
    - Failure (4xx) → endSession, visitor becomes a guest
    - Failure (network / 5xx) → keep the cookies, retry on the next request
```

## Unconfirmed steps

```
- API: POST /v1/...
  ⚠️ Not confirmed: <question> — <what it blocks>.
```

When answered, state the step as fact and record in the changelog whether the step structure
changed or only the marker went away.
