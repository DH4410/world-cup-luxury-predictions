/**
 * Idempotent scoring engine.
 * Call scoreAllMatches() at any time — it recomputes from scratch, no double-counting.
 *
 * Points:
 *   +5  exact scoreline
 *   +2  correct outcome (W/D/L) when not exact
 *   +2  goalscorer in result scorers list
 *   +1  assister in result assisters list  ← PLACEHOLDER until assisters data is available
 *   +1  man of the match                   ← PLACEHOLDER until MOTM data is available
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');
const { broadcast } = require('./ws');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const LB_FILE = path.join(DATA_DIR, 'leaderboard.json');

function scoreMatch(matchId) {
  const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(matchId);
  if (!match || match.status !== 'completed') return;

  const resultHome = match.result_home;
  const resultAway = match.result_away;
  const scorers = JSON.parse(match.result_scorers || '[]');
  const assisters = match.result_assisters ? JSON.parse(match.result_assisters) : null;
  const motm = match.result_motm || null;

  const preds = db.prepare('SELECT * FROM predictions WHERE match_id = ?').all(matchId);
  const update = db.prepare('UPDATE predictions SET points_earned = ? WHERE user_id = ? AND match_id = ?');

  for (const pred of preds) {
    let pts = 0;

    if (pred.home_score === resultHome && pred.away_score === resultAway) {
      pts += 5;
    } else {
      const predDir = Math.sign(pred.home_score - pred.away_score);
      const resDir = Math.sign(resultHome - resultAway);
      if (predDir === resDir) pts += 2;
    }

    if (pred.scorer && scorers.includes(pred.scorer)) pts += 2;
    if (assisters && pred.assister && assisters.includes(pred.assister)) pts += 1;
    if (motm && pred.motm && pred.motm === motm) pts += 1;

    update.run(pts, pred.user_id, matchId);
  }
}

function recomputeUserTotals() {
  const completedMatches = db.prepare("SELECT * FROM matches WHERE status = 'completed'").all();
  const matchById = Object.fromEntries(completedMatches.map(m => [m.id, m]));

  const users = db.prepare('SELECT id FROM users_mirror').all();

  const updateUser = db.prepare(
    "UPDATE users_mirror SET total_points = ?, exact_scores = ?, correct_outcomes = ?, updated_at = datetime('now') WHERE id = ?"
  );

  for (const u of users) {
    const preds = db.prepare(
      'SELECT p.* FROM predictions p WHERE p.user_id = ?'
    ).all(u.id);

    let total = 0, exact = 0, outcomes = 0;

    for (const pred of preds) {
      const match = matchById[pred.match_id];
      if (!match) continue;
      total += pred.points_earned;
      const exactHit = pred.home_score === match.result_home && pred.away_score === match.result_away;
      if (exactHit) {
        exact++;
        outcomes++;
      } else {
        const predDir = Math.sign(pred.home_score - pred.away_score);
        const resDir = Math.sign(match.result_home - match.result_away);
        if (predDir === resDir) outcomes++;
      }
    }

    updateUser.run(total, exact, outcomes, u.id);
  }
}

function regenerateLeaderboard() {
  const rows = db.prepare(
    'SELECT id, username, avatar_initials, total_points, exact_scores, correct_outcomes FROM users_mirror ORDER BY total_points DESC, exact_scores DESC LIMIT 100'
  ).all();
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LB_FILE, JSON.stringify(rows, null, 2));
  return rows;
}

function scoreAllMatches() {
  const completed = db.prepare("SELECT id FROM matches WHERE status = 'completed'").all();
  for (const m of completed) scoreMatch(m.id);
  recomputeUserTotals();
  const leaders = regenerateLeaderboard();
  broadcast('global:leaderboard', leaders);
  return leaders;
}

module.exports = { scoreMatch, scoreAllMatches, regenerateLeaderboard, LB_FILE };
