const router = require('express').Router();
const fs = require('fs');
const { LB_FILE } = require('../scoring');

// GET /leaderboard — served from the pre-generated JSON snapshot (fast, no DB query on each hit)
router.get('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(LB_FILE, 'utf8'));
    res.json(data);
  } catch {
    res.json([]);
  }
});

module.exports = router;
