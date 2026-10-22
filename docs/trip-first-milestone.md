# Trip-first travel edit

## Behaviour

- Home search requires only a destination and departure/return dates. Calendar dates are serialized without UTC conversion.
- Result URLs preserve destination, dates, activity and personal style. Refresh/back/forward work without signing in.
- Direct destination links ask for dates before producing a personalized edit.
- Three initial outfit suggestions appear before optional activity and style questions. Refinements update those looks immediately; clothing suggestions refresh after a short debounce.
- There is no budget intake. The existing optional shopping price filter is not the planned three-alternatives catalogue (milestone 2).
- Outfit text uses deterministic styling rules, destination metadata and sourced weather. These are suggestions, not assertions about live local fashion trends. Product suggestions still use the existing AI/image/category-link pipeline; exact merchandise matching is a separate milestone.

## Weather configuration

Add a server-only `OPEN_METEO_API_KEY` in Vercel for commercial use. The subscription must include Historical Weather API access (the current Open-Meteo pricing page lists this under Professional or Enterprise, not Standard). Do not use a NEXT_PUBLIC prefix.

The implementation uses customer geocoding, forecast and archive endpoints when a key exists. Without a key, free endpoints are used only in local development or Vercel preview evaluation. Production fails gracefully to an unavailable-weather message instead of using the non-commercial endpoint or inventing data.

- Forecast: every trip day must be within the provider's 16-day window, using the reference location's timezone.
- Seasonal: average daily low/high temperatures over the same calendar period in five completed past seasons, with at least three complete seasons required. This is a small historical sample, not a climate normal or future forecast. Long trips crossing the forecast boundary use a consistent historical basis for the whole trip.
- Rain: percentage of sampled days with at least 1 mm precipitation, not a forecast probability.
- Regional destinations use a named reference town shown to the visitor (e.g. Denpasar for Bali).
- Missing or partial responses produce an unavailable state, never zero-degree replacements.
- Provider requests time out; forecast fetches revalidate hourly and historical fetches monthly.
- Attribution and the data licence appear next to successful weather results.

Documentation checked:
- https://open-meteo.com/en/docs
- https://open-meteo.com/en/docs/historical-weather-api
- https://open-meteo.com/en/docs/geocoding-api
- https://open-meteo.com/en/pricing
- https://open-meteo.com/en/terms

## Existing services

The existing `ANTHROPIC_API_KEY`, Clerk and Supabase settings remain in use. The date/refinement flow does not require a login. No database schema change is included; dashboard saved-trip persistence of preferences is a future follow-up. Missing AI credentials display a separate clothing-unavailable message without losing the travel edit.

## Validation

Run `npm test` for date, URL, personalization, weather-provider contract and clothing API/cache tests. Provider responses in these tests are mocked; they do not establish live provider connectivity or licence access.

Run `npx tsc --noEmit` and `npm run build`. The source repository has pre-existing lint findings, notably homepage effect patterns and Supabase `any` typing. The new modules and API handlers are checked separately.

## Design reference

This milestone retains the existing Parche website's typography, white/off-white surfaces, black actions, rounded controls and image proportions. The optional choices reuse that language after the first looks. Refero live research was unavailable because its subscription was inactive; its craft reference guided URL-backed state, visible focus, semantic controls, labelled inputs and at least 44px touch targets. A new brand direction is outside this milestone.

## Release checks

Before production: configure a commercial weather key, validate near/far-date weather through the deployed app, check the actual AI service, and exercise the mobile flow. Review the feature branch/PR before merging. This change does not create an account or purchase a subscription.

## Verification receipt

- 13 automated checks passed, including API validation and clothing-prompt/cache isolation.
- TypeScript passed.
- Production build passed with `next build --webpack`, using a placeholder public Clerk key only for build verification. Authentication was not tested.
- Focused lint passed on the new modules and API handlers.
- Local browser runtime was blocked by workspace permission (`listen EPERM`), so browser and live-provider validation remain release checks.
