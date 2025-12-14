# Mystic Loop: The Algorithmic Coven

> **Modern Mischief. Sacred Systems. Viral Magic.**

A viral-first, spiritually-infused discovery app that bridges ancient ritual, generative divination, and real-world synchronicity.

## Features

### Core Features

- **Mood Compass**: Select your emotional state to influence your readings
- **Daily Divination**: Hold-to-complete ritual with 22 Major Arcana tarot cards
- **Shadow Roasts & Mystic Guidance**: Each reading is either brutally honest or gently uplifting
- **Bond Roast**: Relationship compatibility readings for any two people
- **Digital Altar**: Daily check-ins with streak tracking and coin rewards
- **Sanctuary Map**: Discover fictional "energy convergence points" near you
- **Shadow Send**: Share blurred readings that unlock for recipients
- **Shareable Cards**: Every reading is unique and share-worthy

### Design System

- **Glassmorphism**: Frosted glass UI with backdrop blur and gradient borders
- **Aurora Gradients**: Dynamic, mood-responsive color systems
- **Typography**: JetBrains Mono (UI) × Cinzel (ritual headings) × Crimson Text (body)
- **Voice**: Mysterious but playful, meme-savvy, irreverent

### Technical Features

- **PWA Ready**: Installable on mobile devices
- **Haptic Feedback**: Vibration patterns for ritual interactions
- **Keyboard Shortcuts**: Cmd/Ctrl + 1/2/3 for navigation, Space to start ritual
- **Accessibility**: ARIA labels, focus states, screen reader support
- **Offline-First**: LocalStorage persistence

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool and dev server
- **Tailwind CSS** — Styling with custom glassmorphism utilities
- **Leaflet + React-Leaflet** — Interactive sanctuary map
- **Lucide React** — Icon library
- **LocalStorage** — Data persistence

## Project Structure

```
src/
├── App.jsx          # Main app with all views
├── BondRoast.jsx    # Relationship compatibility feature
├── index.css        # Tailwind + custom animations
└── main.jsx         # React entry point

public/
├── manifest.json    # PWA manifest
├── favicon.svg      # App icon
├── icon-*.svg       # PWA icons
└── og-image.svg     # Social sharing image
```

## License

MIT

---

*By Will A. For Iamê M.*

*"Re-enchant daily life. Create spiritual collectibility. Build safe, meaningful social bonds."*
