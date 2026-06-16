import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MATCHES as MOCK_MATCHES, TEAMS as MOCK_TEAMS } from '../data/mockData';
import { fetchMatches, fetchTeams, fetchStandings, fetchGroupsByLetter } from '../lib/wcApi';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [teams, setTeams] = useState(MOCK_TEAMS);
  const [standings, setStandings] = useState(null);
  const [groupsByLetter, setGroupsByLetter] = useState(null);
  const [dataReady, setDataReady] = useState(false);

  // Load live WC 2026 data from worldcup26.ir (fall back silently to mocks on failure)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, t, s, g] = await Promise.all([
          fetchMatches(), fetchTeams(), fetchStandings(), fetchGroupsByLetter(),
        ]);
        if (cancelled) return;
        if (m?.length) setMatches(m);
        if (t?.length) setTeams(t);
        if (s) setStandings(s);
        if (g) setGroupsByLetter(g);
      } catch (e) {
        console.warn('WC API failed, using mock data', e);
      } finally {
        if (!cancelled) setDataReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ─── notifications ────────────────────────────────────────
  function notify(message, type = 'success') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }

  // ─── auth bootstrap ───────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchProfile(data.session.user.id);
      else setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) fetchProfile(s.user.id);
      else { setProfile(null); setAuthLoading(false); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data || null);
    setAuthLoading(false);
  }

  // ─── sign up ──────────────────────────────────────────────
  async function signUp(email, password, username) {
    const initials = username.slice(0, 2).toUpperCase();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { notify(error.message, 'error'); return false; }
    const uid = data.user.id;
    const { error: pErr } = await supabase.from('profiles').insert({
      id: uid, username, avatar_initials: initials,
    });
    if (pErr) { notify(pErr.message, 'error'); return false; }
    notify('Account created! Check your email to confirm, then sign in.', 'success');
    return true;
  }

  // ─── sign in ──────────────────────────────────────────────
  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { notify(error.message, 'error'); return false; }
    notify('Welcome back!', 'success');
    return true;
  }

  // ─── sign out ─────────────────────────────────────────────
  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    notify('Signed out.', 'info');
  }

  // ─── predictions ──────────────────────────────────────────
  async function savePrediction(matchId, pred) {
    if (!session) { notify('Sign in to submit predictions.', 'error'); return; }
    const { error } = await supabase.from('predictions').upsert({
      user_id: session.user.id,
      match_id: matchId,
      home_score: pred.homeScore,
      away_score: pred.awayScore,
      scorer: pred.scorer || '',
      assister: pred.assister || '',
      motm: pred.motm || '',
    }, { onConflict: 'user_id,match_id' });
    if (error) { notify(error.message, 'error'); return; }

    // award points if match already has a result
    const match = matches.find(m => m.id === matchId);
    if (match?.status === 'completed' && match.result) {
      let pts = 0;
      if (pred.homeScore === match.result.homeScore && pred.awayScore === match.result.awayScore) pts += 5;
      else {
        const predDir = Math.sign(pred.homeScore - pred.awayScore);
        const resDir = Math.sign(match.result.homeScore - match.result.awayScore);
        if (predDir === resDir) pts += 2;
      }
      if (pred.scorer && pred.scorer === match.result.scorer) pts += 2;
      if (pred.assister && pred.assister === match.result.assister) pts += 1;
      if (pred.motm && pred.motm === match.result.motm) pts += 1;
      if (pts > 0) {
        await supabase.from('predictions')
          .update({ points_earned: pts })
          .eq('user_id', session.user.id).eq('match_id', matchId);
        await supabase.from('profiles')
          .update({ total_points: (profile?.total_points || 0) + pts })
          .eq('id', session.user.id);
        setProfile(p => p ? { ...p, total_points: (p.total_points || 0) + pts } : p);
        notify(`Locked in! +${pts} pts`, 'lime');
        return;
      }
    }
    notify('Prediction saved.', 'success');
  }

  async function getMyPredictions() {
    if (!session) return {};
    const { data } = await supabase.from('predictions')
      .select('*').eq('user_id', session.user.id);
    if (!data) return {};
    return Object.fromEntries(data.map(p => [p.match_id, {
      homeScore: p.home_score, awayScore: p.away_score,
      scorer: p.scorer, assister: p.assister, motm: p.motm,
    }]));
  }

  // ─── rooms ────────────────────────────────────────────────
  async function createRoom(name) {
    if (!session) { notify('Sign in to create rooms.', 'error'); return null; }
    const code = name.replace(/\s+/g, '').slice(0, 4).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const { data: room, error } = await supabase.from('rooms')
      .insert({ name, code, created_by: session.user.id })
      .select().single();
    if (error) { notify(error.message, 'error'); return null; }
    await supabase.from('room_members').insert({ room_id: room.id, user_id: session.user.id });
    await supabase.from('room_activity').insert({ room_id: room.id, message: `${profile?.username} created this room.` });
    notify(`Room "${name}" created! Code: ${code}`, 'lime');
    return room;
  }

  async function joinRoom(code) {
    if (!session) { notify('Sign in to join rooms.', 'error'); return null; }
    const { data: room, error } = await supabase.from('rooms')
      .select('*').eq('code', code.trim().toUpperCase()).single();
    if (error || !room) { notify('Room not found. Check the code.', 'error'); return null; }
    const { error: mErr } = await supabase.from('room_members')
      .insert({ room_id: room.id, user_id: session.user.id });
    if (mErr && mErr.code !== '23505') { notify(mErr.message, 'error'); return null; }
    await supabase.from('room_activity').insert({ room_id: room.id, message: `${profile?.username} joined the room.` });
    notify(`Joined "${room.name}"!`, 'lime');
    return room;
  }

  async function getRooms() {
    if (!session) return [];
    const { data: memberships } = await supabase.from('room_members')
      .select('room_id').eq('user_id', session.user.id);
    if (!memberships?.length) return [];
    const ids = memberships.map(m => m.room_id);
    const { data: rooms } = await supabase.from('rooms')
      .select('*, room_members(user_id, profiles(*)), room_activity(message, created_at)')
      .in('id', ids)
      .order('created_at', { referencedTable: 'room_activity', ascending: false });
    return rooms || [];
  }

  async function getRoomPredictions(roomId) {
    const { data: members } = await supabase.from('room_members')
      .select('user_id, profiles(*)').eq('room_id', roomId);
    if (!members) return { members: [], predictions: {} };
    const userIds = members.map(m => m.user_id);
    const { data: preds } = await supabase.from('predictions')
      .select('*').in('user_id', userIds);
    const predMap = {};
    for (const p of (preds || [])) {
      if (!predMap[p.user_id]) predMap[p.user_id] = {};
      predMap[p.user_id][p.match_id] = p;
    }
    return { members, predictions: predMap };
  }

  async function getLeaderboard() {
    const { data } = await supabase.from('profiles')
      .select('*').order('total_points', { ascending: false }).limit(50);
    return data || [];
  }

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
