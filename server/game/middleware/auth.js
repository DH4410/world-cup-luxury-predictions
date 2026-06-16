const jwt = require('jsonwebtoken');
const db = require('../db');

const upsertMirror = db.prepare(`
  INSERT INTO users_mirror (id, username, avatar_initials)
  VALUES (?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    username        = excluded.username,
    avatar_initials = excluded.avatar_initials
`);

function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      username: payload.username,
      initials: payload.initials,
      isAdmin: !!payload.isAdmin,
    };
    // Keep local mirror in sync (preserves point totals)
    upsertMirror.run(req.user.id, req.user.username, req.user.initials);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { requireAuth };
