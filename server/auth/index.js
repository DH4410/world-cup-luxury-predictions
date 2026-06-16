require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

if (!process.env.JWT_SECRET) {
  console.error('[wc-auth] FATAL: JWT_SECRET is not set in server/.env');
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/', authRoutes);

app.use((err, req, res, _next) => {
  console.error('[wc-auth] error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.AUTH_PORT || 5420;
app.listen(PORT, () => {
  console.log(`[wc-auth] listening on :${PORT}`);
});
