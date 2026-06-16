const router = require('express').Router();
const db = require('../db');

// Serialize a DB row into the shape the client expects
function serializeMatch(row) {
  const result = row.status === 'completed' ? {
    homeScore: row.result_home,
    awayScore: row.result_away,
    homeScorers: tryParse(row.result_scorers, []),
    awayScorers: [],
    // ⚠️ PLACEHOLDER: assisters and MOTM not yet auto-populated. Enter via /dev or wire in events.js.
    assisters: row.result_assisters ? tryParse(row.result_assisters, null) : null,
    motm: row.result_motm || null,
  } : null;

  return {
    id: row.id,
    homeTeam: row.home_team_id,
    awayTeam: row.away_team_id,
    home: row.home_team_id ? {
      id: row.home_team_id,
      name: row.home_team_name,
      code: row.home_team_code,
      iso2: (row.home_team_code || '').toLowerCase(),
      flagCode: (row.home_team_code || '').toLowerCase(),
      flag: row.home_flag || `https://flagcdn.com/w80/${(row.home_team_code || '').toLowerCase()}.png`,
      group: row.group_letter,
    } : null,
    away: row.away_team_id ? {
      id: row.away_team_id,
      name: row.away_team_name,
      code: row.away_team_code,
      iso2: (row.away_team_code || '').toLowerCase(),
      flagCode: (row.away_team_code || '').toLowerCase(),
      flag: row.away_flag || `https://flagcdn.com/w80/${(row.away_team_code || '').toLowerCase()}.png`,
      group: row.group_letter,
    } : null,
    stage: row.stage,
    stageType: row.stage_type,
    group: row.group_letter,
    matchday: row.matchday,
    stadium: row.stadium,
    city: row.city,
    kickoff: row.kickoff,
    status: row.status,
    result,
  };
}

function tryParse(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

// GET /matches
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM matches ORDER BY kickoff ASC').all();
  res.json(rows.map(serializeMatch));
});

// GET /teams  (used by client for player list fallback)
router.get('/teams', (req, res) => {
  const teams = db.prepare('SELECT * FROM teams').all();
  res.json(teams);
});

module.exports = router;
