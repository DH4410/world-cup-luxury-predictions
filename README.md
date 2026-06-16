# World Cup 2026 Luxury Predictions

A self-hosted prediction game for FIFA World Cup 2026. Pick scores, goalscorers, assisters (placeholder), and man of the match. Compete globally or in private rooms with friends.

---

## Architecture

```
                        ┌──────────────── Cloudflare ─────────────────────┐
  Browser  ──────────►  │  yourdomain.com         → Pages (Vite SPA)      │
                        │  auth.yourdomain.com    → Tunnel → Pi :5420     │
                        │  api.yourdomain.com     → Tunnel → Pi :5421     │  ← also WebSocket
                        └─────────────────────────────────────────────────┘
```

| Layer | Tech | Where |
|---|---|---|
| Client | React 19 + Vite + Tailwind | Cloudflare Pages / Vercel (static) |
| Auth server | Node + Express + bcrypt + JWT | Raspberry Pi, port **5420** |
| Game server | Node + Express + ws | Raspberry Pi, port **5421** |
| Database | better-sqlite3 (SQLite) | Pi, `DATA_DIR` outside the repo |
| Leaderboard cache | `leaderboard.json` | Pi, `DATA_DIR` |
| Match data | ESPN (live) + openfootball (scorers) | Polled server-side every 5 min |
| Process manager | pm2 | Pi |

---

## Repository layout

```
/                         ← Vite client (deployed to Cloudflare Pages / Vercel)
├─ src/
│   ├─ lib/api.js         ← fetch wrapper → auth + game servers
│   ├─ lib/ws.js          ← WebSocket client (auto-reconnect)
│   ├─ context/AppContext.jsx
│   ├─ pages/Dev.jsx      ← /dev admin panel (password-gated)
│   └─ …
├─ .env.local.example     ← copy → .env.local for local dev
└─ server/
    ├─ ecosystem.config.js   ← pm2 config (wc-auth + wc-game)
    ├─ deploy.sh             ← git pull + npm i + pm2 restart
    ├─ .env.example          ← copy → server/.env and fill secrets
    ├─ auth/                 ← port 5420
    │   ├─ index.js
    │   ├─ db.js             ← SQLite: users table
    │   └─ routes/auth.js    ← signup, login, logout, /me, /dev/reset-password
    └─ game/                 ← port 5421 (HTTP + WebSocket)
        ├─ index.js
        ├─ db.js             ← SQLite: matches, predictions, rooms, users_mirror
        ├─ ws.js             ← WebSocket broadcast layer
        ├─ scoring.js        ← idempotent point engine
        ├─ sources/
        │   ├─ espn.js           ← live scores (no key)
        │   ├─ openfootball.js   ← fixtures + goalscorers (no key)
        │   ├─ events.js         ← ⚠️ PLACEHOLDER: assisters + MOTM (returns null)
        │   └─ poller.js         ← runs every 5 min, seeds DB on first boot
        ├─ middleware/auth.js
        └─ routes/
            ├─ matches.js
            ├─ predictions.js    ← /me, /me/predictions, /predictions (locked at kickoff)
            ├─ rooms.js
            ├─ leaderboard.js
            └─ dev.js            ← admin: result entry, rescore, poll, user list
```

---

## Scoring

| Prediction | Points | Source |
|---|---|---|
| Exact scoreline | +5 | ESPN / openfootball (auto) |
| Correct outcome (W/D/L) | +2 | ESPN / openfootball (auto) |
| Goalscorer | +2 | openfootball (auto, lags ~hours) |
| Assister | +1 | ⚠️ **placeholder** — manual via `/dev` or wire in `sources/events.js` |
| Man of the Match | +1 | ⚠️ **placeholder** — manual via `/dev` or wire in `sources/events.js` |

Picks lock at kickoff. Scoring runs every poll cycle and after any admin result entry. The engine is **idempotent** — re-running never double-counts.

---

## Environment variables

### `server/.env` (Pi — both servers read this)

