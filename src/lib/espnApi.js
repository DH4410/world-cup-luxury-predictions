/* ESPN public scoreboard for FIFA World Cup 2026.
   No key required, CORS-enabled. */

const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

function ymd(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export async function fetchScoreboard({ from, to } = {}) {
  const start = from || new Date();
  const end = to || new Date(start.getTime() + 14 * 86400000);
  const url = `${BASE}?dates=${ymd(start)}-${ymd(end)}&limit=300`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  const data = await res.json();
  return (data.events || []).map(normalizeEvent);
}

function normalizeEvent(ev) {
  const comp = ev.competitions?.[0];
  const home = comp?.competitors?.find(c => c.homeAway === 'home');
  const away = comp?.competitors?.find(c => c.homeAway === 'away');
  const status = comp?.status?.type || {};
  const groupNote = comp?.altGameNote || '';
  const groupMatch = groupNote.match(/Group ([A-L])/i);

  return {
    id: ev.id,
    kickoff: ev.date,
    name: ev.shortName,
    venue: comp?.venue?.fullName,
    city: comp?.venue?.address?.city,
    group: groupMatch ? groupMatch[1].toUpperCase() : null,
    stage: groupNote || ev.season?.slug || 'World Cup',
    state: status.state,
    statusDetail: status.shortDetail,
    completed: !!status.completed,
    broadcast: comp?.broadcasts?.[0]?.names?.join(', ') || '',
    home: home && {
      id: home.team.id,
      name: home.team.shortDisplayName || home.team.name,
      abbr: home.team.abbreviation,
      logo: home.team.logo,
      color: home.team.color,
      score: home.score,
      form: home.form,
      winner: home.winner,
    },
    away: away && {
      id: away.team.id,
      name: away.team.shortDisplayName || away.team.name,
      abbr: away.team.abbreviation,
      logo: away.team.logo,
      color: away.team.color,
      score: away.score,
      form: away.form,
      winner: away.winner,
    },
  };
}

export async function fetchUpcoming(limit = 4) {
  const now = new Date();
  const events = await fetchScoreboard({
    from: now,
    to: new Date(now.getTime() + 10 * 86400000),
  });
  return events
    .filter(e => e.state === 'pre' && new Date(e.kickoff) > now)
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
    .slice(0, limit);
}

export async function fetchNextFeatured() {
  const list = await fetchUpcoming(1);
  return list[0] || null;
}
