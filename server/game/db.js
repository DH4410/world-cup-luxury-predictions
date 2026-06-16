// Uses node:sqlite — built into Node 22+, no native compilation needed.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'game.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    code         TEXT,
    iso2         TEXT,
    flag         TEXT,
    group_letter TEXT
  );

  CREATE TABLE IF NOT EXISTS matches (
    id                  TEXT PRIMARY KEY,
    home_team_id        TEXT,
    away_team_id        TEXT,
    home_team_name      TEXT,
    away_team_name      TEXT,
    home_team_code      TEXT,
    away_team_code      TEXT,
    home_flag           TEXT,
    away_flag           TEXT,
    stage               TEXT,
    stage_type          TEXT,
    group_letter        TEXT,
    matchday            INTEGER,
    stadium             TEXT,
    city                TEXT,
    kickoff             TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'upcoming',
    result_home         INTEGER,
    result_away         INTEGER,
    result_scorers      TEXT NOT NULL DEFAULT '[]',
    result_assisters    TEXT DEFAULT NULL,
    result_motm         TEXT DEFAULT NULL,
    espn_event_id       TEXT,
    source              TEXT,
    manually_overridden INTEGER NOT NULL DEFAULT 0,
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users_mirror (
    id               TEXT PRIMARY KEY,
    username         TEXT NOT NULL,
    avatar_initials  TEXT NOT NULL,
    total_points     INTEGER NOT NULL DEFAULT 0,
    exact_scores     INTEGER NOT NULL DEFAULT 0,
    correct_outcomes INTEGER NOT NULL DEFAULT 0,
    updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS predictions (
    user_id       TEXT NOT NULL,
    match_id      TEXT NOT NULL,
    home_score    INTEGER NOT NULL DEFAULT 0,
    away_score    INTEGER NOT NULL DEFAULT 0,
    scorer        TEXT NOT NULL DEFAULT '',
    assister      TEXT NOT NULL DEFAULT '',
    motm          TEXT NOT NULL DEFAULT '',
    points_earned INTEGER NOT NULL DEFAULT 0,
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, match_id)
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    code       TEXT UNIQUE NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS room_members (
    room_id   TEXT NOT NULL,
    user_id   TEXT NOT NULL,
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (room_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS room_activity (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id    TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