| Variable | Example | Notes |
|---|---|---|
| `JWT_SECRET` | `a-very-long-random-string` | Shared between both servers. Keep secret. |
| `ADMIN_PASSWORD` | `my-admin-pw` | Password for the `/dev` admin panel |
| `DATA_DIR` | `/home/pi/world-cup-data` | Where SQLite DBs + leaderboard.json live. **Outside the repo.** |
| `AUTH_PORT` | `5420` | |
| `GAME_PORT` | `5421` | |
| `CLIENT_ORIGIN` | `https://yourdomain.com` | Exact origin for CORS |
| `COOKIE_DOMAIN` | `.yourdomain.com` | Blank for localhost; `.yourdomain.com` in prod |
| `COOKIE_SAMESITE` | `lax` | `lax` for localhost + prod; `none` for pre-domain tunnel period (see below) |
| `POLL_INTERVAL_MS` | `300000` | 5 min default |
| `NODE_ENV` | `production` | |

### `.env.local` (client — Vite)

| Variable | Local dev | Production |
|---|---|---|
| `VITE_AUTH_URL` | `http://localhost:5420` | `https://auth.yourdomain.com` |
| `VITE_GAME_URL` | `http://localhost:5421` | `https://api.yourdomain.com` |
| `VITE_WS_URL` | `ws://localhost:5421` | `wss://api.yourdomain.com` |

---

## Local development (Windows)

### Prerequisites

