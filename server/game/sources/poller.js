/**
 * Match data poller.
 * Strategy:
 *   1. openfootball → seed teams + fixtures on first run, refresh scorers hourly
 *   2. ESPN         → fast live/final score updates every poll cycle
 *   3. events.js    → PLACEHOLDER for assisters/MOTM (returns null today)
 *   4. After any match moves to 'completed': run scoring engine
 */

const db = require('../db');
const espn = require('./espn');
const openfootball = require('./openfootball');
const { fetchAssistersAndMotm } = require('./events');
const { scoreAllMatches } = require('../scoring');
const { broadcast } = require('../ws');

const POLL_MS = parseInt(process.env.POLL_INTERVAL_MS, 10) || 5 * 60 * 1000;

// ISO date string → Date
function parseKickoff(kickoff) { return new Date(kickoff); }

// Derive status from kickoff time + current status
function deriveStatus(kickoff, currentStatus, resultHome) {
  if (currentStatus === 'completed' || resultHome !== null && resultHome !== undefined) return 'completed';
  const diff = Date.now() - new Date(kickoff).getTime();
  if (diff > 150 * 60 * 1000) return 'live'; // 2.5h after kickoff, assume live if no result yet
  if (diff > 0) return 'live';
  return 'upcoming';
}

async function seedFromOpenfootball() {
  console.log('[poller] seeding from openfootball...');
  const matches = await openfootball.fetchMatches();
  if (!matches.length) { console.warn('[poller] openfootball returned no matches'); return; }

  const upsertTeam = db.prepare(
    'INSERT OR IGNORE INTO teams (id, name, code, group_letter) VALUES (?, ?, ?, ?)'
  );
  const upsertMatch = db.prepare(`
    INSERT INTO matches (id, home_team_id, away_team_id, home_team_name, away_team_name,
      home_team_code, away_team_code, stage, stage_type, group_letter, matchday, stadium, city,
      kickoff, status, result_home, result_away, result_scorers, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status        = excluded.status,
      result_home   = excluded.result_home,
      result_away   = excluded.result_away,
      result_scorers = excluded.result_scorers,
      updated_at    = datetime('now')
    WHERE manually_overridden = 0
  `);

  // node:sqlite doesn't have db.transaction() — use manual BEGIN/COMMIT
  // node:sqlite rejects undefined — coerce everything to null
  const n = (v) => (v === undefined || v === '' ? null : v);

  db.exec('BEGIN');
  try {
    for (const m of matches) {
      // normalizer now provides homeId/awayId derived from team name
      const homeId = m.homeId || `team-ofb-${m.num}`;
      const awayId = m.awayId || `team-ofb-${m.num}-2`;

      if (n(m.homeName || m.homeCode)) {
        upsertTeam.run(homeId, n(m.homeName || m.homeCode), n(m.homeCode), n(m.group));
      }
      if (n(m.awayName || m.awayCode)) {
        upsertTeam.run(awayId, n(m.awayName || m.awayCode), n(m.awayCode), n(m.group));
      }

      const scorers = JSON.stringify([...(m.homeScorers || []), ...(m.awayScorers || [])]);
      const status = m.completed ? 'completed' : 'upcoming';

      upsertMatch.run(
        String(m.num), homeId, awayId, n(m.homeName), n(m.awayName),
        n(m.homeCode), n(m.awayCode), n(m.stage), n(m.stageType), n(m.group),
        null, n(m.stadium), n(m.city),
        m.kickoff, status, m.resultHome ?? null, m.resultAway ?? null, scorers, 'openfootball'
      );
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  console.log(`[poller] seeded ${matches.length} matches from openfootball`);
}

async function syncESPN() {
  const espnMatches = await espn.fetchMatches();
  if (!espnMatches.length) return;

  const updateScore = db.prepare(`
    UPDATE matches SET
      status       = ?,
      result_home  = ?,
      result_away  = ?,
      espn_event_id = ?,
      source       = 'espn',
      updated_at   = datetime('now')
    WHERE (home_team_code = ? AND away_team_code = ?)
      AND date(kickoff) = date(?)
      AND manually_overridden = 0
  `);

  // Also merge scorers from ESPN if we have them and of field is empty
  const mergeScorers = db.prepare(`
    UPDATE matches SET result_scorers = ?, source = 'espn', updated_at = datetime('now')
    WHERE (home_team_code = ? AND away_team_code = ?)
      AND date(kickoff) = date(?)
      AND manually_overridden = 0
      AND (result_scorers = '[]' OR result_scorers IS NULL)
  `);

  for (const m of espnMatches) {
    const kickoffDate = m.kickoff?.slice(0, 10);
    if (!kickoffDate) continue;
    updateScore.run(m.status, m.resultHome ?? null, m.resultAway ?? null, m.espnId, m.homeCode, m.awayCode, m.kickoff);
    if (m.scorers?.length) {
      mergeScorers.run(JSON.stringify(m.scorers), m.homeCode, m.awayCode, m.kickoff);
    }
  }
}

async function syncEventData() {
  // ⚠️ PLACEHOLDER: events.js returns null today. When a real source is wired in,
  // this block will populate assisters and MOTM for newly completed matches.
  const newlyCompleted = db.prepare(
    "SELECT * FROM matches WHERE status = 'completed' AND (result_assisters IS NULL OR result_motm IS NULL) AND manually_overridden = 0"
  ).all();

  for (const match of newlyCompleted) {
    const { assisters, motm } = await fetchAssistersAndMotm(match.id, match.home_team_code, match.away_team_code).catch(() => ({ assisters: null, motm: null }));
    if (assisters || motm) {
      db.prepare(
        "UPDATE matches SET result_assisters = ?, result_motm = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(assisters ? JSON.stringify(assisters) : null, motm || null, match.id);
    }
  }
}

let _lastSeeded = 0;

async function poll() {
  try {
    // Seed / refresh openfootball data (hourly is enough — it lags anyway)
    if (Date.now() - _lastSeeded > 60 * 60 * 1000) {
      await seedFromOpenfootball();
      _lastSeeded = Date.now();
    }

    await syncESPN();
    await syncEventData();

    // Re-score and push leaderboard update
    const leaders = scoreAllMatches();
    broadcast('global:leaderboard', leaders);

    console.log(`[poller] poll complete at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[poller] error:', err.message);
  }
}

function startPoller() {
  poll(); // immediate first run
  setInterval(poll, POLL_MS);
  console.log(`[poller] running every ${POLL_MS / 1000}s`);
}

module.exports = { startPoller, poll };
