<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./dashboard/public/tag-logo.png" width="200">
    <img alt="F1 Naija" src="./dashboard/public/tag-logo.png" width="200">
  </picture>
</p>

<h1 align="center">F1 Naija — Nigeria's #1 Formula 1 Platform</h1>

<p align="center">
  Real-time F1 telemetry, live timing, race data, championship standings, and community — built for Nigerian fans everywhere.
</p>

<p align="center">
  <a href="https://live.f1naija.com">live.f1naija.com</a> ·
  <a href="https://x.com/f1_naija">@f1_naija</a> ·
  <a href="https://www.instagram.com/f1_naija/">Instagram</a>
</p>

---

## What is F1 Naija?

F1 Naija is the largest Nigerian Formula 1 platform — delivering real-time race telemetry, live timing, championship standings, race schedule, F1 news, and community features, all in one place.

Started as a social media community, F1 Naija has grown to serve **5,000+ Instagram followers**, **6,600+ X (Twitter) followers**, and over **1 million monthly impressions** — with fans across Lagos, London, Houston, Dubai, and everywhere in between.

---

## Platform Features

### 🏎️ Live Dashboard
Real-time telemetry and timing data streamed during race sessions. Shows the leaderboard, lap times, gaps, mini-sector times, tyre compounds, DRS status, and more — exactly as it happens on track.

### 📅 Race Schedule
Full 2026 F1 season calendar with session times in WAT (Nigeria), GMT, SAST (South Africa), and ET (US East). Timezone preference is persisted. Each round includes:
- **Add to Google Calendar** button
- **Share on WhatsApp** button

### 🏆 Championship Standings
Driver and constructor standings updated after each race, with team colour coding and points breakdown.

### 📰 F1 News
Headlines aggregated from BBC Sport, Autosport, The Race, Planet F1, and more — in a single feed.

### 🇳🇬 Community
- Fantasy League (200+ players) — join with code `C1JYXEPWR10`
- X (Twitter) Spaces — live race reaction audio
- Lagos Watch Parties
- Race Day Threads on X and Threads
- WhatsApp Community

### 📺 How to Watch in Nigeria
Displayed on the countdown card: DStv SuperSport F1 (Ch. 208), Canal+ Sport, F1 TV Pro, ShowMax.

---

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, stats bar, race countdown, hub grid, community section |
| `/dashboard` | Live F1 timing dashboard |
| `/schedule` | Full 2026 season calendar with Add to Calendar + WhatsApp share |
| `/standings` | Driver and constructor championship standings |
| `/news` | Live F1 news feed |
| `/community` | Community hub — fantasy, spaces, watch parties, threads |
| `/fantasy` | Fantasy league guide, how to play, prizes, FAQs |
| `/partner` | Sponsorship and advertising packages + media kit |
| `/start-here` | New fan guide — F1 basics, Naija watch guide, jargon decoder |
| `/about` | F1 Naija story, stats, social links |
| `/help` | Help and FAQ |

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 15 (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v3
- **Language**: TypeScript (strict mode)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Live Data**: Server-Sent Events (SSE) via custom realtime service
- **Hosting**: Vercel

---

## Architecture

```
f1-naija-dash/
├── dashboard/          # Next.js frontend
│   ├── src/
│   │   ├── app/        # App Router pages and layouts
│   │   ├── components/ # Reusable UI components
│   │   ├── stores/     # Zustand state stores
│   │   ├── lib/        # Utilities and helpers
│   │   └── styles/     # Global CSS (Tailwind v3)
├── api/                # Rust-based data API
├── realtime/           # SSE realtime service
├── signalr/            # F1 SignalR client
└── push-service/       # Web push notification service
```

---

## Community & Contact

| Channel | Link |
|---|---|
| X (Twitter) | [@f1_naija](https://x.com/f1_naija) · 6.6K followers |
| Instagram | [@f1_naija](https://www.instagram.com/f1_naija/) · 5K+ followers |
| Threads | [@f1_naija](https://www.threads.com/@f1_naija) |
| TikTok | [@f1.naija](https://www.tiktok.com/@f1.naija) |
| Partnerships | ads@f1naija.com |

---

## Contributing

PRs and issues are welcome. Please check existing issues before opening a new one. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for local setup instructions.

---

## Notice

This project is **unofficial** and is not affiliated with Formula One Licensing B.V., the FIA, or any F1 team or driver.
F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing B.V.
