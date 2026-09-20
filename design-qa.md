# Design QA

## Source of truth

- Reference: `/var/folders/84/ptwkq345061_ltxv58g67h3c0000gq/T/codex-clipboard-0d31b2d7-11e1-43c1-aa53-36f812d4c3b9.png` (600 × 676, inferred 1× density)
- Reference: `/var/folders/84/ptwkq345061_ltxv58g67h3c0000gq/T/codex-clipboard-eb5ddc77-fa0f-4911-85c2-7ee4f086ca51.png` (600 × 665, inferred 1× density)
- Implementation preview: `http://localhost:3000/zh/ai-media-creator/`, captured from the in-app browser with the Open API settings dialog open.

## Viewports and states

- 600 × 760: dialog open, security notice collapsed and expanded.
- 350 × 900: dialog open, compact stacked onboarding steps, security notice collapsed and expanded.
- Checked both the full dialog and the focused onboarding/client-key area.

## Comparison

- Content: matches the three-step account/key onboarding, registration CTA, Base URL, Client Key, remember-me control, and security notice from the references.
- Structure: steps are horizontal at the reference width and stack in a narrow browser side panel.
- Styling: dark surface, rounded bordered onboarding card, white registration CTA, muted helper copy, and blue security link match the reference hierarchy.
- Existing behavior: SaaS Base URL, Client Key persistence, connection testing, saving, and R2 configuration remain intact.
- Responsive behavior: no horizontal overflow at 350 px (`scrollWidth === innerWidth`). The dialog remains vertically scrollable and its footer remains reachable.
- Runtime: no application errors were present after opening and interacting with the dialog. One transient Turbopack `ChunkLoadError` occurred when the dev server was intentionally restarted for the smoke test; it did not recur after reload.

## Iteration history

- Initial implementation was checked at 600 px and 350 px.
- Confirmed the compact breakpoint stacks the three steps without truncating the registration CTA.
- Confirmed the optional security warning expands inline without introducing horizontal overflow.

final result: passed
