# Publishing Browser Extensions

## Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 registration fee (if first time)
3. Click **New Item**
4. Upload `dist/chrome.zip` (created by `bun build`)
5. Fill in listing details:
   - **Name**: Dumbdown
   - **Summary**: AI TL;DR as a shortcut
   - **Description**: See below
   - **Category**: Productivity
   - **Screenshots**: 1280x800 or 640x400 (upload from `assets/`)
   - **Icon**: 128x128 (already in zip)
6. Submit for review (takes 1-3 days)

## Firefox Add-ons

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Click **Submit a New Add-on**
3. Upload `dist/firefox.zip` (created by `bun build`)
4. Choose distribution: **On this site** (listed on addons.mozilla.org)
5. Fill in listing details:
   - **Name**: Dumbdown
   - **Summary**: AI TL;DR as a shortcut
   - **Description**: See below
   - **Category**: Bookmarks
   - **Screenshots**: Upload from `assets/`
6. Submit for review (takes 1-2 days)

## Store Description

Summarize any page. Ask follow-ups. Go deeper.

**Features:**
- Extracts page content as clean markdown using Readability
- Injects content directly into the LLM's input field and auto-submits
- Falls back to URL-only when content extraction fails
- One-click summarization via toolbar icon
- Vim-style shortcut: hold Shift and type DD
- Keyboard shortcuts for quick access
- Choose your LLM: Perplexity, ChatGPT, or Claude
- Visual feedback when activated

**How it works:**
Click the icon or use a shortcut, and Dumbdown extracts the page content as markdown, opens your selected LLM, injects the content into the input field, and auto-submits. If extraction fails, it falls back to sending just the URL. No API keys needed—it uses the LLM's web interface.

**Shortcuts:**
- Shift+DD (vim-style, works anywhere except text fields)
- Ctrl+Shift+Y / Cmd+Shift+S (default LLM)
- Ctrl+Shift+O / Cmd+Shift+P (Perplexity)
- Ctrl+Shift+U / Cmd+Shift+G (ChatGPT)
- Ctrl+Shift+L / Cmd+Shift+C (Claude)

## Creating the Promo Image

1. Open `assets/promo.html` in browser
2. Screenshot at 1280x800
3. Save as `assets/promo.png`
4. Upload to both stores

## Updating

1. Bump version in `src/chrome/manifest.json` and `src/firefox/manifest.json`
2. Rebuild: `bun build`
3. Upload new ZIP to respective store dashboards
