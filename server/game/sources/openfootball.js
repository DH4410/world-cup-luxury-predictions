/**
 * openfootball/worldcup.json — free, no API key, public domain.
 * Provides: fixtures, final scores, goalscorers.
 * Updates: ~once daily by the maintainer (lags live by hours).
 * Does NOT provide: assisters or MOTM — see events.js (placeholder).
 *
 * 2026 JSON format:
 *   { name, matches: [{ round, date, time, team1, team2, score:{ft,ht}, goals1, goals2, group, ground }] }
 * team1/team2 are plain strings (team names), not objects.
 */

const OF_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000;

// FIFA 3-letter codes for WC 2026 participants
const NAME_TO_CODE = {
  'Mexico': 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR', 'Czech Republic': 'CZE',
  'Canada': 'CAN', 'Bosnia & Herzegovina': 'BIH', 'Bosnia and Herzegovina': 'BIH',
  'USA': 'USA', 'United States': 'USA', 'Brazil': 'BRA', 'Argentina': 'ARG',
  'Germany': 'GER', 'France': 'FRA', 'England': 'ENG', 'Spain': 'ESP',
  'Portugal': 'POR', 'Netherlands': 'NED', 'Belgium': 'BEL', 'Croatia': 'CRO',
  'Serbia': 'SRB', 'Switzerland': 'SUI', 'Denmark': 'DEN', 'Morocco': 'MAR',
  'Senegal': 'SEN', 'Japan': 'JPN', 'Australia': 'AUS', 'Iran': 'IRN',
  'Saudi Arabia': 'KSA', 'Ecuador': 'ECU', 'Uruguay': 'URU', 'Colombia': 'COL',
  'Chile': 'CHI', 'Peru': 'PER', 'Venezuela': 'VEN', 'Jamaica': 'JAM',
  'Panama': 'PAN', 'Honduras': 'HON', 'Costa Rica': 'CRC', 'El Salvador': 'SLV',
  'Guatemala': 'GUA', 'Cuba': 'CUB', 'Cameroon': 'CMR', 'Ghana': 'GHA',
  'Nigeria': 'NGA', 'Ivory Coast': 'CIV', "Côte d'Ivoire": 'CIV',
  'Mali': 'MLI', 'Egypt': 'EGY', 'Algeria': 'ALG', 'Tunisia': 'TUN',
  'Tanzania': 'TAN', 'Comoros': 'COM', 'Benin': 'BEN', 'Qatar': 'QAT',
  'Iraq': 'IRQ', 'Jordan': 'JOR', 'Uzbekistan': 'UZB', 'New Zealand': 'NZL',
  'Bahrain': 'BHR', 'Poland': 'POL', 'Ukraine': 'UKR', 'Turkey': 'TUR',
  'Austria': 'AUT', 'Slovakia': 'SVK', 'Slovenia': 'SVN', 'Romania': 'ROU',
  'Hungary': 'HUN', 'Scotland': 'SCO', 'Wales': 'WAL', 'Ireland': 'IRL',
  'Greece': 'GRE', 'Albania': 'ALB', 'North Macedonia': 'MKD', 'Iceland': 'ISL',
  'Finland': 'FIN', 'Sweden': 'SWE', 'Norway': 'NOR', 'Israel': 'ISR',
  'Georgia': 'GEO', 'Indonesia': 'IDN', 'Thailand': 'THA',
  'China PR': 'CHN', 'China': 'CHN', 'India': 'IND', 'Paraguay': 'PAR',
  'Bolivia': 'BOL', 'Kenya': 'KEN', 'Zimbabwe': 'ZIM', 'Congo DR': 'COD',
  'Angola': 'ANG', 'Zambia': 'ZAM', 'Mauritania': 'MTN', 'Cape Verde': 'CPV',
};

function teamCode(name) {
  if (!name) return null;
  return NAME_TO_CODE[name] ||
    name.split(/[\s&]+/).map(w => w[0]).join('').toUpperCase().slice(0, 3) || null;
}

