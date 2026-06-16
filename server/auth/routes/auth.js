const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const db = require('../db');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
// COOKIE_SAMESITE controls cross-site behaviour:
//   'lax'  — local dev and production (same-site subdomains). Default.
//   'none' — pre-domain period: client on *.vercel.app, servers on *.trycloudflare.com (cross-site).
//            Requires HTTPS on both ends (Cloudflare Tunnel provides this automatically).
const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();

function makeToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, initials: user.avatar_initials, isAdmin: !!user.is_admin },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function setCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || COOKIE_SAMESITE === 'none',
    sameSite: COOKIE_SAMESITE,
    domain: COOKIE_DOMAIN,
    maxAge: MAX_AGE_MS,
  });
}

// POST /signup
router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username?.trim() || !password) return res.status(400).json({ error: 'username and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
    if (existing) return res.status(409).json({ error: 'Username already taken' });

    const id = randomUUID();
    const initials = username.trim().slice(0, 2).toUpperCase();
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    db.prepare(
      'INSERT INTO users (id, username, email, password_hash, avatar_initials) VALUES (?, ?, ?, ?, ?)'
    ).run(id, username.trim(), email?.trim() || null, hash, initials);

    const user = db.prepare('SELECT id, username, email, avatar_initials, is_admin FROM users WHERE id = ?').get(id);
    setCookie(res, makeToken(user));
    res.status(201).json({ user: { ...user, is_admin: !!user.is_admin } });
  } catch (e) { next(e); }
});

// POST /login
router.post('/login', async (req, res, next) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ error: 'login and password required' });

    const user = db.prepare(
      'SELECT * FROM users WHERE username = ? OR email = ?'
    ).get(login.trim(), login.trim());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    setCookie(res, makeToken(user));
    const { password_hash: _, ...safe } = user;
    res.json({ user: { ...safe, is_admin: !!safe.is_admin } });
  } catch (e) { next(e); }
});

// POST /logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { domain: COOKIE_DOMAIN });
  res.json({ ok: true });
});

// GET /me
router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare(
      'SELECT id, username, email, avatar_initials, is_admin FROM users WHERE id = ?'
    ).get(payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: { ...user, is_admin: !!user.is_admin } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /dev/reset-password — admin only, checked by ADMIN_PASSWORD
router.post('/dev/reset-password', async (req, res, next) => {
  try {
    const { adminPassword, userId, newPassword } = req.body;
    if (adminPassword !== process.env.ADMIN_PASSWORD) return res.status(403).json({ error: 'Forbidden' });
    if (!userId || !newPassword || newPassword.length < 6) return res.status(400).json({ error: 'userId and newPassword (min 6 chars) required' });
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const result = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// GET /dev/users — admin only
router.get('/dev/users', (req, res) => {
  const { adminPassword } = req.query;
  if (adminPassword !== process.env.ADMIN_PASSWORD) return res.status(403).json({ error: 'Forbidden' });
  const users = db.prepare('SELECT id, username, email, avatar_initials, is_admin, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

module.exports = router;
