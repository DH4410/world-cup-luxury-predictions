import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Hash, Users, ArrowRight, Eye, EyeOff, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }

function RoomMemberRow({ member, rank }) {
  const rankLabel = ['I', 'II', 'III', 'IV', 'V'][rank] || rank + 1;
  return (
    <div className={`flex items-center justify-between py-3 border-b border-cream-200 last:border-b-0 ${member.isCurrentUser ? 'bg-cream-50 -mx-4 px-4' : ''}`}>
      <div className="flex items-center gap-4">
        <span className={`editorial-heading text-sm w-6 text-center ${rank === 0 ? 'rank-1' : rank === 1 ? 'rank-2' : rank === 2 ? 'rank-3' : 'text-charcoal-400'}`}>
          {rankLabel}
        </span>
        <div className="w-7 h-7 bg-charcoal-900 flex items-center justify-center">
          <span className="text-cream-50 text-xs font-sans font-medium">{member.avatar}</span>
        </div>
        <p className={`font-sans text-sm ${member.isCurrentUser ? 'font-medium text-charcoal-900' : 'text-charcoal-700'}`}>
          {member.name} {member.isCurrentUser && <span className="text-charcoal-400 font-normal">(you)</span>}
        </p>
      </div>
      <div className="text-right">
        <p className="font-sans text-sm font-medium text-charcoal-900">{member.totalPoints}</p>
        <p className="editorial-label text-charcoal-400">pts</p>
      </div>
    </div>
  );
}

