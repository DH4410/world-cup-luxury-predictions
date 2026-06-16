require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ws = require('./ws');
const { startPoller } = require('./sources/poller');

if (!process.env.JWT_SECRET) {
  console.error('[wc-game] FATAL: JWT_SECRET is not set in server/.env');
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/matches', require('./routes/matches'));
app.use('/teams',   require('./routes/matches')); // /teams is served from same file
app.use('/',        require('./routes/predictions')); // /me, /me/predictions, /predictions
app.use('/rooms',   require('./routes/rooms'));
app.use('/leaderboard', require('./routes/leaderboard'));
app.use('/dev/api', require('./routes/dev'));

app.use((err, req, res, _next) => {
  console.error('[wc-game] error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.GAME_PORT || 5421;
const server = http.createServer(app);

ws.setup(server);
startPoller();

server.listen(PORT, () => {
  console.log(`[wc-game] listening on :${PORT} (HTTP + WS)`);
});
