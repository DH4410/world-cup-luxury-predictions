import { useState, useEffect, useCallback } from 'react';
import { Plus, Hash, Users, ArrowRight, Eye, EyeOff, ChevronLeft, Activity, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS, MATCHES } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }
function getMatch(id) { return MATCHES.find(m => m.id === id); }

function fmtTime(ts) {
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
}

function RoomDetail({ room, onBack }) {
  const { session, profile, getRoomPredictions } = useApp();
  const [data, setData] = useState({ members: [], predictions: {} });
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const FEATURED_MATCH_ID = 'm1';
  const match = getMatch(FEATURED_MATCH_ID);
  const home = match ? getTeam(match.homeTeam) : null;
  const away = match ? getTeam(match.awayTeam) : null;

  useEffect(() => {
    getRoomPredictions(room.id).then(setData);
  }, [room.id]);

  function copyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sortedMembers = [...data.members].sort((a, b) =>
    (b.profiles?.total_points || 0) - (a.profiles?.total_points || 0)
  );

  const activity = room.room_activity || [];

  return (
    <div>
      {/* Header */}
      <div className="bg-ink-900 border-b-2 border-lime-500 p-6 lg:p-10 mb-8">
        <button onClick={onBack} className="label-caps text-ink-400 hover:text-lime-500 flex items-center gap-1.5 mb-5 transition-colors">
          <ChevronLeft size={13} strokeWidth={3} /> All Rooms
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="label-caps text-lime-500 mb-1">Private Room</p>
            <h1 className="heading-display text-4xl lg:text-6xl text-white">{room.name}</h1>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border-2 border-white/20 px-4 py-2 self-start">
            <span className="font-mono font-bold text-white tracking-widest">{room.code}</span>
            <button onClick={copyCode} className="text-ink-400 hover:text-lime-500 transition-colors ml-1">
              {copied ? <Check size={14} strokeWidth={2.5} className="text-lime-500" /> : <Copy size={14} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Standings */}
        <div>
          <div className="card overflow-hidden">
            <div className="bg-ink-900 px-5 py-3">
              <p className="label-caps text-lime-500">Standings</p>
            </div>
            {sortedMembers.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-sans text-sm text-ink-400">Loading members…</p>
              </div>
            ) : sortedMembers.map((m, i) => {
              const p = m.profiles;
              const isSelf = m.user_id === session?.user?.id;
              return (
                <div key={m.user_id} className={`flex items-center justify-between px-5 py-3.5 border-b-2 border-surface-200 last:border-0 ${isSelf ? 'bg-lime-500/10' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`heading-display text-xl w-6 text-center ${i === 0 ? 'text-lime-500' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'text-ink-400'}`}>
                      {i + 1}
                    </span>
                    <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold font-sans ${isSelf ? 'bg-lime-500 text-ink-900' : 'bg-ink-900 text-white'}`}>
                      {p?.avatar_initials || '??'}
                    </div>
                    <span className={`font-sans text-sm font-bold ${isSelf ? 'text-ink-900' : 'text-ink-800'}`}>
                      {p?.username || 'Unknown'} {isSelf && <span className="font-normal text-ink-400">(you)</span>}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-sans font-bold text-sm text-ink-900">{p?.total_points || 0}</p>
                    <p className="label-caps text-ink-400">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictions + Activity */}
        <div className="lg:col-span-2 space-y-5">
          {/* Prediction comparison */}
          <div className="card overflow-hidden">
            <div className="bg-ink-900 px-5 py-3 flex items-center justify-between">
              <p className="label-caps text-lime-500">
                Predictions — {home?.name} vs {away?.name}
              </p>
              <button
                onClick={() => setRevealed(v => !v)}
                className="flex items-center gap-1.5 label-caps text-ink-400 hover:text-lime-500 transition-colors"
              >
                {revealed ? <EyeOff size={12} strokeWidth={2.5} /> : <Eye size={12} strokeWidth={2.5} />}
                {revealed ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <div className="divide-y-2 divide-surface-200">
              {sortedMembers.length === 0 && (
                <div className="p-6 text-center font-sans text-sm text-ink-400">Loading…</div>
              )}
              {sortedMembers.map(m => {
                const p = m.profiles;
                const pred = data.predictions[m.user_id]?.[FEATURED_MATCH_ID];
                const isSelf = m.user_id === session?.user?.id;
                return (
                  <div key={m.user_id} className={`flex items-center justify-between px-5 py-3.5 ${isSelf ? 'bg-lime-500/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold font-sans ${isSelf ? 'bg-lime-500 text-ink-900' : 'bg-ink-900 text-white'}`}>
                        {p?.avatar_initials || '??'}
                      </div>
                      <span className="font-sans text-sm font-medium text-ink-800">{p?.username || 'Unknown'}</span>
                    </div>
                    {pred ? (
                      revealed ? (
                        <div className="flex items-center gap-4">
                          <span className="heading-display text-2xl text-ink-900">{pred.home_score}–{pred.away_score}</span>
                          {pred.scorer && <span className="font-sans text-xs font-medium text-ink-500">⚽ {pred.scorer}</span>}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-10 bg-ink-900/20" />
                          <div className="h-4 w-16 bg-ink-900/10" />
                        </div>
                      )
                    ) : (
                      <span className="label-caps text-ink-300">Not yet</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity */}
          <div className="card overflow-hidden">
            <div className="bg-ink-900 px-5 py-3 flex items-center gap-2">
              <Activity size={13} strokeWidth={2.5} className="text-lime-500" />
              <p className="label-caps text-lime-500">Activity</p>
            </div>
            {activity.length === 0 ? (
              <div className="p-6 text-center font-sans text-sm text-ink-400">No activity yet.</div>
            ) : (
              <div className="divide-y-2 divide-surface-200">
                {activity.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="w-2 h-2 bg-lime-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-ink-800 leading-relaxed">{a.message}</p>
                      <p className="label-caps text-ink-300 mt-0.5">{fmtTime(a.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomCard({ room, onSelect }) {
  const members = room.room_members || [];
  return (
    <button
      onClick={() => onSelect(room)}
      className="card card-hover p-6 text-left w-full group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="label-caps text-ink-400 mb-1">Private Room</p>
          <h3 className="heading-display text-2xl text-ink-900 leading-tight">{room.name}</h3>
        </div>
        <ArrowRight size={18} strokeWidth={2.5} className="text-ink-300 group-hover:text-lime-600 transition-colors mt-1 flex-shrink-0" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <Users size={12} strokeWidth={2.5} className="text-ink-400" />
          <span className="font-sans text-sm font-medium text-ink-600">{members.length} member{members.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Hash size={12} strokeWidth={2.5} className="text-ink-400" />
          <span className="font-mono text-sm font-bold text-ink-700">{room.code}</span>
        </div>
      </div>
      <div className="flex -space-x-2">
        {members.slice(0, 6).map((m, i) => (
          <div key={i} className="w-7 h-7 bg-ink-900 border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs font-bold font-sans">
              {m.profiles?.avatar_initials || '?'}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}

export default function Rooms() {
  const { session, createRoom, joinRoom, getRooms } = useApp();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getRooms();
    setRooms(data);
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!roomName.trim()) return;
    const room = await createRoom(roomName.trim());
    if (room) { setRoomName(''); setMode(null); await load(); setSelected(room); }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    const room = await joinRoom(joinCode.trim());
    if (room) { setJoinCode(''); setMode(null); await load(); }
  }

  if (selected) {
    // refresh selected room from list
    const fresh = rooms.find(r => r.id === selected.id) || selected;
    return (
      <main className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
        <RoomDetail room={fresh} onBack={() => setSelected(null)} />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
      <div className="mb-8">
        <p className="label-caps text-ink-400 mb-1">Social Competition</p>
        <h1 className="heading-display text-5xl lg:text-7xl">Rooms</h1>
      </div>

      {/* Actions */}
      {session ? (
        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={() => setMode(mode === 'create' ? null : 'create')} className="btn-ink">
            <Plus size={15} strokeWidth={2.5} /> New Room
          </button>
          <button onClick={() => setMode(mode === 'join' ? null : 'join')} className="btn-ghost">
            <Hash size={15} strokeWidth={2.5} /> Join with Code
          </button>
        </div>
      ) : (
        <div className="card p-5 mb-8 flex items-center gap-4 border-lime-500">
          <p className="font-sans text-sm font-medium">Sign in to create or join prediction rooms.</p>
        </div>
      )}

      {/* Create form */}
      {mode === 'create' && (
        <div className="card p-6 mb-6 border-ink-900">
          <p className="label-caps text-ink-600 mb-4">Room Name</p>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text" value={roomName}
              onChange={e => setRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. The Office Champions"
              className="flex-1 min-w-56 border-2 border-ink-900 bg-surface-100 px-4 py-2.5 font-sans text-sm outline-none focus:bg-lime-500/10 transition-colors"
            />
            <button onClick={handleCreate} className="btn-primary">Create <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {/* Join form */}
      {mode === 'join' && (
        <div className="card p-6 mb-6 border-ink-900">
          <p className="label-caps text-ink-600 mb-4">Enter Room Code</p>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text" value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="ABCD-1234"
              className="flex-1 min-w-56 border-2 border-ink-900 bg-surface-100 px-4 py-2.5 font-mono text-sm font-bold tracking-widest outline-none focus:bg-lime-500/10 transition-colors"
            />
            <button onClick={handleJoin} className="btn-primary">Join <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {/* Room grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 h-36 animate-pulse bg-surface-200 border-surface-300" />
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(r => <RoomCard key={r.id} room={r} onSelect={setSelected} />)}
        </div>
      ) : (
        <div className="card p-16 text-center border-dashed border-ink-300">
          <p className="heading-display text-3xl text-ink-400 mb-2">No rooms yet</p>
          <p className="font-sans text-sm text-ink-400">
            {session ? 'Create your first room above.' : 'Sign in to create or join rooms.'}
          </p>
        </div>
      )}
    </main>
  );
}
