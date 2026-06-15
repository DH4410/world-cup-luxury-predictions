import { useState, useEffect } from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Leaderboard() {
  const { session, profile, getLeaderboard, getRooms } = useApp();
  const [leaders, setLeaders] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tab, setTab] = useState('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getLeaderboard(), getRooms()]).then(([lb, rms]) => {
      setLeaders(lb);
      setRooms(rms);
      setLoading(false);
    });
  }, [session]);

  const myRank = leaders.findIndex(u => u.id === session?.user?.id) + 1;

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
      {/* Page heading */}
      <div className="mb-8">
        <p className="label-caps text-ink-400 mb-1">World Cup 2026</p>
        <h1 className="heading-display text-5xl lg:text-7xl">Leaderboard</h1>
      </div>

      {/* My stats card */}
      {session && profile && (
        <div className="card border-lime-500 mb-8 overflow-hidden">
          <div className="bg-lime-500 px-6 py-2">
            <p className="label-caps text-ink-900">Your Standing</p>
          </div>
          <div className="grid grid-cols-3 divide-x-2 divide-ink-900 border-t-0">
            <div className="px-6 py-5">
              <p className="heading-display text-5xl text-ink-900">#{myRank || '–'}</p>
              <p className="label-caps text-ink-400 mt-1">Global Rank</p>
            </div>
            <div className="px-6 py-5">
              <p className="heading-display text-5xl text-ink-900">{profile.total_points}</p>
              <p className="label-caps text-ink-400 mt-1">Total Points</p>
            </div>
            <div className="px-6 py-5">
              <p className="heading-display text-5xl text-ink-900">{profile.exact_scores}</p>
              <p className="label-caps text-ink-400 mt-1">Exact Scores</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-2 border-ink-900 w-fit mb-6">
        <button
          onClick={() => setTab('global')}
          className={`flex items-center gap-2 px-6 py-2.5 label-caps border-r-2 border-ink-900 transition-colors ${tab === 'global' ? 'bg-ink-900 text-white' : 'bg-white text-ink-400 hover:text-ink-900'}`}
        >
          <TrendingUp size={12} strokeWidth={2.5} /> Global
        </button>
        <button
          onClick={() => setTab('rooms')}
          className={`flex items-center gap-2 px-6 py-2.5 label-caps transition-colors ${tab === 'rooms' ? 'bg-ink-900 text-white' : 'bg-white text-ink-400 hover:text-ink-900'}`}
        >
          <Users size={12} strokeWidth={2.5} /> My Rooms
        </button>
      </div>

      {/* Global table */}
      {tab === 'global' && (
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-ink-900">
            <div className="col-span-1"><p className="label-caps text-ink-400">#</p></div>
            <div className="col-span-5"><p className="label-caps text-ink-400">Player</p></div>
            <div className="col-span-2 text-right hidden sm:block"><p className="label-caps text-ink-400">Exact</p></div>
            <div className="col-span-2 text-right hidden sm:block"><p className="label-caps text-ink-400">Results</p></div>
            <div className="col-span-2 sm:col-span-2 text-right"><p className="label-caps text-ink-400">Points</p></div>
          </div>

          {loading ? (
            <div className="p-8 text-center font-sans text-sm text-ink-400">Loading…</div>
          ) : leaders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="heading-display text-3xl text-ink-400">No players yet.</p>
              <p className="font-sans text-sm text-ink-400 mt-2">Be the first to sign up and predict!</p>
            </div>
          ) : leaders.map((u, i) => {
            const isSelf = u.id === session?.user?.id;
            return (
              <div
                key={u.id}
                className={`grid grid-cols-12 gap-2 px-5 py-4 border-b-2 border-surface-200 last:border-0 items-center ${
                  isSelf ? 'bg-lime-500/10' : i % 2 === 0 ? 'bg-white' : 'bg-surface-100'
                } ${i === 0 ? 'border-l-4 border-l-lime-500' : ''}`}
              >
                <div className="col-span-1">
                  <span className={`heading-display text-xl ${i === 0 ? 'text-lime-500' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'text-ink-400'}`}>
                    {i + 1}
                  </span>
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-9 h-9 flex items-center justify-center text-sm font-bold font-sans flex-shrink-0 ${
                    i === 0 ? 'bg-lime-500 text-ink-900' : isSelf ? 'bg-ink-900 text-lime-500 border-2 border-lime-500' : 'bg-ink-900 text-white'
                  }`}>
                    {u.avatar_initials}
                  </div>
                  <div>
                    <p className={`font-sans font-bold text-sm text-ink-900 ${isSelf ? '' : ''}`}>
                      {u.username} {isSelf && <span className="text-ink-400 font-normal">(you)</span>}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 text-right hidden sm:block">
                  <p className="font-sans font-bold text-sm text-ink-800">{u.exact_scores}</p>
                </div>
                <div className="col-span-2 text-right hidden sm:block">
                  <p className="font-sans font-bold text-sm text-ink-800">{u.correct_outcomes}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className={`heading-display text-2xl ${i === 0 ? 'text-lime-600' : 'text-ink-900'}`}>{u.total_points}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rooms tab */}
      {tab === 'rooms' && (
        <div className="space-y-8">
          {!session ? (
            <div className="card p-12 text-center border-ink-900">
              <p className="heading-display text-3xl text-ink-400">Sign in to see your rooms.</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="card p-12 text-center border-dashed border-ink-300">
              <p className="heading-display text-3xl text-ink-400 mb-2">No rooms yet.</p>
              <p className="font-sans text-sm text-ink-400">Create or join a room from the Rooms page.</p>
            </div>
          ) : rooms.map(room => {
            const members = (room.room_members || [])
              .map(m => m.profiles)
              .filter(Boolean)
              .sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
            return (
              <div key={room.id} className="card overflow-hidden">
                <div className="bg-ink-900 px-5 py-3 flex items-center justify-between">
                  <p className="heading-display text-2xl text-white">{room.name}</p>
                  <span className="font-mono text-sm text-lime-500 font-bold">{room.code}</span>
                </div>
                {members.map((m, i) => {
                  const isSelf = m.id === session?.user?.id;
                  return (
                    <div key={m.id} className={`flex items-center justify-between px-5 py-3.5 border-b-2 border-surface-200 last:border-0 ${isSelf ? 'bg-lime-500/10' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className={`heading-display text-xl w-6 text-center ${i === 0 ? 'text-lime-500' : 'text-ink-400'}`}>{i + 1}</span>
                        <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold font-sans ${isSelf ? 'bg-lime-500 text-ink-900' : 'bg-ink-900 text-white'}`}>
                          {m.avatar_initials}
                        </div>
                        <span className="font-sans font-bold text-sm text-ink-900">{m.username} {isSelf && <span className="text-ink-400 font-normal">(you)</span>}</span>
                      </div>
                      <span className="heading-display text-2xl text-ink-900">{m.total_points || 0}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