function teamId(name) {
  if (!name) return null;
  return `team-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

// Parse "13:00 UTC-6" or "20:00 UTC+5:30" → ISO UTC string
function buildKickoff(date, rawTime) {
  if (!date) return new Date().toISOString();
  const t = rawTime || '00:00';
  const m = t.match(/(\d{1,2}):(\d{2})(?:\s+UTC([+-]\d+(?::\d+)?))?/i);
  if (!m) return `${date}T00:00:00Z`;
  const h = parseInt(m[1]), min = parseInt(m[2]);
  const hh = String(h).padStart(2, '0'), mm = String(min).padStart(2, '0');
  if (!m[3]) return `${date}T${hh}:${mm}:00Z`;
  const om = m[3].match(/([+-])(\d+)(?::(\d+))?/);
  if (!om) return `${date}T${hh}:${mm}:00Z`;
  const sign = om[1] === '+' ? 1 : -1;
  const offMins = sign * (parseInt(om[2]) * 60 + parseInt(om[3] || '0'));
  const d = new Date(Date.UTC(
    parseInt(date.slice(0, 4)), parseInt(date.slice(5, 7)) - 1, parseInt(date.slice(8, 10)),
    h, min, 0
  ));
  d.setMinutes(d.getMinutes() - offMins);
  return d.toISOString();
}

async function fetchRaw() {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;
  const res = await fetch(OF_URL, { headers: { 'User-Agent': 'wc-game-server/1.0' } });
  if (!res.ok) throw new Error(`openfootball ${res.status}`);
  _cache = await res.json();
  _cacheTime = Date.now();
  return _cache;
}

async function fetchMatches() {
  const data = await fetchRaw();
  const matches = [];

  if (Array.isArray(data.matches)) {
    // 2026 format: flat array
    data.matches.forEach((m, idx) => matches.push(normalizeMatch(m, idx + 1)));
  } else if (Array.isArray(data.rounds)) {
    // Legacy nested format
    for (const round of data.rounds) {
      for (const m of (round.matches || [])) {
        matches.push(normalizeMatch(m, matches.length + 1));
      }
    }
  }

  return matches;
}

function normalizeMatch(m, idx) {
  const groupMatch = (m.group || '').match(/Group\s+([A-L])/i);
  const groupLetter = groupMatch ? groupMatch[1].toUpperCase() : null;
  const roundLabel = m.group || m.round || '';
  const stageType = deriveStageType(roundLabel);
  const stage = groupLetter ? `Group ${groupLetter}` : prettyStage(stageType);

  // 2026: team1/team2 are plain strings; legacy: they're objects
  const homeName = typeof m.team1 === 'string' ? m.team1 : (m.team1?.name || null);
  const awayName = typeof m.team2 === 'string' ? m.team2 : (m.team2?.name || null);
  const homeCode = typeof m.team1 === 'string' ? teamCode(m.team1)
    : ((m.team1?.code || m.team1?.key || '') || null)?.toUpperCase() || null;
  const awayCode = typeof m.team2 === 'string' ? teamCode(m.team2)
    : ((m.team2?.code || m.team2?.key || '') || null)?.toUpperCase() || null;

  // 2026: goals1/goals2 are arrays of {name, minute}; older formats vary
  const parseGoals = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(g => cleanName(g.name || g.player)).filter(Boolean);
  };
  const homeScorers = parseGoals(m.goals1);
  const awayScorers = parseGoals(m.goals2);

  const ft = m.score?.ft || m.ft;
  const completed = Array.isArray(ft) && ft.length === 2;

  return {
    num: m.num || idx,
    kickoff: buildKickoff(m.date, m.time),
    homeCode: homeCode || null,
    homeName: homeName || null,
    awayCode: awayCode || null,
    awayName: awayName || null,
    homeId: homeName ? teamId(homeName) : null,
    awayId: awayName ? teamId(awayName) : null,
    stage,
    stageType,
    group: groupLetter,
    stadium: m.ground || m.stadium?.name || m.venue || null,
    city: m.ground || m.stadium?.city || m.city || null,
    completed,
    resultHome: completed ? ft[0] : null,
    resultAway: completed ? ft[1] : null,
    homeScorers,
    awayScorers,
  };
}

function cleanName(name) {
  if (!name) return null;
  return String(name)
    .replace(/\s*\d+['′]\s*(\+\d+['′])?\s*$/, '')
    .replace(/\s*\(p\)\s*$/i, '')
    .replace(/\s*\(og\)\s*$/i, '')
    .trim() || null;
}

function deriveStageType(label) {
  const l = label.toLowerCase();
  if (l.includes('group')) return 'group';
  if (l.includes('third')) return 'third_place';
  if (l.includes('final') && !l.includes('semi') && !l.includes('quarter')) return 'final';
  if (l.includes('semi')) return 'semi_final';
  if (l.includes('quarter')) return 'quarter_final';
  if (l.includes('round of 16') || l.includes('last 16')) return 'round_of_16';
  if (l.includes('round of 32')) return 'round_of_32';
  return 'group';
}

function prettyStage(type) {
  return {
    round_of_32: 'Round of 32', round_of_16: 'Round of 16',
    quarter_final: 'Quarter-final', semi_final: 'Semi-final',
    third_place: 'Third place', final: 'Final', group: 'Group Stage',
  }[type] || type;
}

module.exports = { fetchMatches };
