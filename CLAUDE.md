# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat miniprogram called "天机阁" (Tianji Pavilion) - a Chinese metaphysics/divination app. It provides various fortune-telling and divination features including:
- 八字 (Bazi/Four Pillars) - Chinese astrology based on birth date/time
- 塔罗 (Tarot) - Tarot card readings
- 解梦 (Dream interpretation)
- 姓名分析 (Name analysis using Five Elements)
- 起名 (Baby naming based on Bazi)
- 梅花易数 (Plum Blossom numerology)

## Development Commands

This is a WeChat miniprogram - use WeChat DevTools to run and test. No build commands needed as miniprograms run directly in the WeChat environment.

## Architecture

### Directory Structure
```
miniprogram/
├── app.js          # App entry, global config (AI API, history)
├── app.json        # Page routes, tabBar, global components
├── app.wxss        # Global styles + theme import
├── styles/
│   └── theme.wxss  # CSS variables, card styles, fortune-cards styles
├── pages/          # Feature pages (bazi, tarot, dream, name, naming, meihua, lunar, history)
├── components/     # Reusable components
│   ├── fortune-card/  # Collapsible analysis card with tags
│   ├── star-sky/      # Decorative star background
│   └── rich-text/     # Rich text display
└── utils/          # Core algorithms
    ├── lunar.js      # Lunar calendar conversion (1900-2100)
    ├── bazi.js       # Four Pillars calculation
    ├── meihua.js     # Plum Blossom numerology
    ├── tarot-data.js # Tarot deck data (78 cards)
    ├── name-wuge.js  # Name Five Elements analysis
    ├── wuxing.js     # Five Elements utilities
    ├── fortune.js    # Daily fortune generation
    ├── ai-api.js     # AI API wrapper
    └── markdown.js   # Simple Markdown→HTML parser
```

### Key Patterns

**Page Structure**: Each feature page follows a consistent pattern:
1. User inputs (date pickers, text inputs)
2. Calculate results using utils
3. Call AI API for detailed interpretation
4. Parse AI response into `analysisCards` array
5. Render using `fortune-card` component

**fortune-card Component**: The main display component for analysis results. Accepts:
- `card` object with: `id`, `title`, `tags` (array of `{type, name}`), `content` (HTML), `maxLines`, `expanded`
- Supports expand/collapse, tag display with color coding

**AI Integration**: Uses OpenAI-compatible API configured in `app.js` globalData. Each divination type has a specific system prompt in `ai-api.js`. AI responses are parsed and split into cards by keyword matching.

**History**: Records are stored locally via `wx.setStorageSync` under `divination_history` key, max 100 entries.

### Styling

Theme uses CSS variables defined in `theme.wxss`:
- `--gold-primary: #B8962E` - Main accent color
- `--gold-dark: #8B7320`, `--gold-light: #D4A84B`
- Card styles: `.analysis-card`, `.style-card`, `.fortune-cards`

### Algorithm Files

- `lunar.js`: Solar↔Lunar date conversion using lookup tables (1900-2100)
- `bazi.js`: Calculates year/month/day/hour pillars, Ten Gods (十神), Nayin (纳音), hidden stems (藏干)
- `meihua.js`: Time-based and number-based hexagram generation
- `name-wuge.js`: Kangxi dictionary stroke counts, Five Elements scoring
