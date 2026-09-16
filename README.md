# Quilio — UI/UX Prototype

Static HTML/CSS prototype of the Quilio brand and core screens. No build step required — open any .html file directly in a browser, or serve the folder with any static server.

## Screens
- `index.html` — Logo reveal / intro splash
- `feed.html` — Home feed with rail navigation, tag tabs, and an ambient-glow "trending" card
- `article.html` — Article reader with the "Chat with a blog" side panel (citations included)
- `learn.html` — "Learn This" mode: key concepts + quiz

## Design tokens
All colors, fonts, radii, and the reusable `.ambient-glow` effect live in `style.css`.

- Background: `#0B0D12` / `#12141C` / `#15171F`
- Accent gradient: `#6366F1` → `#A855F7`
- Progress/gamification accent: `#F2A93B`
- Display/body font: Newsreader (serif)
- UI font: Inter

## Notes for backend integration
- Feed cards, article content, and chat messages are static placeholders — swap in real data via your API
- The `.ambient-glow` class is meant to be applied conditionally (e.g. only on trending posts or while the AI chat panel is open), not globally
- Citation pills (`.cite`) are static; wire them to scroll/highlight the matching paragraph using your chunk metadata
