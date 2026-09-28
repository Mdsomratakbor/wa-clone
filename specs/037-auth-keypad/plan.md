# Plan: WhatsApp Authorization — working keypad and Continue (feature 037)

**Input**: `specs/037-auth-keypad/spec.md` + `specs/037-auth-keypad/research.md` (original: **Input**: `AuthPage` (spec 021) + `specs/037-auth-keypad/research.md`)

**Gate**: G1 needs no capture for behaviour; the error colour and message are provisional until capture.

## Approach

1. `_tokens.scss`: add `error` colour.
2. `auth-page.ts`: `phone` signal, `submitted` flag, `error` computed, `onKey`/`onDelete`/
   `onContinue`, `Router` injection.
3. `auth-page.html`: render digits + `aria-live`, add the conditional error paragraph.
4. `auth-page.scss`: `.auth__error` using `var(--wa-error)`.
5. Unit + e2e (paused); 021 drift note; build + unit green; commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: keypad + continue;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

The 021 keypad and `Continue` become functional (drift note in 021). No OTP, country picker or session persistence is invented; the default route stays `/chats`.

## Structure

Single project (repo root):

```text
specs/037-auth-keypad/
- spec.md          # requirements (canonical)
- research.md      # Phase 0 research + assumptions
- plan.md          # this file (Phase 1)
- tasks.md         # Phase 2 task list
- contracts/ui-contracts.md
src/app/core/        # stores (ChatStore, PrefsStore, CallStore)
src/app/features/    # one folder per screen
src/app/shared/components/  # nav bar, list item, action sheet, toggles
tests/e2e/           # playwright specs (authored; runs paused)
```