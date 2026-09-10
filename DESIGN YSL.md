# Saint Laurent Official Online Store

## Mission
Create implementation-ready, token-driven UI guidance for Saint Laurent Official Online Store that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand
- Product/brand: Saint Laurent Official Online Store
- URL: https://www.ysl.com/en-my?utm_source=google&utm_source_platform=SA360&utm_medium=cpc&utm_campaign=MY%7CEN%7CSRC%7CBrand+Pure%7CBrand%7CU%7CPure_Exact_ysl&utm_id=13552473783&gclsrc=aw.ds&gad_source=1&gad_campaignid=13552473783&gclid=Cj0KCQjwh4TVBhCWARIsAG0czmrM3XRahxIL8Qnb3yDds408OXKD61Xz4xAr_6DYNAlPSAHtNcgtjCQaAhrFEALw_wcB
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: minimal, utility-first, accessibility-prioritized
- Main font style: `font.family.primary=Helvetica_Reg`, `font.family.stack=Helvetica_Reg, Helvetica, Arial, sans-serif`, `font.size.base=12px`, `font.weight.base=400`, `font.lineHeight.base=16px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=14px`
- Color palette: `color.surface.base=#000000`, `color.text.secondary=#ffffff`
- Spacing scale: `space.1=2px`, `space.2=4px`, `space.3=10px`, `space.4=11px`, `space.5=12px`, `space.6=16px`, `space.7=20px`, `space.8=24px`
- Radius/shadow/motion tokens: `radius.xs=12px` | `motion.duration.instant=250ms`, `motion.duration.fast=350ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (366), buttons (108), lists (94), inputs (18), cards (5), navigation (4).

- Extraction diagnostics: Limited color diversity detected; color token inference confidence is low. Limited typography variety detected; size scale may need manual refinement.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
