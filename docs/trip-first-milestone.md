# Trip-first travel edit

## Behaviour

- Home search requires only a destination and departure/return dates. Calendar dates are serialized without UTC conversion.
- Result URLs preserve destination, dates, activity and personal style. Refresh/back/forward work without signing in.
- Direct destination links ask for dates before producing a personalized edit.
- Three initial outfit suggestions appear before optional activity and style questions. Refinements update those looks immediately; clothing suggestions refresh after a short debounce.
- There is no budget intake. The existing optional shopping price filter is not the planned three-alternatives catalogue (milestone 2).
- Outfit text uses deterministic styling rules, destination metadata and sourced weather. These are suggestions, not assertions about live local fashion trends. Product suggestions still use the existing AI/image/category-link pipeline; exact merchandise matching is a separate milestone.

## Weather configuration

Create a Visual Crossing **Free** account without adding a payment method or enabling metered billing. Add its key as the server-only `VISUAL_CROSSING_API_KEY` Secret in Vercel for Preview and Production, then redeploy the preview. Never use a NEXT_PUBLIC prefix. The old OPEN_METEO_API_KEY is no longer used.

The free plan permits commercial use and includes 1,000 records per day. This is a records allowance, not 1,000 trip searches. Historical daily rows each consume records; a seven-day trip sampled across three years consumes approximately 21 historical records plus the forecast/location query on an uncached search. Keep the account on Free: application caching reduces requests but is not a global billing cap. No paid fallback or automatic plan upgrade is implemented.

- Forecast: the whole trip must fit within the next 15 days in the destination timezone. Statistical future estimates are not accepted as forecasts.
- Seasonal: average daily low/high temperatures for the same dates over three completed past seasons. All three complete seasons are required. This is a small historical sample, not a climate normal or future forecast.
- Rain: percentage of sampled days with at least 1 mm precipitation, not a probability.
- Regional destinations use a named reference town (e.g. Denpasar for Bali); the provider's resolved location appears in the result.
- Only daily data is requested. Forecasts are cached for six hours per destination across trip dates; historical requests for 30 days. Concurrent identical provider calls share a promise within a server instance. Next's persistent fetch cache handles reuse between requests; it is not a guaranteed quota enforcement mechanism.
- Missing credentials, quota exhaustion, network errors or incomplete responses show weather unavailable. Outfit suggestions still work. No temperatures are invented and no other provider is silently called.
- Visual Crossing attribution appears alongside weather results.

Documentation checked:
- https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/
- https://www.visualcrossing.com/resources/documentation/visual-crossing-weather-free-plan-free-weather-data-for-analysts-and-api-developers/

## Existing services

The existing `ANTHROPIC_API_KEY`, Clerk and Supabase settings remain in use. The date/refinement flow does not require a login. No database schema change is included; dashboard saved-trip persistence of preferences is a future follow-up. Missing AI credentials display a separate clothing-unavailable message without losing the travel edit.

## Validation

Run `npm test` for date, URL, personalization, weather-provider contract and clothing API/cache tests. Provider responses in these tests are mocked; they do not establish live provider connectivity or licence access.

Run `npx tsc --noEmit` and `npm run build`. The source repository has pre-existing lint findings, notably homepage effect patterns and Supabase `any` typing. The new modules and API handlers are checked separately.

## Design reference

This milestone retains the existing Parche website's typography, white/off-white surfaces, black actions, rounded controls and image proportions. The optional choices reuse that language after the first looks. Refero live research was unavailable because its subscription was inactive; its craft reference guided URL-backed state, visible focus, semantic controls, labelled inputs and at least 44px touch targets. A new brand direction is outside this milestone.

## Release checks

Before production: configure a free Visual Crossing key, validate near/far-date weather through the deployed app, check the actual AI service, and exercise the mobile flow. Review the feature branch/PR before merging. This change does not create an account or purchase a subscription.

## Verification receipt

- 15 automated checks passed, including API validation and clothing-prompt/cache isolation.
- TypeScript passed.
- Production build passed with `next build --webpack`, using a placeholder public Clerk key only for build verification. Authentication was not tested.
- Focused lint passed on the new modules and API handlers.
- The original Open-Meteo preview was browser-tested for dates and optional preferences. Visual Crossing live-provider validation remains pending the free account key. Provider tests use mocked responses.
