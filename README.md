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
- **Animations:** `src/main.js` · **Styles:** `src/style.css`
- **Photos:** `public/media/` (see its README)

## Spirit (AI assistant)

`api/spirit.js` is a Vercel function that sends the visitor's chat to Claude with the haras' information and rates as context. It needs an Anthropic API key:

1. Create a key at https://platform.claude.com.
2. In Vercel → Project → Settings → Environment Variables, add `ANTHROPIC_API_KEY`.
3. Redeploy.

Without the key (or in `npm run dev`), Spirit still answers common questions about lessons, boarding, events and visits from `src/data/services.js`.

## Reusable effect

`docs/hover-image-reveal-list.md` describes the numbered list with the floating photo (Centro Ecuestre), with a prompt and code to reuse it in other projects.
