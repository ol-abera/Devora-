# Devora 2.0 — Landing page implementation notes

## Updated files

- `src/components/LandingPage.tsx` — redesigned responsive landing page.
- `src/components/Navigation.tsx` — refreshed global footer.
- `src/styles.css` — landing page, responsive, reduced-motion, dark-theme, and footer styles.
- `.env.example` — optional public monthly display values for future Plus and Pro pricing.

## Landing page sections

1. Warm welcome hero with calls to explore programs and create an account.
2. Explore our top programs, populated from the existing categories API.
3. Featured learning picks, populated from the existing featured courses API. Course detail buttons still use the existing course navigation.
4. Success stories section presented as illustrative learning pathways, not fabricated student outcomes.
5. Student testimonials section that explicitly waits for real, permission-based student feedback. The current API does not expose a platform-wide testimonials feed.
6. Free / Plus / Pro monthly ETB pricing comparison.
7. FAQ section using the existing FAQ content.
8. Refreshed global footer, rendered by the existing app layout.

## Subscription integration note

The current backend contract supports individual course purchases through Chapa. It does not currently define subscription checkout, subscription status, or plan entitlements. For that reason:

- Free registration continues to use the existing `/register` route.
- Plus and Pro are presented as coming soon and do not initiate a fake payment.
- Proposed plan features are clearly identified as not-yet-active in the page note.
- Optional display-only prices can be set using `VITE_DEVORA_PLUS_MONTHLY_ETB` and `VITE_DEVORA_PRO_MONTHLY_ETB` after amounts are approved. Do not treat these public frontend values as authoritative billing prices.
- Actual subscription checkout and entitlements must be implemented and enforced by the backend before enabling paid plan actions.

## Data integrity

- Program categories and featured course cards use the existing React Query hooks and Express API.
- Course prices use the existing ETB formatter.
- Course detail navigation remains connected to the existing route.
- No fabricated student names, quotes, ratings, or career outcomes were added.
- No backend files, database schema, API contracts, or payment endpoints were changed.

## Validation

The edited TSX files were parsed successfully with the globally available TypeScript transpiler. A full `npm run build` could not be completed in this environment because the dependency installation did not finish; run `npm ci` followed by `npm run build` locally to complete validation.

## Login page redesign (Devora 2.0)

- Replaced the login page presentation with a single-viewport split layout: welcome/brand panel on the left and a compact sign-in form on the right.
- Added a theme toggle to the standalone login screen and responsive single-column layout for small screens.
- Kept the existing login handler, validation, Google sign-in flow, password visibility control, forgot-password route, registration route, loading state, and API integration intact.
- Moved `/login` outside the shared marketing `Layout` so the global navigation, footer, and floating tutor do not force extra vertical space on the sign-in screen.
- The register, forgot-password, and reset-password pages continue using the existing shared auth layout.

Validation note: `tsc --noEmit` could not run because dependency installation did not complete in this environment (`@types/node` and `vite/client` are unavailable). Run `npm ci` followed by `npm run build` locally to complete validation.
