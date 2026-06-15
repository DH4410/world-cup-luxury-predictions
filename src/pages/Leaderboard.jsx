import { useState } from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

function RankBadge({ rank }) {
  if (rank === 0) return <span className="editorial-heading text-base rank-1 w-8 text-center">I</span>;
  if (rank === 1) return <span className="editorial-heading text-base rank-2 w-8 text-center">II</span>;
  if (rank === 2) return <span className="editorial-heading text-base rank-3 w-8 text-center">III</span>;
  return <span className="font-sans text-sm text-charcoal-400 w-8 text-center">{rank + 1}</span>;
}

function LeaderboardTable({ data, showRooms }) {
  return (
    <div className="bg-white border border-cream-200">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-cream-200 bg-cream-50">
        <div className="col-span-1">
          <p className="editorial-label text-charcoal-400">#</p>
        </div>
        <div className="col-span-4">
          <p className="editorial-label text-charcoal-400">Player</p>
        </div>
        <div className="col-span-2 text-right hidden sm:block">
          <p className="editorial-label text-charcoal-400">Exact</p>
        </div>
        <div className="col-span-2 text-right hidden sm:block">
          <p className="editorial-label text-charcoal-400">Outcomes</p>
        </div>
        <div className="col-span-3 text-right">
          <p className="editorial-label text-charcoal-400">Total Pts</p>
        </div>
      </div>

      {/* Rows */}
      {data.map((u, i) => (
        <div
          key={u.id}
          className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-cream-200 last:border-b-0 items-center transition-colors ${
            u.isCurrentUser ? 'bg-cream-100' : 'hover:bg-cream-50'
          } ${i === 0 ? 'border-l-2 border-l-gold-500' : ''}`}
        >
          <div className="col-span-1">
            <RankBadge rank={i} />
          </div>
          <div className="col-span-4 flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-gold-500' : 'bg-charcoal-900'}`}>
              <span className={`text-xs font-sans font-medium ${i === 0 ? 'text-charcoal-900' : 'text-cream-50'}`}>
                {u.avatar}
              </span>
            </div>
            <div>
              <p className={`font-sans text-sm ${u.isCurrentUser ? 'font-semibold text-charcoal-900' : 'font-medium text-charcoal-800'}`}>
                {u.name}
              </p>
              <p className="font-sans text-xs text-charcoal-400">{u.country}</p>
            </div>
          </div>
          <div className="col-span-2 text-right hidden sm:block">
            <p className="font-sans text-sm text-charcoal-800">{u.exactScores}</p>
            <p className="editorial-label text-charcoal-400 mt-0.5">exact</p>
          </div>
          <div className="col-span-2 text-right hidden sm:block">
            <p className="font-sans text-sm text-charcoal-800">{u.correctOutcomes}</p>
            <p className="editorial-label text-charcoal-400 mt-0.5">correct</p>
          </div>
          <div className="col-span-3 text-right">
            <p className={`font-sans text-lg font-medium ${i === 0 ? 'text-gold-600' : 'text-charcoal-900'}`}>
              {u.totalPoints}
            </p>
            <p className="editorial-label text-charcoal-400">pts</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RoomLeaderboardSection({ room }) {
  const sorted = [...room.members].sort((a, b) => b.totalPoints - a.totalPoints);
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4 mb-5">
        <h3 className="editorial-heading text-xl text-charcoal-900">{room.name}</h3>
        <div className="flex-1 h-px bg-cream-200" />
        <span className="editorial-label text-charcoal-400 font-mono">{room.code}</span>
      </div>
      <div className="bg-white border border-cream-200">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-cream-200 bg-cream-50">
          <div className="col-span-1"><p className="editorial-label text-charcoal-400">#</p></div>
          <div className="col-span-8"><p className="editorial-label text-charcoal-400">Player</p></div>
          <div className="col-span-3 text-right"><p className="editorial-label text-charcoal-400">Points</p></div>
        </div>
        {sorted.map((m, i) => (
          <div
            key={m.id}
            className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-cream-200 last:border-b-0 items-center ${m.isCurrentUser ? 'bg-cream-100' : 'hover:bg-cream-50'}`}
          >
            <div className="col-span-1"><RankBadge rank={i} /></div>
            <div className="col-span-8 flex items-center gap-3">
              <div className={`w-7 h-7 flex items-center justify-center ${m.isCurrentUser ? 'bg-gold-500' : 'bg-charcoal-900'}`}>
                <span className={`text-xs font-sans ${m.isCurrentUser ? 'text-charcoal-900' : 'text-cream-50'}`}>{m.avatar}</span>
              </div>
              <p className={`font-sans text-sm ${m.isCurrentUser ? 'font-semibold' : 'font-medium'} text-charcoal-800`}>
                {m.name} {m.isCurrentUser && <span className="text-charcoal-400 font-normal">(you)</span>}
              </p>
            </div>
            <div className="col-span-3 text-right">
              <p className="font-sans text-base font-medium text-charcoal-900">{m.totalPoints}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { leaderboard, rooms } = useApp();
  const [tab, setTab] = useState('global');

  const currentUserEntry = leaderboard.find(u => u.isCurrentUser);
  const currentUserRank = leaderboard.findIndex(u => u.isCurrentUser) + 1;

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
      {/* Page heading */}
      <div className="mb-12 border-b border-cream-200 pb-10">
        <p className="editorial-label text-charcoal-400 mb-3">World Cup 2026</p>
        <h1 className="editorial-heading text-5xl lg:text-6xl mb-4">
          Elite<br /><em>Leaderboards</em>
        </h1>
        <p className="font-sans text-sm text-charcoal-600 max-w-lg font-light leading-relaxed">
          The definitive ranking of prediction masters. A refined index of performance, merit, and footballing intelligence.
        </p>
      </div>

      {/* Your standing */}
      {currentUserEntry && (
        <div className="grid md:grid-cols-3 gap-0 border border-gold-500 mb-10">
          <div className="p-6 border-r border-gold-500/30">
            <p className="editorial-label text-gold-500 mb-2">Your Rank</p>
            <p className="editorial-heading text-4xl text-charcoal-900">#{currentUserRank}</p>
            <p className="font-sans text-xs text-charcoal-400 mt-1">of {leaderboard.length} players</p>
          </div>
          <div className="p-6 border-r border-gold-500/30">
            <p className="editorial-label text-gold-500 mb-2">Total Points</p>
            <p className="editorial-heading text-4xl text-charcoal-900">{currentUserEntry.totalPoints}</p>
            <p className="font-sans text-xs text-charcoal-400 mt-1">accumulated</p>
          </div>
          <div className="p-6">
            <p className="editorial-label text-gold-500 mb-2">Exact Scores</p>
            <p className="editorial-heading text-4xl text-charcoal-900">{currentUserEntry.exactScores}</p>
            <p className="font-sans text-xs text-charcoal-400 mt-1">predictions</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border border-cream-200 w-fit mb-8">
        <button
          onClick={() => setTab('global')}
          className={`flex items-center gap-2 px-6 py-2.5 editorial-label transition-colors ${
            tab === 'global' ? 'bg-charcoal-900 text-cream-50' : 'bg-white text-charcoal-400 hover:text-charcoal-800 border-r border-cream-200'
          }`}
        >
          <TrendingUp size={11} strokeWidth={1.5} /> Global Ranking
        </button>
        <button
          onClick={() => setTab('rooms')}
          className={`flex items-center gap-2 px-6 py-2.5 editorial-label transition-colors ${
            tab === 'rooms' ? 'bg-charcoal-900 text-cream-50' : 'bg-white text-charcoal-400 hover:text-charcoal-800'
          }`}
        >
          <Award size={11} strokeWidth={1.5} /> My Rooms
        </button>
      </div>

      {/* Global table */}
      {tab === 'global' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="editorial-label text-charcoal-400">Global Standings</span>
            <div className="flex-1 h-px bg-cream-200" />
            <span className="editorial-label text-charcoal-400">{leaderboard.length} players registered</span>
          </div>
          <LeaderboardTable data={leaderboard} />
        </div>
      )}

      {/* Room leaderboards */}
      {tab === 'rooms' && (
        <div>
          {rooms.length > 0 ? (
            rooms.map(room => <RoomLeaderboardSection key={room.id} room={room} />)
          ) : (
            <div className="text-center py-24 border border-dashed border-cream-300">
              <p className="editorial-heading text-2xl text-charcoal-400 mb-2">You haven't joined any rooms yet.</p>
              <p className="font-sans text-sm text-charcoal-400">Create or join a room from the Rooms page.</p>
            </div>
          )}
        </div>
      )}

      {/* Scoring guide reminder */}
      <div className="mt-16 pt-10 border-t border-cream-200">
        <p className="editorial-label text-charcoal-400 mb-6">Points Reference</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { pts: 5, label: 'Exact Scoreline' },
            { pts: 2, label: 'Correct Outcome' },
            { pts: 2, label: 'Goalscorer' },
            { pts: 1, label: 'Assist / MOTM' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="editorial-heading text-2xl text-gold-500">{item.pts}</span>
              <div>
                <p className="font-sans text-xs font-medium text-charcoal-800">{item.label}</p>
                <p className="editorial-label text-charcoal-400">points</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