function PredictionCompare({ room }) {
  const [revealed, setRevealed] = useState(false);
  const match = room.upcomingMatch;
  // Find match data
  const { matches } = useApp();
  const upcomingMatch = matches.find(m => m.id === room.upcomingMatch);
  if (!upcomingMatch) return null;
  const home = getTeam(upcomingMatch.homeTeam);
  const away = getTeam(upcomingMatch.awayTeam);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="editorial-label text-charcoal-400">
          Member Predictions — {home?.name} vs {away?.name}
        </p>
        <button
          onClick={() => setRevealed(v => !v)}
          className="flex items-center gap-1.5 editorial-label text-charcoal-400 hover:text-charcoal-800 transition-colors"
        >
          {revealed ? <EyeOff size={11} strokeWidth={1.5} /> : <Eye size={11} strokeWidth={1.5} />}
          {revealed ? 'Hide' : 'Reveal'}
        </button>
      </div>

      <div className="space-y-2">
        {room.members.map(member => {
          const pred = room.predictions[member.id];
          const hasPredicted = !!pred;
          return (
            <div key={member.id} className="flex items-center justify-between p-3 border border-cream-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-charcoal-900 flex items-center justify-center">
                  <span className="text-cream-50 text-xs font-sans">{member.avatar}</span>
                </div>
                <p className="font-sans text-xs text-charcoal-700">{member.name}</p>
              </div>
              {hasPredicted ? (
                revealed ? (
                  <div className="flex items-center gap-3">
                    <span className="editorial-heading text-sm text-charcoal-900">
                      {pred.homeScore} – {pred.awayScore}
                    </span>
                    <span className="font-sans text-xs text-charcoal-400">⚽ {pred.scorer}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-charcoal-400">
                    <div className="w-12 h-4 bg-charcoal-900 opacity-20" />
                    <div className="w-16 h-4 bg-charcoal-900 opacity-20" />
                  </div>
                )
              ) : (
                <span className="editorial-label text-charcoal-300">Not predicted</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoomCard({ room, onSelect }) {
  return (
    <div
      onClick={() => onSelect(room)}
      className="bg-white border border-cream-200 p-8 card-hover cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="editorial-label text-charcoal-400 mb-2">Private Room</p>
          <h3 className="editorial-heading text-2xl text-charcoal-900">{room.name}</h3>
        </div>
        <ArrowRight size={14} strokeWidth={1.5} className="text-charcoal-300 group-hover:text-charcoal-900 transition-colors mt-1" />
      </div>
      <div className="flex items-center gap-6 mb-5">
        <div className="flex items-center gap-1.5 text-charcoal-400">
          <Users size={12} strokeWidth={1.5} />
          <span className="font-sans text-xs">{room.members.length} members</span>
        </div>
        <div className="flex items-center gap-1.5 text-charcoal-400">
          <Hash size={12} strokeWidth={1.5} />
          <span className="font-sans text-xs font-mono tracking-wider">{room.code}</span>
        </div>
      </div>
      <div className="flex -space-x-2">
        {room.members.slice(0, 5).map(m => (
          <div key={m.id} className={`w-7 h-7 flex items-center justify-center border border-white text-xs font-sans font-medium ${m.isCurrentUser ? 'bg-gold-500 text-charcoal-900' : 'bg-charcoal-900 text-cream-50'}`}>
            {m.avatar}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomDetail({ room, onBack }) {
  const sorted = [...room.members].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div>
      {/* Room header */}
      <div className="border border-charcoal-900 bg-charcoal-900 p-10 mb-8">
        <button onClick={onBack} className="editorial-label text-cream-300 hover:text-gold-500 mb-6 flex items-center gap-1.5 transition-colors">
          ← Back to Rooms
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="editorial-label text-gold-500 mb-2">Private Room</p>
            <h1 className="editorial-heading text-4xl lg:text-5xl text-cream-50">{room.name}</h1>
          </div>
          <div className="text-right">
            <p className="editorial-label text-cream-300 mb-1">Room Code</p>
            <p className="font-mono text-sm text-gold-400 tracking-widest border border-gold-500/30 px-3 py-1.5 bg-charcoal-800/40">
              {room.code}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-cream-200 p-6">
            <p className="editorial-label text-charcoal-400 mb-5">Room Standings</p>
            {sorted.map((m, i) => (
              <RoomMemberRow key={m.id} member={m} rank={i} />
            ))}
          </div>
        </div>

        {/* Predictions + Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Predictions compare */}
          <div className="bg-white border border-cream-200 p-6">
            <PredictionCompare room={room} />
          </div>

          {/* Activity log */}
          <div className="bg-white border border-cream-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={13} strokeWidth={1.5} className="text-charcoal-400" />
              <p className="editorial-label text-charcoal-400">Activity Log</p>
            </div>
            <div className="space-y-4">
              {room.activity.map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-gold-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-sans text-xs text-charcoal-700 leading-relaxed">{a.text}</p>
                    <p className="editorial-label text-charcoal-300 mt-1">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const { isLoggedIn, rooms, createRoom, joinRoom } = useApp();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  function handleCreate() {
    if (!roomName.trim()) return;
    const r = createRoom(roomName.trim());
    setSelectedRoom(r);
    setMode(null);
    setRoomName('');
  }

  function handleJoin() {
    if (!joinCode.trim()) return;
    const r = joinRoom(joinCode.trim());
    if (r) setSelectedRoom(r);
    setJoinCode('');
    setMode(null);
  }

  if (selectedRoom) {
    return (
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <RoomDetail room={selectedRoom} onBack={() => setSelectedRoom(null)} />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
      {/* Page heading */}
      <div className="mb-12 border-b border-cream-200 pb-10">
        <p className="editorial-label text-charcoal-400 mb-3">Social Prediction</p>
        <h1 className="editorial-heading text-5xl lg:text-6xl mb-4">
          The<br /><em>Rooms</em>
        </h1>
        <p className="font-sans text-sm text-charcoal-600 max-w-lg font-light leading-relaxed">
          Create a private room, invite your circle, and compete on a dedicated leaderboard. Reveal predictions only after kick-off.
        </p>
      </div>

      {/* Action row */}
      <div className="flex flex-wrap gap-4 mb-10">
        <button
          onClick={() => isLoggedIn ? setMode(mode === 'create' ? null : 'create') : null}
          disabled={!isLoggedIn}
          className={`btn-primary flex items-center gap-2 ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus size={13} strokeWidth={1.5} /> Create a Room
        </button>
        <button
          onClick={() => isLoggedIn ? setMode(mode === 'join' ? null : 'join') : null}
          disabled={!isLoggedIn}
          className={`btn-ghost flex items-center gap-2 ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Hash size={13} strokeWidth={1.5} /> Join with Code
        </button>
        {!isLoggedIn && (
          <p className="editorial-label text-charcoal-400 self-center">Sign in to create or join rooms.</p>
        )}
      </div>

      {/* Create room form */}
      {mode === 'create' && (
        <div className="bg-white border border-charcoal-900 p-8 mb-8">
          <p className="editorial-label text-charcoal-400 mb-5">New Private Room</p>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Room name (e.g. The Director's Club)"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="flex-1 border border-cream-200 bg-cream-50 px-4 py-3 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900 transition-colors min-w-64"
            />
            <button onClick={handleCreate} className="btn-primary">
              Create Room <ArrowRight size={13} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Join room form */}
      {mode === 'join' && (
        <div className="bg-white border border-charcoal-900 p-8 mb-8">
          <p className="editorial-label text-charcoal-400 mb-5">Join with Room Code</p>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Enter room code (e.g. DIR-2026)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              className="flex-1 border border-cream-200 bg-cream-50 px-4 py-3 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900 transition-colors font-mono tracking-widest min-w-64"
            />
            <button onClick={handleJoin} className="btn-primary">
              Join Room <ArrowRight size={13} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Room grid */}
      {rooms.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} onSelect={setSelectedRoom} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-cream-300">
          <p className="editorial-heading text-2xl text-charcoal-400 mb-2">No rooms yet.</p>
          <p className="font-sans text-sm text-charcoal-400">Create your first room or join one with a code.</p>
        </div>
      )}
    </main>
  );
}
