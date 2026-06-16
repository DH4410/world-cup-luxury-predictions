const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /me — game stats for the current user
router.get('/me', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM users_mirror WHERE id = ?').get(req.user.id);
  res.json(row || { id: req.user.id, username: req.user.username, avatar_initials: req.user.initials, total_points: 0, exact_scores: 0, correct_outcomes: 0 });
});

// GET /me/predictions — { [matchId]: { homeScore, awayScore, scorer, assister, motm } }
router.get('/me/predictions', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM predictions WHERE user_id = ?').all(req.user.id);
  const out = {};
  for (const r of rows) {
    out[r.match_id] = {
      homeScore: r.home_score,
      awayScore: r.away_score,
      scorer: r.scorer,
      assister: r.assister,
      motm: r.motm,
      pointsEarned: r.points_earned,
    };
  }
  res.json(out);
});

// POST /predictions
router.post('/predictions', requireAuth, (req, res) => {
  const { matchId, homeScore, awayScore, scorer = '', assister = '', motm = '' } = req.body;
  if (!matchId) return res.status(400).json({ error: 'matchId required' });

  const match = db.prepare('SELECT kickoff, status FROM matches WHERE id = ?').get(matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  // Lock at kickoff
  if (new Date(match.kickoff) <= new Date()) {
    return res.status(403).json({ error: 'Predictions are locked — match has started' });
  }
  if (match.status === 'completed') {
    return res.status(403).json({ error: 'Predictions are locked — match is complete' });
  }

  db.prepare(`
    INSERT INTO predictions (user_id, match_id, home_score, away_score, scorer, assister, motm, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, match_id) DO UPDATE SET
      home_score = excluded.home_score,
      away_score = excluded.away_score,
      scorer     = excluded.scorer,
      assister   = excluded.assister,
      motm       = excluded.motm,
      updated_at = datetime('now')
  `).run(req.user.id, matchId, homeScore ?? 0, awayScore ?? 0, scorer, assister, motm);

  res.json({ ok: true });
});

module.exports = router;
