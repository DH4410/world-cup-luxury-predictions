const router = require('express').Router();
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { broadcast } = require('../ws');

function makeCode(name) {
  const prefix = name.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

function roomWithMembersAndActivity(roomId) {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
  if (!room) return null;

  const members = db.prepare(`
    SELECT rm.user_id, rm.joined_at,
           um.username, um.avatar_initials, um.total_points, um.exact_scores, um.correct_outcomes
    FROM room_members rm
    LEFT JOIN users_mirror um ON rm.user_id = um.id
    WHERE rm.room_id = ?
    ORDER BY um.total_points DESC
  `).all(roomId);

  const activity = db.prepare(
    'SELECT message, created_at FROM room_activity WHERE room_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(roomId);

  return {
    ...room,
    room_members: members.map(m => ({
      user_id: m.user_id,
      joined_at: m.joined_at,
      profiles: {
        id: m.user_id,
        username: m.username || '?',
        avatar_initials: m.avatar_initials || '?',
        total_points: m.total_points || 0,
        exact_scores: m.exact_scores || 0,
        correct_outcomes: m.correct_outcomes || 0,
      },
    })),
    room_activity: activity,
  };
}

// GET /rooms
router.get('/', requireAuth, (req, res) => {
  const memberships = db.prepare('SELECT room_id FROM room_members WHERE user_id = ?').all(req.user.id);
  const rooms = memberships.map(m => roomWithMembersAndActivity(m.room_id)).filter(Boolean);
  res.json(rooms);
});

// POST /rooms — create
router.post('/', requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name required' });

  const id = randomUUID();
  const code = makeCode(name.trim());

  db.prepare('INSERT INTO rooms (id, name, code, created_by) VALUES (?, ?, ?, ?)').run(id, name.trim(), code, req.user.id);
  db.prepare('INSERT INTO room_members (room_id, user_id) VALUES (?, ?)').run(id, req.user.id);
  db.prepare('INSERT INTO room_activity (room_id, message) VALUES (?, ?)').run(id, `${req.user.username} created this room.`);

  const room = roomWithMembersAndActivity(id);
  broadcast(`room:${id}`, { type: 'activity', room });
  res.status(201).json(room);
});

// POST /rooms/join
router.post('/join', requireAuth, (req, res) => {
  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ error: 'code required' });

  const room = db.prepare('SELECT * FROM rooms WHERE code = ?').get(code.trim().toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found. Check the code.' });

  const already = db.prepare('SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?').get(room.id, req.user.id);
  if (!already) {
    db.prepare('INSERT INTO room_members (room_id, user_id) VALUES (?, ?)').run(room.id, req.user.id);
    db.prepare('INSERT INTO room_activity (room_id, message) VALUES (?, ?)').run(room.id, `${req.user.username} joined the room.`);
  }

  const full = roomWithMembersAndActivity(room.id);
  broadcast(`room:${room.id}`, { type: 'activity', room: full });
  res.json(full);
});

// GET /rooms/:id/predictions
router.get('/:id/predictions', requireAuth, (req, res) => {
  const roomId = req.params.id;

  // Verify user is a member
  const member = db.prepare('SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?').get(roomId, req.user.id);
  if (!member) return res.status(403).json({ error: 'Not a room member' });

  const members = db.prepare(`
    SELECT rm.user_id, um.username, um.avatar_initials, um.total_points
    FROM room_members rm
    LEFT JOIN users_mirror um ON rm.user_id = um.id
    WHERE rm.room_id = ?
  `).all(roomId);

  const userIds = members.map(m => m.user_id);
  if (!userIds.length) return res.json({ members: [], predictions: {} });

  const placeholders = userIds.map(() => '?').join(',');
  const preds = db.prepare(
    `SELECT * FROM predictions WHERE user_id IN (${placeholders})`
  ).all(...userIds);

  const predMap = {};
  for (const p of preds) {
    if (!predMap[p.user_id]) predMap[p.user_id] = {};
    predMap[p.user_id][p.match_id] = p;
  }

  res.json({
    members: members.map(m => ({
      user_id: m.user_id,
      profiles: {
        id: m.user_id,
        username: m.username || '?',
        avatar_initials: m.avatar_initials || '?',
        total_points: m.total_points || 0,
      },
    })),
    predictions: predMap,
  });
});

module.exports = router;
