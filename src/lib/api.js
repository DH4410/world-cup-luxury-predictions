const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:5420';
const GAME_URL = import.meta.env.VITE_GAME_URL || 'http://localhost:5421';

async function request(base, path, options = {}) {
  const { body, ...rest } = options;
  const res = await fetch(`${base}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...rest,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

const a = (path, opts) => request(AUTH_URL, path, opts);
const g = (path, opts) => request(GAME_URL, path, opts);

export const auth = {
  me:     ()                         => a('/me'),
  signUp: (username, email, password) => a('/signup', { method: 'POST', body: { username, email, password } }),
  signIn: (login, password)           => a('/login',  { method: 'POST', body: { login, password } }),
  signOut: ()                         => a('/logout',  { method: 'POST' }),
};

export const game = {
  matches:         ()                              => g('/matches'),
  me:              ()                              => g('/me'),
  myPredictions:   ()                              => g('/me/predictions'),
  savePrediction:  (matchId, pred)                 => g('/predictions', { method: 'POST', body: { matchId, ...pred } }),
  leaderboard:     ()                              => g('/leaderboard'),
  createRoom:      (name)                          => g('/rooms',      { method: 'POST', body: { name } }),
  joinRoom:        (code)                          => g('/rooms/join', { method: 'POST', body: { code } }),
  myRooms:         ()                              => g('/rooms'),
  roomPredictions: (roomId)                        => g(`/rooms/${roomId}/predictions`),

  // Admin (/dev)
  devCheck:      ()                                 => g('/dev/api/check'),
  devLogin:      (password)                         => g('/dev/api/login',  { method: 'POST', body: { password } }),
  devLogout:     ()                                 => g('/dev/api/logout', { method: 'POST' }),
  devMatches:    ()                                 => g('/dev/api/matches'),
  devUsers:      ()                                 => g('/dev/api/users'),
  devSetResult:  (matchId, result)                  => g(`/dev/api/matches/${matchId}/result`, { method: 'PUT', body: result }),
  devRescore:    ()                                 => g('/dev/api/rescore', { method: 'POST' }),
  devPoll:       ()                                 => g('/dev/api/poll',    { method: 'POST' }),

  // Auth-server admin (password reset)
  devResetPassword: (userId, adminPassword, newPassword) =>
    request(AUTH_URL, '/dev/reset-password', { method: 'POST', body: { adminPassword, userId, newPassword } }),
};

export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5421';
