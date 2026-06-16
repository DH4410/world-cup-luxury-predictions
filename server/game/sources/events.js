/**
 * ⚠️  PLACEHOLDER — Assisters & Man of the Match
 * ─────────────────────────────────────────────
 * No free API currently provides reliable assister or MOTM data for WC 2026.
 *
 * Options to wire in later:
 *   - API-Football (api-football.com) — has match events incl. assists; free tier ~100 req/day + API key
 *   - Scraping FIFA/Transfermarkt after each match
 *   - Manual entry via the /dev admin panel (already supported)
 *
 * Until then, all functions return null and the scoring engine skips those points
 * (they are still available for manual entry through /dev/api/matches/:id/result).
 *
 * HOW TO WIRE IN: replace fetchAssistersAndMotm below with a real implementation,
 * returning { assisters: string[], motm: string|null }. The poller in sources/poller.js
 * will call it automatically after each completed match.
 */

async function fetchAssistersAndMotm(/* matchId, homeCode, awayCode */) {
  return { assisters: null, motm: null };
}

module.exports = { fetchAssistersAndMotm };
