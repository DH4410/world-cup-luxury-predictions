import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { TEAMS } from '../data/mockData';

// Free Unsplash images — no API key needed at these sizes
const STADIUM_IMG = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=80';

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
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          background: '#0D1F0D',
          backgroundImage: `linear-gradient(to bottom, rgba(13,31,13,0.72) 0%, rgba(13,31,13,0.88) 100%), url(${STADIUM_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* Top lime line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--lime)' }} />

        {/* Big watermark */}
        <div style={{
          position: 'absolute', right: '-2rem', top: '50%', transform: 'translateY(-55%)',
          fontSize: 'clamp(14rem, 35vw, 28rem)', lineHeight: 1,
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          color: 'rgba(255,255,255,0.04)',
          userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.02em',
        }}>26</div>

        <div className="max-w-7xl mx-auto px-4 lg:px-10 py-16 lg:py-24 w-full" style={{ position: 'relative' }}>
          {/* Tag */}
          <div
            className="animate-fade-up"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--lime)', padding: '0.3rem 0.85rem',
              borderRadius: 6, marginBottom: '1.5rem',
            }}
          >
            <Zap size={11} fill="currentColor" />
            <span className="label-caps" style={{ color: 'var(--ink)', fontSize: '0.65rem' }}>
              FIFA World Cup 2026 — Live Prediction Game
            </span>
          </div>

          {/* Headline */}
          <h1
            className="heading-display animate-fade-up animate-delay-100"
            style={{ color: '#fff', fontSize: 'clamp(4rem, 12vw, 9rem)', lineHeight: 0.9, marginBottom: '1.25rem' }}
          >
            Predict.<br />
            <span style={{ color: 'var(--lime)' }}>Compete.</span><br />
            Dominate.
          </h1>

          <p
            className="animate-fade-up animate-delay-200"
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 480, marginBottom: '2rem', lineHeight: 1.65 }}
          >
            Submit exact scorelines, name goalscorers, create private rooms, and climb the global leaderboard. Real matches. Real stakes.
          </p>

          <div className="animate-fade-up animate-delay-300" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link to="/predict" className="btn-primary" style={{ fontSize: '0.9rem' }}>
              Make a Prediction <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link to="/rooms" className="btn-ghost-light" style={{ fontSize: '0.9rem' }}>
              Create a Room <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SCORING STRIP ─────────────────────────────────── */}
      <div style={{ background: 'var(--lime)', borderTop: '2px solid var(--ink)', borderBottom: '2px solid var(--ink)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', divideX: true }}>
            {[
              { pts: 5, label: 'Exact Score' },
              { pts: 2, label: 'Correct Result' },
              { pts: 2, label: 'Goalscorer' },
              { pts: 1, label: 'Assist / MOTM' },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  padding: '0.85rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  borderRight: i < 3 ? '2px solid var(--ink)' : 'none',
                }}
              >
                <span className="heading-display" style={{ fontSize: '1.75rem', color: 'var(--ink)' }}>{item.pts}pts</span>
                <span className="label-caps" style={{ color: 'var(--ink-mid)', display: 'none' }}>{item.label}</span>
                <span className="label-caps hidden sm:block" style={{ color: 'rgba(15,15,15,0.6)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED MATCH ────────────────────────────────── */}
      {featured && home && away && (
        <section className="max-w-7xl mx-auto px-4 lg:px-10 py-12">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <h2 className="heading-display" style={{ fontSize: '2rem' }}>Featured Match</h2>
            <span className="badge-lime">Today</span>
          </div>

          <div className="card card-hover animate-fade-up" style={{ overflow: 'hidden' }}>
            {/* Dark match header */}
            <div style={{ background: 'var(--pitch)', padding: '2.5rem 3rem' }}>
              <p className="label-caps" style={{ color: 'var(--lime)', marginBottom: '1.5rem' }}>{featured.stage}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>{home.flag}</div>
                  <p className="heading-display" style={{ color: '#fff', fontSize: '1.75rem' }}>{home.name}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p className="heading-display" style={{ color: 'var(--lime)', fontSize: '3.5rem' }}>VS</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>{away.flag}</div>
                  <p className="heading-display" style={{ color: '#fff', fontSize: '1.75rem' }}>{away.name}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.6)' }}>
                  <MapPin size={13} strokeWidth={2} />
                  <span style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 500 }}>{featured.stadium}, {featured.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.6)' }}>
                  <Clock size={13} strokeWidth={2} />
                  <span style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 500 }}>{fmtDate(featured.kickoff)}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', borderTop: '2px solid var(--ink)', background: '#fff' }}>
              <Link to="/predict" className="btn-primary">Predict This Match <ArrowRight size={14} /></Link>
              <Link to="/rooms" className="btn-ghost">Create a Room</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── UPCOMING FIXTURES ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-10 pb-12">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 className="heading-display" style={{ fontSize: '2rem' }}>Upcoming Fixtures</h2>
          <Link to="/predict" className="label-caps" style={{ color: 'var(--ink-soft)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            All Matches <ArrowRight size={11} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {upcoming.map(match => {
            const h = getTeam(match.homeTeam);
            const a = getTeam(match.awayTeam);
            return (
              <Link key={match.id} to="/predict" className="card card-hover animate-fade-up" style={{ padding: '1.5rem', textDecoration: 'none', display: 'block' }}>
                <p className="label-caps" style={{ color: 'var(--ink-soft)', marginBottom: '1rem' }}>{match.stage}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{h?.flag}</div>
                    <p style={{ fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>{h?.name}</p>
                  </div>
                  <span className="heading-display" style={{ fontSize: '1.5rem', color: 'var(--ink-soft)' }}>VS</span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{a?.flag}</div>
                    <p style={{ fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>{a?.name}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--ink-soft)' }}>
                  <Clock size={11} strokeWidth={2} />
                  <span style={{ fontFamily: 'Barlow', fontSize: '0.8rem', fontWeight: 500 }}>{fmtDate(match.kickoff)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── LEADERBOARD PREVIEW ───────────────────────────── */}
      <section style={{ background: '#0D1F0D', padding: '4rem 0', borderTop: '2px solid var(--ink)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2 className="heading-display" style={{ fontSize: '2.5rem', color: '#fff' }}>Top Predictors</h2>
            <Link to="/leaderboard" className="label-caps" style={{ color: 'var(--lime)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Full Standings <ArrowRight size={11} />
            </Link>
          </div>

          {leaders.length === 0 ? (
            <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
              <p className="heading-display" style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.4)' }}>No predictions yet.</p>
              <p style={{ fontFamily: 'Barlow', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>Be the first to sign up!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {leaders.slice(0, 3).map((u, i) => (
                <div
                  key={u.id}
                  className="animate-fade-up glass card-hover"
                  style={{
                    padding: '1.5rem',
                    animationDelay: `${i * 0.1}s`,
                    border: i === 0 ? '2px solid var(--lime)' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="heading-display" style={{
                      fontSize: '3.5rem',
                      color: i === 0 ? 'var(--lime)' : i === 1 ? '#AAAAAA' : '#CD7F32',
                    }}>#{i + 1}</span>
                    {i === 0 && <span className="badge-lime">Leader</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i === 0 ? 'var(--lime)' : 'rgba(255,255,255,0.1)',
                      fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.9rem',
                      color: i === 0 ? 'var(--ink)' : '#fff',
                    }}>{u.avatar_initials}</div>
                    <p style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{u.username}</p>
                  </div>
                  <div style={{
                    background: 'rgba(0,0,0,0.3)', borderRadius: 8,
                    padding: '0.75rem 1rem',
                  }}>
                    <p className="heading-display" style={{ fontSize: '2.5rem', color: i === 0 ? 'var(--lime)' : '#fff' }}>{u.total_points}</p>
                    <p className="label-caps" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem' }}>Total Points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SCORING GUIDE ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-10 py-14">
        <h2 className="heading-display" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>How Points Work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { pts: 5, label: 'Exact Scoreline', desc: 'Nail the precise full-time score' },
            { pts: 2, label: 'Correct Result', desc: 'Win/draw/loss direction right' },
            { pts: 2, label: 'Goalscorer', desc: 'First or anytime goal name' },
            { pts: 1, label: 'Assist / MOTM', desc: 'Assist maker or Man of the Match' },
          ].map(item => (
            <div key={item.label} className="card card-hover animate-fade-up" style={{ padding: '1.5rem' }}>
              <p className="heading-display" style={{ fontSize: '3.5rem', color: 'var(--lime-dark)', marginBottom: 0 }}>{item.pts}</p>
              <p className="label-caps" style={{ color: 'var(--ink-soft)', marginBottom: '0.5rem' }}>pts</p>
              <p style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.label}</p>
              <p style={{ fontFamily: 'Barlow', fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
