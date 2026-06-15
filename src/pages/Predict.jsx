import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Check, Lock, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS, PLAYERS } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }
function getPlayers(a, b) { return [...(PLAYERS[a] || []), ...(PLAYERS[b] || [])]; }

function ScoreCounter({ value, onChange }) {
  return (
    <div className="flex flex-col items-center">
      <button onClick={() => onChange(Math.min(value + 1, 20))} className="p-2 text-ink-400 hover:text-lime-600 transition-colors">
        <ChevronUp size={18} strokeWidth={2.5} />
      </button>
      <input
        type="number" className="score-input"
        value={value} min={0} max={20}
        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0 && v <= 20) onChange(v); }}
      />
      <button onClick={() => onChange(Math.max(value - 1, 0))} className="p-2 text-ink-400 hover:text-lime-600 transition-colors">
        <ChevronDown size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function PlayerGrid({ players, selected, onSelect, label }) {
  return (
    <div>
      <p className="label-caps text-ink-600 mb-3">{label}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {players.map(p => (
          <button
            key={p}
            onClick={() => onSelect(selected === p ? '' : p)}
            className={`text-left px-3 py-2.5 border-2 font-sans text-sm font-medium transition-all ${
              selected === p ? 'sel-lime' : 'border-surface-300 bg-white hover:border-ink-800'
            }`}
          >
            {selected === p && <Check size={11} className="inline mr-1" strokeWidth={3} />}
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match, expanded, onToggle, myPreds }) {
  const { session, savePrediction } = useApp();
  const home = getTeam(match.homeTeam);
  const away = getTeam(match.awayTeam);
  const players = getPlayers(match.homeTeam, match.awayTeam);
  const existing = myPreds[match.id];

  const [homeScore, setHomeScore] = useState(existing?.homeScore ?? 1);
  const [awayScore, setAwayScore] = useState(existing?.awayScore ?? 1);
  const [scorer, setScorer] = useState(existing?.scorer ?? '');
  const [assister, setAssister] = useState(existing?.assister ?? '');
  const [motm, setMotm] = useState(existing?.motm ?? '');
  const [saved, setSaved] = useState(!!existing);

  async function handleSave() {
    await savePrediction(match.id, { homeScore, awayScore, scorer, assister, motm });
    setSaved(true);
  }

  const done = match.status === 'completed';

  return (
    <div className={`border-2 bg-white transition-colors ${expanded ? 'border-ink-900' : 'border-surface-300 hover:border-ink-600'}`}>
      {/* Row */}
      <button className="w-full text-left px-5 py-4 flex items-center justify-between" onClick={onToggle}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{home?.flag}</span>
            <span className="font-sans font-bold text-sm text-ink-900">{home?.name}</span>
          </div>
          <span className="heading-display text-xl text-ink-400">VS</span>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm text-ink-900">{away?.name}</span>
            <span className="text-2xl">{away?.flag}</span>
          </div>
          <span className="label-caps text-ink-400 hidden sm:inline">{match.stage}</span>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {done && <span className="badge-ink">FT {match.result.homeScore}–{match.result.awayScore}</span>}
          {saved && !done && <span className="badge-lime">Saved</span>}
          {expanded ? <ChevronUp size={16} strokeWidth={2.5} className="text-ink-400" /> : <ChevronDown size={16} strokeWidth={2.5} className="text-ink-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t-2 border-surface-200 px-5 py-6 space-y-6">
          {!session && (
            <div className="flex items-center gap-3 p-4 border-2 border-lime-500 bg-lime-500/10">
              <LogIn size={16} strokeWidth={2} className="text-lime-600 flex-shrink-0" />
              <p className="font-sans text-sm font-medium">Sign in to lock in your prediction.</p>
            </div>
          )}

          {done && (
            <div className="p-4 bg-surface-100 border-2 border-surface-300">
              <p className="label-caps text-ink-600 mb-2">Full Time Result</p>
              <div className="flex flex-wrap gap-4 items-center">
                <span className="heading-display text-3xl">{match.result.homeScore} – {match.result.awayScore}</span>
                <span className="font-sans text-sm font-medium text-ink-600">⚽ {match.result.scorer}</span>
                <span className="font-sans text-sm font-medium text-ink-600">🎯 {match.result.motm} MOTM</span>
              </div>
            </div>
          )}

          {/* Score */}
          <div>
            <p className="label-caps text-ink-600 mb-4">Exact Full-Time Score <span className="text-lime-600">+5 pts</span></p>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="font-sans text-sm font-bold mb-2">{home?.name}</p>
                <ScoreCounter value={homeScore} onChange={setHomeScore} />
              </div>
              <span className="heading-display text-4xl text-ink-300 mt-4">–</span>
              <div className="text-center">
                <p className="font-sans text-sm font-bold mb-2">{away?.name}</p>
                <ScoreCounter value={awayScore} onChange={setAwayScore} />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-surface-200" />

          <PlayerGrid players={players} selected={scorer} onSelect={setScorer} label="Goalscorer · +2 pts" />
          <div className="border-t-2 border-surface-200" />
          <PlayerGrid players={players} selected={assister} onSelect={setAssister} label="Assist Maker · +1 pt" />
          <div className="border-t-2 border-surface-200" />
          <PlayerGrid players={players} selected={motm} onSelect={setMotm} label="Man of the Match · +1 pt" />

          <div className="border-t-2 border-surface-200 pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={!session || done}
              className={`btn-primary ${(!session || done) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {done ? <><Lock size={13} strokeWidth={2} /> Locked</> : saved ? <><Check size={13} strokeWidth={2.5} /> Update</> : 'Lock In Prediction'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Predict() {
  const { matches, getMyPredictions } = useApp();
  const [myPreds, setMyPreds] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { getMyPredictions().then(setMyPreds); }, []);

  const shown = filter === 'upcoming' ? matches.filter(m => m.status === 'upcoming')
    : filter === 'completed' ? matches.filter(m => m.status === 'completed')
    : matches;

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
      <div className="mb-8">
        <p className="label-caps text-ink-400 mb-1">World Cup 2026</p>
        <h1 className="heading-display text-5xl lg:text-7xl">Prediction Suite</h1>
      </div>

      {/* Filter */}
      <div className="flex mb-6 border-2 border-ink-900 w-fit">
        {[['all', 'All'], ['upcoming', 'Upcoming'], ['completed', 'Completed']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-5 py-2 label-caps transition-colors border-r-2 border-ink-900 last:border-r-0 ${
              filter === val ? 'bg-ink-900 text-white' : 'bg-white text-ink-400 hover:text-ink-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.map(m => (
          <MatchCard
            key={m.id} match={m} myPreds={myPreds}
            expanded={expanded === m.id}
            onToggle={() => setExpanded(expanded === m.id ? null : m.id)}
          />
        ))}
      </div>
    </main>
  );
}
