# parché rebrand and redesign (Oct 2026)

## Identity
- Logo: the red wordmark and é emblem, traced to vector (`public/brand/parche-wordmark.svg`, `parche-emblem.svg`). Used as CSS masks (`.wordmark`, `.emblem`) so they take any colour.
- PNG exports for social/email in `public/brand/` (white, red, black; 1080px Instagram avatar). Favicon, Apple icon and OG/Twitter images in `app/`.
- Colours: Rouge `#EE3A27` (brand field), Rouge ink `#C42B19` (small red text on white), Marine `#14213D` (type, quiet bands), Pierre `#F0F0ED` (wells behind retailer packshots), Graphite `#5B6070`.
- Type: Young Serif (display, echoes the logo's ball terminals) and Schibsted Grotesk (UI/body), self-hosted via Fontsource.

## Site
- Home: red hero "Dress for ___." — the city cycles and then follows what the traveller types; trip search; one worked example edit (Lisbon in October) built from verified products; three-step how-it-works; destinations; brand list; Instagram footer.
- Results: looks first ("What to wear in ___"), weather, optional refinements, then "What to pack" with a sticky list and up to four verified products per piece (one per price tier first).
- Motion: Lenis smooth scroll (GSAP ticker), React Bits SplitText for the hero line, GSAP clip reveals on the example edit, React Bits Magnet on one CTA. All disabled under prefers-reduced-motion.

## Products
73 reviewed records (UNIQLO, ZARA, H&M plus Sunspel, ASKET, Organic Basics, VEJA, Birkenstock, Rains, Fjällräven, Salomon). Each pairs the retailer's own image with its exact product URL and listed price. See `docs/click-tracking.md` for `/go/[id]` and affiliate links.