- **Node.js 18 LTS or 20 LTS** — `node --version` to check. Download from [nodejs.org](https://nodejs.org).
- **`better-sqlite3`** compiles a small native module. On Windows it downloads a prebuilt binary automatically; if it fails, install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (select "Desktop development with C++").

### Steps

**1 — Copy env files**

```powershell
# Client
cp .env.local.example .env.local

# Servers
cp server/.env.example server/.env
# Edit server/.env — set JWT_SECRET and ADMIN_PASSWORD to anything you like for local testing.
# Leave COOKIE_DOMAIN blank and COOKIE_SAMESITE=lax for localhost.
```

**2 — Install dependencies**

```powershell
# Client deps (root)
npm install

# Auth server
cd server/auth
npm install
cd ../..

# Game server
cd server/game
npm install
cd ../..
```

**3 — Run all three processes** (three separate terminals)

```powershell
# Terminal 1 — auth server
node server/auth/index.js

# Terminal 2 — game server
node server/game/index.js

# Terminal 3 — Vite dev client
npm run dev
```

**4 — Open** [http://localhost:5173](http://localhost:5173)

On first start the game server fetches match data from openfootball and ESPN automatically. You'll see `[poller] seeded N matches` in the game server terminal. If that fetch fails (no internet / API down), the client falls back to the built-in mock data.

> **Tip:** Use `node --watch server/auth/index.js` and `node --watch server/game/index.js` for auto-restart on file save during development.

---

## Raspberry Pi setup

```bash
# 1. Clone
git clone <your-repo-url> ~/world-cup-predictions
cd ~/world-cup-predictions

# 2. Env
cp server/.env.example server/.env
nano server/.env    # fill in JWT_SECRET, ADMIN_PASSWORD, DATA_DIR=/home/pi/world-cup-data

# 3. Install
cd server/auth && npm install --omit=dev && cd ..
cd game && npm install --omit=dev && cd ../..

# 4. Start with pm2 (run from server/ dir)
cd server
pm2 start ecosystem.config.js
pm2 save
pm2 logs   # watch both servers

# 5. Updates (run deploy.sh from server/ dir)
bash deploy.sh
```

---

## Pre-domain testing with Cloudflare Tunnel

You don't need a domain to test the Pi from outside. `cloudflared` gives you free HTTPS tunnel URLs right now.

### Install cloudflared on the Pi

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb
```
*(use `arm` instead of `arm64` for Pi 2/3 32-bit)*

### Option A — Quick tunnels (easiest, URLs reset on restart)

Open two extra terminals on the Pi:

```bash
# Terminal A — auth tunnel
cloudflared tunnel --url http://localhost:5420
# → prints: https://some-random-words.trycloudflare.com  ← this is your AUTH URL

# Terminal B — game tunnel
cloudflared tunnel --url http://localhost:5421
# → prints: https://other-random-words.trycloudflare.com ← this is your GAME URL
```

Then:

1. **Update `server/.env`** on the Pi:
   ```
   CLIENT_ORIGIN=https://your-preview.vercel.app   # or pages.dev URL
   COOKIE_SAMESITE=none                            # ← required for cross-site cookies
   NODE_ENV=production
   ```
   Restart the servers: `pm2 restart wc-auth wc-game`

2. **Update Vercel / Cloudflare Pages environment variables:**
   ```
   VITE_AUTH_URL=https://some-random-words.trycloudflare.com
   VITE_GAME_URL=https://other-random-words.trycloudflare.com
   VITE_WS_URL=wss://other-random-words.trycloudflare.com
   ```
   Redeploy the client after saving.

3. Every time `cloudflared` restarts, the URLs change → update Vercel env vars and redeploy. This is the only downside of quick tunnels; it's a 2-minute job each time.

### Option B — Named tunnel (stable URL, no domain required)

Named tunnels give you a stable `https://<uuid>.cfargotunnel.com` URL that survives restarts. Requires a free Cloudflare account (no credit card).

```bash
# Log in once
cloudflared tunnel login

# Create two named tunnels
cloudflared tunnel create wc-auth
cloudflared tunnel create wc-game

# Note the tunnel UUIDs printed — your URLs will be:
# https://<auth-uuid>.cfargotunnel.com
# https://<game-uuid>.cfargotunnel.com

# Run them
cloudflared tunnel run --url http://localhost:5420 wc-auth &
cloudflared tunnel run --url http://localhost:5421 wc-game &
```

Update `server/.env` and Vercel vars as in Option A (with `COOKIE_SAMESITE=none`), but the URLs never change, so you only do this once.

### Domain cutover (when you buy it)

1. Add domain to Cloudflare (free plan, just change nameservers).
2. In Cloudflare Zero Trust → Tunnels → create/reconfigure tunnels to point `auth.yourdomain.com → localhost:5420` and `api.yourdomain.com → localhost:5421`.
3. Update `server/.env`:
   ```
   CLIENT_ORIGIN=https://yourdomain.com
   COOKIE_DOMAIN=.yourdomain.com
   COOKIE_SAMESITE=lax         # ← back to lax (same-site again)
   ```
4. Update Vercel / Pages env vars:
   ```
   VITE_AUTH_URL=https://auth.yourdomain.com
   VITE_GAME_URL=https://api.yourdomain.com
   VITE_WS_URL=wss://api.yourdomain.com
   ```
5. Add custom domain to Vercel / Pages project → point to `yourdomain.com`.
6. `pm2 restart wc-auth wc-game` on the Pi, redeploy client. Done.

---Hey im forcing a redeploy!

## Admin panel (`/dev`)

Go to `/dev` on the client. Sign in with `ADMIN_PASSWORD`.

| Action | What it does |
|---|---|
| **Match results tab** | Click any match to expand. Enter home/away score, goalscorers (comma-separated), assisters (⚠️ placeholder), MOTM (⚠️ placeholder). Saving immediately rescores everyone. |
| **Force poll** | Manually triggers a full data fetch from ESPN + openfootball right now. |
| **Rescore all** | Recomputes all points from scratch using current match results. Safe to run any time. |
| **Users tab** | View all registered users with their current point totals. |

Password reset is a CLI script on the Pi (no email needed):

```bash
# On the Pi
cd ~/world-cup-predictions/server/auth
node -e "
const db = require('./db');
const bcrypt = require('bcrypt');
bcrypt.hash('newpassword123', 12).then(h => {
  db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(h, 'theusername');
  console.log('done');
});
"
```

---

## Data sources

| Source | Data | Reliability | Key needed |
|---|---|---|---|
| ESPN hidden API | Live/final scores + some scorers | Very high — updates within minutes | No |
| openfootball/worldcup.json | Full fixtures, final scores, goalscorers | High — manually updated ~daily | No |
| `sources/events.js` | Assisters + MOTM | **Placeholder — returns null** | N/A |

**To wire in a real assister/MOTM source later:** edit `server/game/sources/events.js` — the function signature and return shape (`{ assisters: string[], motm: string }`) are already in place. The poller calls it automatically after every completed match.

---

## Deployment reference

| Task | Command |
|---|---|
| Start both servers | `cd server && pm2 start ecosystem.config.js && pm2 save` |
| Deploy update | `cd server && bash deploy.sh` |
| View logs | `pm2 logs` or `pm2 logs wc-game --lines 50` |
| Restart one server | `pm2 restart wc-auth` |
| Check status | `pm2 status` |
| Build client | `npm run build` (output in `dist/`) |
| Preview built client | `npm run preview` |
