# Haras La Alhambra

Website for Haras La Alhambra: Arabian and Pura Raza Española breeders in Santa Cruz de la Sierra, Bolivia, since 1993.

Static multi-page site built with Vite, GSAP (ScrollTrigger, SplitText) and Lenis, plus one Vercel function for Spirit, the site's assistant. Spanish by default, English via the ES/EN toggle.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

## Pages

| URL | File |
| --- | --- |
| `/` | `index.html` (home, chapters I–VIII in brief) |
| `/historia/` | Chapter I — the origin |
| `/linajes/` | Chapter II — bloodlines |
| `/filosofia/` | Chapter III — philosophy |
| `/el-haras/` | Chapter IV — the estate |
| `/noches/` | Chapter V — nights, events and 2025 competitions |
| `/educacion/` | Chapter VI — riding school |
| `/servicios/` | Chapter VII — services and rates |

Any new folder with an `index.html` becomes a page automatically.

## Where things live

- **Copy:** Spanish is written in the HTML; English sits on the same element in `data-en` (and `data-en-placeholder`, `data-en-alt`).
- **Shared header, menu, footer and Spirit widget:** `src/partials/*.html`, pulled into every page with `<!-- @include nav -->` etc.
- **Services and prices:** `src/data/services.js`. The rates page and Spirit both read from it, so a price changes in one place.
- **Home hero:** `src/hero.js`. The film plays through the letters of ALHAMBRA cut out of a sheet of paper; on scroll the camera flies into the H while the film pulls back. Letters fit any screen (one line when wide, AL / HAM / BRA on phones).
- **Program cards** (home and Education): `src/partials/programs.html`.
- **Animations:** `src/main.js` · **Styles:** `src/style.css`
- **Type:** Cormorant Garamond for headings, Montserrat for text. Spacing between sections is the `--section` token (never under 120px on desktop); corners use `--radius`.
- **Galleries:** a balanced grid where every row ends flush. Give landscape photos `g-wide` (two columns) and a hero shot `g-feature` (2 × 2); portraits need no class. Keep each gallery's total at a multiple of 4 cells (wide = 2, feature = 4).
- **Photo focus:** fixed frames crop with `style="--pos: 50% 60%"` on the `<img>` to keep the horse in view.
- **Photos:** `public/media/` (see its README)

## Spirit (AI receptionist)

`api/spirit.js` is a Vercel function that answers visitors with the haras' information and rates as context. Its logo is the animated horse in `src/partials/spirit.html` (styles under "Spirit's logo" in `src/style.css`).

- **Model:** NVIDIA Nemotron (`nvidia/nemotron-3-ultra-550b-a55b`) through NVIDIA's OpenAI-compatible API, with thinking off so replies come back in a couple of seconds.
- **Key:** `NVIDIA_API_KEY` in Vercel → Project → Settings → Environment Variables (never in the code).
- **Optional backup:** if `ANTHROPIC_API_KEY` is also set, Claude answers whenever NVIDIA fails.

Without any key (or in `npm run dev`), Spirit still answers common questions about lessons, boarding, events and visits from `src/data/services.js`.

## Reusable effect

`docs/hover-image-reveal-list.md` describes the numbered list with the floating photo (Centro Ecuestre), with a prompt and code to reuse it in other projects.
