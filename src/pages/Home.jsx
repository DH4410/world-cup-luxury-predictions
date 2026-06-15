import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { TEAMS } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase() +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' ET';
}

export default function Home() {
  const { matches, getLeaderboard } = useApp();
  const [leaders, setLeaders] = useState([]);
  const featured = matches.find(m => m.featured);
  const upcoming = matches.filter(m => m.status === 'upcoming').slice(0, 3);
  const home = featured ? getTeam(featured.homeTeam) : null;
  const away = featured ? getTeam(featured.awayTeam) : null;

  useEffect(() => { getLeaderboard().then(setLeaders); }, []);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-ink-900 relative overflow-hidden">
        {/* big number watermark */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 pointer-events-none select-none opacity-5">
          <span className="heading-display text-white" style={{ fontSize: '28vw', lineHeight: 1 }}>26</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-10 py-16 lg:py-24 relative">
          <div className="inline-flex items-center gap-2 bg-lime-500 px-3 py-1 mb-6">
            <Zap size={12} fill="currentColor" />
            <span className="label-caps text-ink-900">FIFA World Cup 2026 — Live Prediction Game</span>
          </div>
          <h1 className="heading-display text-white mb-4" style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', lineHeight: 0.92 }}>
            Predict.<br />
            <span className="text-lime-500">Compete.</span><br />
            Dominate.
          </h1>
          <p className="font-sans text-ink-200 text-base max-w-lg mb-8 leading-relaxed">
            Submit exact scorelines, name goalscorers, create private rooms, and climb the global leaderboard. Real matches. Real stakes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/predict" className="btn-primary">Make a Prediction <ArrowRight size={14} strokeWidth={2.5} /></Link>
            <Link to="/rooms" className="btn-ghost-light">Create a Room <ArrowRight size={14} strokeWidth={2.5} /></Link>
          </div>
        </div>
      </section>

      {/* ── SCORING STRIP ────────────────────────────────────── */}
      <div className="bg-lime-500 border-y-2 border-ink-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div className="grid grid-cols-4 divide-x-2 divide-ink-900">
            {[
              { pts: 5, label: 'Exact Score' },
              { pts: 2, label: 'Correct Result' },
              { pts: 2, label: 'Goalscorer' },
              { pts: 1, label: 'Assist / MOTM' },
            ].map(item => (
              <div key={item.label} className="px-4 py-3 flex items-center gap-3">
                <span className="heading-display text-3xl text-ink-900">{item.pts}pts</span>
                <span className="label-caps text-ink-800 hidden sm:block">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED MATCH ───────────────────────────────────── */}
      {featured && home && away && (
        <section className="max-w-7xl mx-auto px-4 lg:px-10 py-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="heading-display text-3xl">Featured Match</h2>
            <span className="badge-lime">Today</span>
          </div>

          <div className="card overflow-hidden">
            <div className="bg-pitch-900 p-8 lg:p-12">
              <p className="label-caps text-lime-500 mb-6">{featured.stage}</p>
              <div className="flex items-center justify-center gap-6 lg:gap-16 mb-8">
                <div className="text-center">
                  <div className="text-6xl lg:text-8xl mb-3">{home.flag}</div>
                  <p className="heading-display text-white text-2xl lg:text-4xl">{home.name}</p>
                </div>
                <div className="text-center px-4 lg:px-8">
                  <p className="heading-display text-lime-500 text-4xl lg:text-6xl">VS</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl lg:text-8xl mb-3">{away.flag}</div>
                  <p className="heading-display text-white text-2xl lg:text-4xl">{away.name}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-ink-200">
                <div className="flex items-center gap-2">
                  <MapPin size={13} strokeWidth={2} />
                  <span className="font-sans text-sm font-medium">{featured.stadium}, {featured.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} strokeWidth={2} />
                  <span className="font-sans text-sm font-medium">{fmtDate(featured.kickoff)}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t-2 border-ink-900 flex flex-wrap gap-3">
              <Link to="/predict" className="btn-primary">Predict This Match <ArrowRight size={14} /></Link>
              <Link to="/rooms" className="btn-ghost">Create a Private Room</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── UPCOMING FIXTURES ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-10 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-display text-3xl">Upcoming Fixtures</h2>
          <Link to="/predict" className="label-caps text-ink-600 hover:text-ink-900 flex items-center gap-1 transition-colors">
            All Matches <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {upcoming.map(match => {
            const h = getTeam(match.homeTeam);
            const a = getTeam(match.awayTeam);
            return (
              <Link key={match.id} to="/predict" className="card card-hover p-6 block no-underline group">
                <p className="label-caps text-ink-400 mb-4">{match.stage}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="text-4xl mb-1">{h?.flag}</div>
                    <p className="font-sans text-sm font-bold text-ink-900">{h?.name}</p>
                  </div>
                  <span className="heading-display text-2xl text-ink-400">VS</span>
                  <div className="text-center">
                    <div className="text-4xl mb-1">{a?.flag}</div>
                    <p className="font-sans text-sm font-bold text-ink-900">{a?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-ink-400">
                  <Clock size={11} strokeWidth={2} />
                  <span className="font-sans text-xs font-medium">{fmtDate(match.kickoff)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── LEADERBOARD PREVIEW ──────────────────────────────── */}
      <section className="bg-ink-900 py-12 border-t-2 border-b-2 border-ink-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-display text-3xl text-white">Top Predictors</h2>
            <Link to="/leaderboard" className="label-caps text-lime-500 hover:text-lime-400 flex items-center gap-1 transition-colors">
              Full Standings <ArrowRight size={11} />
            </Link>
          </div>

          {leaders.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="heading-display text-3xl text-ink-400">No predictions yet.</p>
              <p className="font-sans text-sm text-ink-600 mt-2">Be the first to sign up and predict!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {leaders.slice(0, 3).map((u, i) => (
                <div key={u.id} className={`card p-6 relative ${i === 0 ? 'border-lime-500' : ''}`}>
                  {i === 0 && <div className="absolute top-0 left-0 right-0 h-1 bg-lime-500" />}
                  <div className="flex items-start justify-between mb-4">
                    <span className={`heading-display text-5xl ${i === 0 ? 'text-lime-500' : i === 1 ? 'rank-2' : 'rank-3'}`}>
                      #{i + 1}
                    </span>
                    {i === 0 && <span className="badge-lime">Leader</span>}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 flex items-center justify-center font-sans font-bold text-sm ${i === 0 ? 'bg-lime-500 text-ink-900' : 'bg-white text-ink-900 border-2 border-ink-900'}`}>
                      {u.avatar_initials}
                    </div>
                    <p className="font-sans font-bold text-base text-ink-900">{u.username}</p>
                  </div>
                  <div className="bg-surface-100 border-2 border-ink-900 px-4 py-3">
                    <p className="heading-display text-4xl text-ink-900">{u.total_points}</p>
                    <p className="label-caps text-ink-400">Total Points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
