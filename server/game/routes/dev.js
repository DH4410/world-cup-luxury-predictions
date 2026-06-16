/**
 * /dev/api — password-gated admin endpoints.
 * Protected by ADMIN_PASSWORD env var (checked on every request via admin_token cookie or body).
 *
 * Routes:
 *   POST   /dev/api/login            — exchange ADMIN_PASSWORD for admin_token cookie
 *   POST   /dev/api/logout           — clear admin_token cookie
 *   GET    /dev/api/matches          — all matches (for result entry)
 *   PUT    /dev/api/matches/:id/result — set/override a match result
 *   POST   /dev/api/rescore          — recompute all points + regenerate leaderboard
 *   POST   /dev/api/poll             — trigger a manual data poll right now
 *   GET    /dev/api/users            — list users in mirror
 */

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { scoreAllMatches } = require('../scoring');
const { poll } = require('../sources/poller');

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();

function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ error: 'Admin login required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.isAdmin) throw new Error();
    next();
  } catch {
    res.status(401).json({ error: 'Invalid admin session' });
  }
}

// POST /dev/api/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Wrong password' });
  }
  const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || COOKIE_SAMESITE === 'none',
    sameSite: COOKIE_SAMESITE,
    domain: COOKIE_DOMAIN,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

// POST /dev/api/logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', { domain: COOKIE_DOMAIN });
  res.json({ ok: true });
});

// GET /dev/api/matches
router.get('/matches', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM matches ORDER BY kickoff ASC').all();
  res.json(rows);
});

// PUT /dev/api/matches/:id/result
router.put('/matches/:id/result', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { homeScore, awayScore, scorers, assisters, motm } = req.body;

  const match = db.prepare('SELECT id FROM matches WHERE id = ?').get(id);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  db.prepare(`
    UPDATE matches SET
      status              = 'completed',
      result_home         = ?,
      result_away         = ?,
      result_scorers      = ?,
      result_assisters    = ?,
      result_motm         = ?,
      manually_overridden = 1,
      source              = 'manual',
      updated_at          = datetime('now')
    WHERE id = ?
  `).run(
    homeScore ?? 0,
    awayScore ?? 0,
    JSON.stringify(Array.isArray(scorers) ? scorers : []),
    assisters ? JSON.stringify(assisters) : null,
    motm || null,
    id
  );

  const leaders = scoreAllMatches();
  res.json({ ok: true, leaderboard: leaders });
});

// POST /dev/api/rescore
router.post('/rescore', requireAdmin, (req, res) => {
  const leaders = scoreAllMatches();
  res.json({ ok: true, leaderboard: leaders });
});

// POST /dev/api/poll — trigger a manual data pull right now
router.post('/poll', requireAdmin, async (req, res, next) => {
  try {
    await poll();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// GET /dev/api/users
router.get('/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT * FROM users_mirror ORDER BY total_points DESC').all();
  res.json(users);
});

// GET /dev/api/check — tells client whether admin cookie is valid
router.get('/check', (req, res) => {
  const token = req.cookies?.admin_token;
  if (!token) return res.json({ admin: false });
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ admin: !!p.isAdmin });
  } catch {
    res.json({ admin: false });
  }
});

module.exports = router;
