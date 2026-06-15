import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Check, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS, PLAYERS } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }
function getPlayers(teamA, teamB) {
  return [...(PLAYERS[teamA] || []), ...(PLAYERS[teamB] || [])];
}

function ScoreCounter({ value, onChange }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onChange(Math.min(value + 1, 20))}
        className="text-charcoal-400 hover:text-charcoal-800 transition-colors p-1"
      >
        <ChevronUp size={16} strokeWidth={1.5} />
      </button>
      <input
        type="number"
        className="score-input"
        value={value}
        min={0}
        max={20}
        onChange={e => {
          const v = parseInt(e.target.value);
          if (!isNaN(v) && v >= 0 && v <= 20) onChange(v);
        }}
      />
      <button
        onClick={() => onChange(Math.max(value - 1, 0))}
        className="text-charcoal-400 hover:text-charcoal-800 transition-colors p-1"
      >
        <ChevronDown size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function PlayerSelector({ players, selected, onSelect, label }) {
  return (
    <div>
      <p className="editorial-label text-charcoal-400 mb-3">{label}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {players.map(p => (
          <button
            key={p}
            onClick={() => onSelect(selected === p ? '' : p)}
            className={`text-left px-3 py-2.5 border font-sans text-xs transition-all ${
              selected === p
                ? 'selected-gold'
                : 'border-cream-200 bg-cream-50 hover:border-charcoal-400 text-charcoal-700'
            }`}
          >
            {selected === p && <Check size={10} className="inline mr-1 text-gold-500" strokeWidth={2} />}
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchPredictCard({ match, isExpanded, onToggle }) {
  const { isLoggedIn, predictions, savePrediction } = useApp();
  const home = getTeam(match.homeTeam);
  const away = getTeam(match.awayTeam);
  const players = getPlayers(match.homeTeam, match.awayTeam);
  const existing = predictions[match.id];

  const [homeScore, setHomeScore] = useState(existing?.homeScore ?? 1);
  const [awayScore, setAwayScore] = useState(existing?.awayScore ?? 1);
  const [scorer, setScorer] = useState(existing?.scorer ?? '');
  const [assister, setAssister] = useState(existing?.assister ?? '');
  const [motm, setMotm] = useState(existing?.motm ?? '');
  const [submitted, setSubmitted] = useState(!!existing);

  function handleSubmit() {
    if (!isLoggedIn) return;
    savePrediction(match.id, { homeScore, awayScore, scorer, assister, motm });
    setSubmitted(true);
  }

  const isCompleted = match.status === 'completed';

  return (
    <div className={`border bg-white transition-all ${isExpanded ? 'border-charcoal-900' : 'border-cream-200 card-hover'}`}>
      {/* Header row */}
      <button
        className="w-full text-left p-6 flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{home?.flag}</span>
            <span className="font-sans text-sm font-medium text-charcoal-900">{home?.name}</span>
          </div>
          <span className="editorial-label text-charcoal-400">vs</span>
          <div className="flex items-center gap-3">
            <span className="font-sans text-sm font-medium text-charcoal-900">{away?.name}</span>
            <span className="text-2xl">{away?.flag}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCompleted && (
            <span className="editorial-label text-charcoal-400 mr-2">Result: {match.result.homeScore}–{match.result.awayScore}</span>
          )}
          {submitted && !isCompleted && <span className="gold-badge text-xs">Predicted</span>}
          {isCompleted && <span className="editorial-label text-charcoal-400 bg-cream-100 px-3 py-1">Final</span>}
          {isExpanded ? <ChevronUp size={14} strokeWidth={1.5} className="text-charcoal-400" /> : <ChevronDown size={14} strokeWidth={1.5} className="text-charcoal-400" />}
        </div>
      </button>

      {/* Expanded prediction form */}
      {isExpanded && (
        <div className="border-t border-cream-200 p-6 space-y-8">
          {!isLoggedIn && (
            <div className="flex items-center gap-3 p-4 border border-gold-500 bg-yellow-50">
              <LogIn size={14} strokeWidth={1.5} className="text-gold-600 flex-shrink-0" />
              <p className="font-sans text-xs text-charcoal-700">
                Please <strong>sign in</strong> to submit predictions and compete for points.
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="p-4 bg-cream-100 border border-cream-200">
              <p className="editorial-label text-charcoal-600 mb-2">Match Result</p>
              <div className="flex items-center gap-4">
                <span className="font-sans text-xs text-charcoal-800"><strong>{home?.name}</strong> {match.result.homeScore} – {match.result.awayScore} <strong>{away?.name}</strong></span>
                <span className="font-sans text-xs text-charcoal-600">Scorer: {match.result.scorer}</span>
                <span className="font-sans text-xs text-charcoal-600">MOTM: {match.result.motm}</span>
              </div>
            </div>
          )}

          {/* Score selector */}
          <div>
            <p className="editorial-label text-charcoal-400 mb-5">Exact Full-Time Scoreline</p>
            <div className="flex items-center gap-8 justify-center">
              <div className="text-center">
                <p className="font-sans text-xs font-medium text-charcoal-700 mb-3">{home?.name}</p>
                <ScoreCounter value={homeScore} onChange={setHomeScore} />
              </div>
              <div className="editorial-heading text-3xl text-charcoal-300 mt-6">–</div>
              <div className="text-center">
                <p className="font-sans text-xs font-medium text-charcoal-700 mb-3">{away?.name}</p>
                <ScoreCounter value={awayScore} onChange={setAwayScore} />
              </div>
            </div>
          </div>

          <div className="h-px bg-cream-200" />

          {/* Player selectors */}
          <PlayerSelector
            players={players}
            selected={scorer}
            onSelect={setScorer}
            label="First / Anytime Goalscorer (2 pts)"
          />

          <div className="h-px bg-cream-200" />

          <PlayerSelector
            players={players}
            selected={assister}
            onSelect={setAssister}
            label="Assist Maker (1 pt)"
          />

          <div className="h-px bg-cream-200" />

          <PlayerSelector
            players={players}
            selected={motm}
            onSelect={setMotm}
            label="Man of the Match (1 pt)"
          />

          <div className="h-px bg-cream-200" />

          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              {submitted && (
                <div className="flex items-center gap-1.5 text-charcoal-600">
                  <Check size={12} strokeWidth={2} />
                  <span className="font-sans text-xs">Prediction saved</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!isLoggedIn || isCompleted}
              className={`flex items-center gap-2 px-6 py-2.5 font-sans text-xs font-medium tracking-widest uppercase transition-all ${
                !isLoggedIn || isCompleted
                  ? 'bg-cream-200 text-charcoal-400 cursor-not-allowed border border-cream-200'
                  : 'btn-primary'
              }`}
            >
              {isCompleted ? (
                <><Lock size={11} strokeWidth={1.5} /> Locked</>
              ) : submitted ? (
                <><Check size={11} strokeWidth={2} /> Update Prediction</>
              ) : (
                'Lock In Prediction'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Predict() {
  const { matches } = useApp();
  const [expandedId, setExpandedId] = useState(matches[0]?.id || null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'upcoming'
    ? matches.filter(m => m.status === 'upcoming')
    : filter === 'completed'
    ? matches.filter(m => m.status === 'completed')
    : matches;

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
      {/* Page heading */}
      <div className="mb-12 border-b border-cream-200 pb-10">
        <p className="editorial-label text-charcoal-400 mb-3">World Cup 2026</p>
        <h1 className="editorial-heading text-5xl lg:text-6xl mb-4">
          Prediction<br /><em>Master Suite</em>
        </h1>
        <p className="font-sans text-sm text-charcoal-600 max-w-lg font-light leading-relaxed">
          Select a fixture below, enter your exact scoreline, name the key performers, and lock in your forecast before kick-off.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 border border-cream-200 w-fit mb-8">
        {[
          { val: 'all', label: 'All Fixtures' },
          { val: 'upcoming', label: 'Upcoming' },
          { val: 'completed', label: 'Completed' },
        ].map(tab => (
          <button
            key={tab.val}
            onClick={() => setFilter(tab.val)}
            className={`px-6 py-2.5 editorial-label transition-colors ${
              filter === tab.val
                ? 'bg-charcoal-900 text-cream-50'
                : 'bg-white text-charcoal-400 hover:text-charcoal-800 border-r border-cream-200 last:border-r-0'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Match cards */}
      <div className="space-y-3">
        {filtered.map(match => (
          <MatchPredictCard
            key={match.id}
            match={match}
            isExpanded={expandedId === match.id}
            onToggle={() => setExpandedId(expandedId === match.id ? null : match.id)}
          />
        ))}
      </div>
    </main>
  );
}
