/**
 * ESPN public scoreboard — no API key, CORS-enabled.
 * Used for live score updates (updates within minutes).
 * Does NOT provide assisters or MOTM — see events.js (placeholder).
 */

function ymd(d) {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

async function fetchMatches() {
  const now = new Date();
  const from = new Date(now.getTime() - 3 * 86400000);   // 3 days back
  const to = new Date(now.getTime() + 35 * 86400000);    // 35 days ahead
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${ymd(from)}-${ymd(to)}&limit=200`;

  const res = await fetch(url, { headers: { 'User-Agent': 'wc-game-server/1.0' } });
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  const data = await res.json();
  return (data.events || []).map(normalizeEvent);
}

function normalizeEvent(ev) {
  const comp = ev.competitions?.[0];
  const home = comp?.competitors?.find(c => c.homeAway === 'home');
  const away = comp?.competitors?.find(c => c.homeAway === 'away');
  const status = comp?.status?.type || {};
  const note = comp?.altGameNote || comp?.notes?.[0]?.headline || '';
  const groupMatch = note.match(/Group\s+([A-L])/i);

  const completed = !!status.completed;
  const live = status.state === 'in';

  // Extract scorers from scoring plays if available
  const scoringPlays = comp?.scoringPlays || [];
  const scorers = scoringPlays
    .filter(p => p.type?.text === 'Goal')
    .map(p => p.text?.split(' -')[0]?.trim())
    .filter(Boolean);

  return {
    espnId: ev.id,
    kickoff: ev.date,
    homeCode: home?.team?.abbreviation,
    homeName: home?.team?.shortDisplayName || home?.team?.name,
    homeFlag: home?.team?.logo,
    awayCode: away?.team?.abbreviation,
    awayName: away?.team?.shortDisplayName || away?.team?.name,
    awayFlag: away?.team?.logo,
    group: groupMatch ? groupMatch[1].toUpperCase() : null,
    stadium: comp?.venue?.fullName || '',
    city: comp?.venue?.address?.city || '',
    status: completed ? 'completed' : (live ? 'live' : 'upcoming'),
    resultHome: completed ? (parseInt(home?.score) || 0) : null,
    resultAway: completed ? (parseInt(away?.score) || 0) : null,
    scorers,
  };
}

module.exports = { fetchMatches };
