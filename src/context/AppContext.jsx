import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, game } from '../lib/api';
import { subscribe } from '../lib/ws';
import { MATCHES as MOCK_MATCHES, TEAMS as MOCK_TEAMS } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);   // { user: { id, username, email, avatar_initials, is_admin } }
  const [profile, setProfile] = useState(null);   // session.user merged with game stats
  const [authLoading, setAuthLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [teams, setTeams] = useState(MOCK_TEAMS);
  const [dataReady, setDataReady] = useState(false);

  // ─── notifications ────────────────────────────────────────
  function notify(message, type = 'success') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }

  // ─── boot: load session + match data ─────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { user } = await auth.me();
        if (cancelled) return;
        const stats = await game.me().catch(() => ({}));
        if (cancelled) return;
        setSession({ user });
        setProfile({ ...user, ...stats });
      } catch {
        // Not logged in — that's fine
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();

    // Load matches from game server (falls back to mock if unreachable)
    (async () => {
      try {
        const m = await game.matches();
        if (!cancelled && m?.length) setMatches(m);
      } catch {
        console.warn('Game server unreachable, using mock match data');
      } finally {
        if (!cancelled) setDataReady(true);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ─── live leaderboard via WebSocket ──────────────────────
  // (rooms subscribe locally in the Rooms/Leaderboard pages)

  // ─── auth ─────────────────────────────────────────────────
  async function signUp(email, password, username) {
    // AppContext historically called signUp(email, password, username) — keep that order
    try {
      const { user } = await auth.signUp(username, email, password);
      const stats = await game.me().catch(() => ({}));
      setSession({ user });
      setProfile({ ...user, ...stats });
      notify('Account created! Welcome.', 'success');
      return true;
    } catch (e) {
      notify(e.message, 'error');
      return false;
    }
  }

  async function signIn(email, password) {
    // 'email' can also be a username — auth server accepts both
    try {
      const { user } = await auth.signIn(email, password);
      const stats = await game.me().catch(() => ({}));
      setSession({ user });
      setProfile({ ...user, ...stats });
      notify('Welcome back!', 'success');
      return true;
    } catch (e) {
      notify(e.message, 'error');
      return false;
    }
  }

  async function signOut() {
    await auth.signOut().catch(() => {});
    setSession(null);
    setProfile(null);
    notify('Signed out.', 'info');
  }

  // ─── predictions ──────────────────────────────────────────
  async function savePrediction(matchId, pred) {
    if (!session) { notify('Sign in to submit predictions.', 'error'); return; }
    try {
      await game.savePrediction(matchId, {
        homeScore: pred.homeScore,
        awayScore: pred.awayScore,
        scorer: pred.scorer || '',
        assister: pred.assister || '',
        motm: pred.motm || '',
      });
      notify('Prediction saved.', 'success');
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  async function getMyPredictions() {
    if (!session) return {};
    return game.myPredictions().catch(() => ({}));
  }

  // ─── rooms ────────────────────────────────────────────────
  async function createRoom(name) {
    if (!session) { notify('Sign in to create rooms.', 'error'); return null; }
    try {
      const room = await game.createRoom(name);
      notify(`Room "${name}" created! Code: ${room.code}`, 'lime');
      return room;
    } catch (e) {
      notify(e.message, 'error');
      return null;
    }
  }

  async function joinRoom(code) {
    if (!session) { notify('Sign in to join rooms.', 'error'); return null; }
    try {
      const room = await game.joinRoom(code);
      notify(`Joined "${room.name}"!`, 'lime');
      return room;
    } catch (e) {
      notify(e.message, 'error');
      return null;
    }
  }

  async function getRooms() {
    if (!session) return [];
    return game.myRooms().catch(() => []);
  }

  async function getRoomPredictions(roomId) {
    return game.roomPredictions(roomId).catch(() => ({ members: [], predictions: {} }));
  }

  // ─── leaderboard ──────────────────────────────────────────
  async function getLeaderboard() {
    return game.leaderboard().catch(() => []);
  }

  // ─── derived/compat fields ────────────────────────────────
  // These keep existing pages working without changes.
  // standings/groupsByLetter are derived client-side from matches (same as before).
  const standings = buildStandings(matches, teams);
  const groupsByLetter = buildGroupsByLetter(matches);

  return (
    <AppContext.Provider value={{
      session, profile, authLoading,
      signUp, signIn, signOut,
      savePrediction, getMyPredictions,
      createRoom, joinRoom, getRooms, getRoomPredictions,
      getLeaderboard,
      notification, notify,
      matches, teams, standings, groupsByLetter, dataReady,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

// ─── helpers (previously in wcApi.js) ─────────────────────

function buildStandings(matches, teams) {
  const teamById = Object.fromEntries(teams.map(t => [t.id, t]));
  const groups = {};

  for (const m of matches) {
    if (m.stageType !== 'group' || m.status !== 'completed' || !m.result) continue;
    const { homeScore, awayScore } = m.result;
    const homeId = m.homeTeam;
    const awayId = m.awayTeam;
    const g = m.group;
    if (!g) continue;

    if (!groups[g]) groups[g] = {};
    if (!groups[g][homeId]) groups[g][homeId] = { team: teamById[homeId] || m.home, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    if (!groups[g][awayId]) groups[g][awayId] = { team: teamById[awayId] || m.away, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };

    const h = groups[g][homeId];
    const a = groups[g][awayId];
    h.mp++; h.gf += homeScore; h.ga += awayScore; h.gd = h.gf - h.ga;
    a.mp++; a.gf += awayScore; a.ga += homeScore; a.gd = a.gf - a.ga;
    if (homeScore > awayScore) { h.w++; h.pts += 3; a.l++; }
    else if (homeScore < awayScore) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; h.pts++; a.d++; a.pts++; }
  }

  const out = {};
  for (const [g, rows] of Object.entries(groups)) {
    out[g] = Object.values(rows).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  }
  return out;
}

function buildGroupsByLetter(matches) {
  const out = {};
  for (const m of matches) {
    if (!m.group) continue;
    if (!out[m.group]) out[m.group] = [];
    if (m.home && !out[m.group].find(t => t.id === m.home.id)) out[m.group].push(m.home);
    if (m.away && !out[m.group].find(t => t.id === m.away.id)) out[m.group].push(m.away);
  }
  return out;
}
