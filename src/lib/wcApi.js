/* worldcup26.ir — free, no-auth REST API for World Cup 2026.
   Endpoints used: /get/teams, /get/games, /get/groups, /get/stadiums */

const BASE = 'https://worldcup26.ir';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`WC API ${res.status} ${path}`);
  return res.json();
}

let _teamsP = null;
let _gamesP = null;
let _groupsP = null;
let _stadiumsP = null;

export function fetchTeams() {
  if (!_teamsP) _teamsP = get('/get/teams').then(d => (d.teams || []).map(normalizeTeam));
  return _teamsP;
}
export function fetchGroupsRaw() {
  if (!_groupsP) _groupsP = get('/get/groups').then(d => d.groups || []);
  return _groupsP;
}
export function fetchStadiums() {
  if (!_stadiumsP) _stadiumsP = get('/get/stadiums').then(d => (d.stadiums || []).reduce((m, s) => (m[s.id] = s, m), {}));
  return _stadiumsP;
}
export function fetchGames() {
  if (!_gamesP) _gamesP = get('/get/games').then(d => d.games || []);
  return _gamesP;
}

function normalizeTeam(t) {
  const iso = (t.iso2 || '').toLowerCase();
  return {
    id: String(t.id),
    name: t.name_en,
    code: t.fifa_code,
    iso2: iso,
    flagCode: iso,
    flag: t.flag,
    group: t.groups,
  };
}

function parseLocalDate(s) {
  // "06/13/2026 21:00"
  if (!s) return null;
  const [date, time] = s.split(' ');
  const [mm, dd, yyyy] = date.split('/');
  const [hh, mi] = (time || '00:00').split(':');
  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:00`).toISOString();
}

export async function fetchMatches() {
  const [teams, games, stadiums] = await Promise.all([fetchTeams(), fetchGames(), fetchStadiums()]);
  const byId = Object.fromEntries(teams.map(t => [t.id, t]));

  return games.map(g => {
    const home = byId[g.home_team_id];
    const away = byId[g.away_team_id];
    const stadium = stadiums[g.stadium_id];
    const finished = String(g.finished).toUpperCase() === 'TRUE';
    const status = finished ? 'completed' : (g.time_elapsed === 'live' ? 'live' : 'upcoming');

    const stageLabel = g.type === 'group'
      ? `Group ${g.group}`
      : prettyStage(g.type);

    return {
      id: String(g.id),
      homeTeam: home?.id,
      awayTeam: away?.id,
      home,
      away,
      stage: stageLabel,
      stageType: g.type,
      group: g.group || null,
      matchday: g.matchday ? Number(g.matchday) : null,
      stadium: stadium?.name_en || stadium?.fifa_name || '',
      city: stadium?.city_en || '',
      kickoff: parseLocalDate(g.local_date),
      status,
      result: finished ? {
        homeScore: parseNum(g.home_score),
        awayScore: parseNum(g.away_score),
        homeScorers: parseScorers(g.home_scorers),
        awayScorers: parseScorers(g.away_scorers),
      } : null,
    };
  }).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
}

function parseNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function parseScorers(s) {
  if (!s || s === 'null') return [];
  return s.replace(/^\{|\}$/g, '').split(',').map(x => x.replace(/^"|"$/g, '').trim()).filter(Boolean);
}
function prettyStage(type) {
  const map = {
    round_of_32: 'Round of 32',
    round_of_16: 'Round of 16',
    quarter_final: 'Quarter-final',
    semi_final: 'Semi-final',
    third_place: 'Third place',
    final: 'Final',
  };
  return map[type] || type;
}

export async function fetchStandings() {
  const [teams, groupsRaw] = await Promise.all([fetchTeams(), fetchGroupsRaw()]);
  const byId = Object.fromEntries(teams.map(t => [t.id, t]));
  const out = {};
  for (const g of groupsRaw) {
    out[g.name] = (g.teams || [])
      .map(t => ({
        team: byId[t.team_id],
        mp: parseNum(t.mp), w: parseNum(t.w), d: parseNum(t.d), l: parseNum(t.l),
        gf: parseNum(t.gf), ga: parseNum(t.ga), gd: parseNum(t.gd), pts: parseNum(t.pts),
      }))
      .filter(r => r.team)
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  }
  return out;
}

export async function fetchGroupsByLetter() {
  const teams = await fetchTeams();
  const out = {};
  for (const t of teams) {
    if (!t.group) continue;
    if (!out[t.group]) out[t.group] = [];
    out[t.group].push(t);
  }
  return out;
}
