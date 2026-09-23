# WhatsApp UI — Constitution

Project-specific Spec Kit constitution for converting the Figma `WhatsApp UI Screens (Community)` design into an Angular application.

## Core Principles

### I. Specification First
No feature implementation begins without an approved specification. The flow is: **Spec → Plan → Tasks → Implement → Test → Validate**. Unspecified behavior is not implemented. If implementation reveals a requirement conflict, stop and revise the specification — never silently change the contract.

### II. Figma Traceability
Every UI feature must reference its corresponding Figma page/frame/node in `figma/design-map.md`. Feature specs must cite a Figma node ID in their Figma Reference section. Implementation must not invent UI structure that does not appear in the design. Do not fabricate node IDs; only reference IDs obtained from the Figma API.

### III. Component Reusability
Angular UI must use reusable components rather than duplicating UI structures. Repeated Figma patterns (chat rows, call rows, message bubbles, nav bar, tab bar, action sheet, rows lists) map to shared Angular components. Avoid over-fragmentation: a component is justified by actual repetition in the design or clear behavioural ownership.

### IV. Design Fidelity
Implementation follows the Figma design for layout, typography, colors, spacing, components, states and responsive behavior, using the design tokens documented in `figma/design-analysis.md`. Where a design value is unknown, it stays marked **UNKNOWN / NEEDS CLARIFICATION** — it is never silently guessed in code.

### V. Accessibility
UI must use semantic HTML, keyboard navigation, visible focus states, accessible labels, appropriate ARIA usage and sufficient color contrast. Accessibility requirements do not require design changes unless justified and raised with the owner.

### VI. Testability
Each feature has appropriate unit tests and, where practical, Playwright E2E/visual validation against the Figma reference. No feature is "done" without its defined validation targets passing.

### VII. No Unapproved Scope
Do not implement features, backend APIs, authentication systems, databases, real-time messaging, E2E encryption, or business logic unless explicitly included in an approved specification. This project reproduces the provided UI and its explicitly specified behaviour — nothing more.

### VIII. Security
Never commit API keys, access tokens, passwords, Figma tokens, secrets, or credentials. Validate user-controlled input where applicable (e.g., chat/compose text rendered via Angular interpolation, never `bypassSecurityTrustHtml`). Keep dependencies audited.

## Workflow Gating

- **Specify gate**: `/speckit.specify` → spec + quality checklist; unresolved `[NEEDS CLARIFICATION]` markers block planning.
- **Clarify gate**: `/speckit.clarify` resolves at most 3 clarifications; answers recorded in the spec.
- **Plan gate**: `/speckit.plan` → plan.md; must pass Constitution Check (traceability, scope, no invented requirements).
- **Tasks gate**: `/speckit.tasks` → tasks.md grouped per user story; tests written first for any specified test target.
- **Review gate** (after each implemented task via `/speckit.checklist`): report Files Created / Modified, Commands, Tests, Results, Figma References, Spec References, Remaining Work, Definition of Done. Then **stop and await approval** for the next task.

## Governance

- This constitution supersedes contradictory instructions when in tension. Amendments are made only through an explicit constitution-change review, and this file is versioned.
- The Figma API node payload is the design source of truth; the implementation must not drift silently (see `figma/design-map.md` drift rules).
- Git: small, traceable commits mapping Feature → Spec → Task → Implementation → Tests. Do not rewrite history unless explicitly instructed.
- Visual validation via Playwright compares implemented UI against Figma reference renders; "matches Figma" may be claimed only after actual validation.

**Version**: 1.0.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23