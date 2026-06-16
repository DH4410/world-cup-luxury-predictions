import { useState, useEffect } from 'react';
import { game } from '../lib/api';
import { Shield, RefreshCw, Save, LogOut, Users, Cpu } from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────

function fmtKickoff(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }) {
  const map = {
    upcoming: { bg: '#f5f1e8', col: '#7a6520' },
    live: { bg: '#e8f5e9', col: '#2e7d32' },
    completed: { bg: '#ede7f6', col: '#4527a0' },
  };
  const s = map[status] || map.upcoming;
  return (
    <span style={{ background: s.bg, color: s.col, padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {status}
    </span>
  );
}

// ─── Result entry panel ────────────────────────────────────

function ResultEntry({ match, onSaved }) {
  const [open, setOpen] = useState(false);
  const [homeScore, setHomeScore] = useState(match.result_home ?? 0);
  const [awayScore, setAwayScore] = useState(match.result_away ?? 0);
  const [scorers, setScorers] = useState((match.result_scorers ? JSON.parse(match.result_scorers) : []).join(', '));
  const [assisters, setAssistersRaw] = useState((match.result_assisters ? JSON.parse(match.result_assisters) : []).join(', '));
  const [motm, setMotm] = useState(match.result_motm || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSave() {
    setSaving(true);
    setMsg('');
    try {
      await game.devSetResult(match.id, {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        scorers: scorers.split(',').map(s => s.trim()).filter(Boolean),
        assisters: assisters ? assisters.split(',').map(s => s.trim()).filter(Boolean) : null,
        motm: motm.trim() || null,
      });
      setMsg('Saved & rescored.');
      onSaved?.();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  const inp = { border: '1.5px solid #ddd', borderRadius: 6, padding: '0.45rem 0.7rem', fontFamily: 'Inter', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ borderBottom: '1px solid #eee' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.88rem' }}>
          {match.home_team_name || '?'} vs {match.away_team_name || '?'}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#666' }}>{fmtKickoff(match.kickoff)}</span>
        <StatusBadge status={match.status} />
        {match.manually_overridden ? <span style={{ color: '#1565c0', fontSize: '0.72rem', fontWeight: 700 }}>MANUAL</span> : <span />}
      </button>

      {open && (
        <div style={{ padding: '0.85rem 1.25rem 1.25rem', background: '#fafafa', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <label style={{ fontFamily: 'Inter', fontSize: '0.78rem', fontWeight: 700, color: '#555' }}>
            {match.home_team_name || 'Home'} score
            <input type="number" min={0} max={30} value={homeScore} onChange={e => setHomeScore(e.target.value)} style={{ ...inp, marginTop: 4 }} />
          </label>
          <label style={{ fontFamily: 'Inter', fontSize: '0.78rem', fontWeight: 700, color: '#555' }}>
            {match.away_team_name || 'Away'} score
            <input type="number" min={0} max={30} value={awayScore} onChange={e => setAwayScore(e.target.value)} style={{ ...inp, marginTop: 4 }} />
          </label>
          <label style={{ fontFamily: 'Inter', fontSize: '0.78rem', fontWeight: 700, color: '#555' }}>
            Goalscorers (comma-separated)
            <input type="text" value={scorers} onChange={e => setScorers(e.target.value)} placeholder="Messi, Kane" style={{ ...inp, marginTop: 4 }} />
          </label>
          <label style={{ fontFamily: 'Inter', fontSize: '0.78rem', fontWeight: 700, color: '#555' }}>
            Assisters (comma-sep) <span style={{ fontWeight: 400, color: '#aaa' }}>⚠ placeholder</span>
            <input type="text" value={assisters} onChange={e => setAssistersRaw(e.target.value)} placeholder="Pedri, Bellingham" style={{ ...inp, marginTop: 4 }} />
          </label>
          <label style={{ fontFamily: 'Inter', fontSize: '0.78rem', fontWeight: 700, color: '#555' }}>
            Man of the Match <span style={{ fontWeight: 400, color: '#aaa' }}>⚠ placeholder</span>
            <input type="text" value={motm} onChange={e => setMotm(e.target.value)} placeholder="Lamine Yamal" style={{ ...inp, marginTop: 4 }} />
          </label>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: 2 }}>
            <button onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#14201A', color: '#F5F8EC', border: 'none', borderRadius: 7, padding: '0.55rem 1.1rem', fontFamily: 'Inter', fontWeight: 700, fontSize: '0.82rem', cursor: saving ? 'wait' : 'pointer' }}>
              <Save size={13} strokeWidth={2.5} /> {saving ? 'Saving…' : 'Save result'}
            </button>
            {msg && <span style={{ fontFamily: 'Inter', fontSize: '0.78rem', color: msg.startsWith('Error') ? '#c62828' : '#2e7d32' }}>{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dev page ─────────────────────────────────────────

export default function Dev() {
  const [admin, setAdmin] = useState(null); // null=checking, false=not authed, true=authed
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('matches');
  const [actionMsg, setActionMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    game.devCheck().then(r => setAdmin(r.admin)).catch(() => setAdmin(false));
  }, []);

  async function loadData() {
    const [m, u] = await Promise.all([game.devMatches().catch(() => []), game.devUsers().catch(() => [])]);
    setMatches(m);
    setUsers(u);
  }

  useEffect(() => {
    if (admin) loadData();
  }, [admin]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginErr('');
    try {
      await game.devLogin(password);
      setAdmin(true);
    } catch (err) {
      setLoginErr(err.message);
    }
  }

  async function handleLogout() {
    await game.devLogout().catch(() => {});
    setAdmin(false);
  }

  async function handleRescore() {
    setLoading(true); setActionMsg('');
    try { await game.devRescore(); setActionMsg('Rescored successfully.'); await loadData(); }
    catch (e) { setActionMsg(`Error: ${e.message}`); }
    finally { setLoading(false); }
  }

  async function handlePoll() {
    setLoading(true); setActionMsg('');
    try { await game.devPoll(); setActionMsg('Poll triggered — data refreshed from APIs.'); await loadData(); }
    catch (e) { setActionMsg(`Error: ${e.message}`); }
    finally { setLoading(false); }
  }

  const card = { background: '#fff', border: '1.5px solid #e8e8e5', borderRadius: 12, overflow: 'hidden' };
  const tabBtn = (t) => ({
    padding: '0.55rem 1.1rem', border: 'none', borderBottom: tab === t ? '2.5px solid #14201A' : '2.5px solid transparent',
    background: 'none', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 700, fontSize: '0.82rem',
    color: tab === t ? '#14201A' : '#888',
  });

  // ─── Loading check ─────────────────────────────────────
  if (admin === null) {
    return <main style={{ maxWidth: 900, margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'Inter', color: '#888' }}>Checking admin session…</main>;
  }

  // ─── Login form ────────────────────────────────────────
  if (!admin) {
    return (
      <main style={{ maxWidth: 400, margin: '6rem auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <Shield size={22} color="#14201A" strokeWidth={2} />
          <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>Admin Login</h1>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin password" autoFocus
            style={{ border: '1.5px solid #ddd', borderRadius: 8, padding: '0.75rem 1rem', fontFamily: 'Inter', fontSize: '0.95rem' }} />
          {loginErr && <p style={{ fontFamily: 'Inter', fontSize: '0.82rem', color: '#c62828', margin: 0 }}>{loginErr}</p>}
          <button type="submit" style={{ background: '#14201A', color: '#F5F8EC', border: 'none', borderRadius: 8, padding: '0.75rem', fontFamily: 'Inter', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer' }}>
            Sign in
          </button>
        </form>
      </main>
    );
  }

  // ─── Admin panel ───────────────────────────────────────
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={20} color="#14201A" strokeWidth={2} />
          <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>Admin Panel</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handlePoll} disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.5rem 1rem', background: '#e8f5e9', border: '1.5px solid #2e7d32', borderRadius: 7, fontFamily: 'Inter', fontWeight: 700, fontSize: '0.8rem', color: '#2e7d32', cursor: 'pointer' }}>
            <Cpu size={13} strokeWidth={2.5} /> Force poll
          </button>
          <button onClick={handleRescore} disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.5rem 1rem', background: '#e3f2fd', border: '1.5px solid #1565c0', borderRadius: 7, fontFamily: 'Inter', fontWeight: 700, fontSize: '0.8rem', color: '#1565c0', cursor: 'pointer' }}>
            <RefreshCw size={13} strokeWidth={2.5} /> Rescore all
          </button>
          <button onClick={handleLogout}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.5rem 1rem', background: '#fbe9e7', border: '1.5px solid #b71c1c', borderRadius: 7, fontFamily: 'Inter', fontWeight: 700, fontSize: '0.8rem', color: '#b71c1c', cursor: 'pointer' }}>
            <LogOut size={13} strokeWidth={2.5} /> Log out
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ padding: '0.65rem 1rem', background: actionMsg.startsWith('Error') ? '#ffebee' : '#e8f5e9', border: `1.5px solid ${actionMsg.startsWith('Error') ? '#ef9a9a' : '#a5d6a7'}`, borderRadius: 8, fontFamily: 'Inter', fontSize: '0.85rem', color: actionMsg.startsWith('Error') ? '#c62828' : '#2e7d32', marginBottom: '1rem' }}>
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '1.25rem' }}>
        <button style={tabBtn('matches')} onClick={() => setTab('matches')}>Match Results ({matches.length})</button>
        <button style={tabBtn('users')} onClick={() => setTab('users')}>Users ({users.length})</button>
      </div>

      {/* Matches tab */}
      {tab === 'matches' && (
        <div style={card}>
          <div style={{ padding: '0.75rem 1.25rem', background: '#f5f5f3', borderBottom: '1px solid #eee', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem' }}>
            {['Match', 'Kickoff', 'Status', 'Source'].map(h => (
              <span key={h} style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
            ))}
          </div>
          {matches.length === 0 ? (
            <p style={{ padding: '2rem', fontFamily: 'Inter', color: '#aaa', textAlign: 'center' }}>No matches in DB yet — trigger a poll first.</p>
          ) : matches.map(m => (
            <ResultEntry key={m.id} match={m} onSaved={loadData} />
          ))}
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div style={card}>
          <div style={{ padding: '0.75rem 1.25rem', background: '#f5f5f3', borderBottom: '1px solid #eee', display: 'grid', gridTemplateColumns: '1fr 6rem 6rem 6rem', gap: '1rem' }}>
            {['Username', 'Points', 'Exact', 'Outcomes'].map(h => (
              <span key={h} style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: h === 'Username' ? 'left' : 'right' }}>{h}</span>
            ))}
          </div>
          {users.length === 0 ? (
            <p style={{ padding: '2rem', fontFamily: 'Inter', color: '#aaa', textAlign: 'center' }}>No users yet.</p>
          ) : users.map(u => (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 6rem 6rem 6rem', gap: '1rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #eee', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#14201A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: '0.7rem', color: '#9BCA35', flexShrink: 0 }}>{u.avatar_initials}</div>
                <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.88rem' }}>{u.username}</span>
              </div>
              <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '0.95rem', textAlign: 'right' }}>{u.total_points}</span>
              <span style={{ fontFamily: 'Inter', fontSize: '0.88rem', textAlign: 'right', color: '#555' }}>{u.exact_scores}</span>
              <span style={{ fontFamily: 'Inter', fontSize: '0.88rem', textAlign: 'right', color: '#555' }}>{u.correct_outcomes}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontFamily: 'Inter', fontSize: '0.72rem', color: '#bbb', marginTop: '2rem', lineHeight: 1.5 }}>
        ⚠️ Assisters and MOTM fields are placeholders — no free API provides this data yet.
        Enter manually above or wire in a paid source via <code>server/game/sources/events.js</code>.
      </p>
    </main>
  );
}
