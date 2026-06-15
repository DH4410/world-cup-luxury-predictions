import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState, useEffect, useMemo } from 'react';
import { TEAMS, MATCHES, flagUrl } from '../data/mockData';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1920&q=80',
  'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1920&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&q=80',
];

function getTeam(id) { return TEAMS.find(t => t.id === id); }

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' ET';
}

function Flag({ code, size = 48 }) {
  return (
    <img
      src={flagUrl(code)}
      alt={code}
      width={size}
      height={Math.round(size * 0.67)}
      className="flag-img"
      style={{ width: size, height: 'auto', display: 'block' }}
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
}

function Countdown({ target }) {
  const [diff, setDiff] = useState(new Date(target) - Date.now());
  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(target) - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  if (diff <= 0) return <span style={{ fontFamily: 'Barlow', fontWeight: 700, color: 'var(--lime)', fontSize: '0.85rem' }}>LIVE NOW</span>;
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {[['d', d], ['h', h], ['m', m], ['s', sc]].map(([unit, val]) => (
        <div key={unit} style={{ textAlign: 'center' }}>
          <div className="display" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', color: 'var(--lime)', lineHeight: 1 }}>
            {String(val).padStart(2, '0')}
          </div>
          <div className="caps" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem' }}>{unit}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { getLeaderboard } = useApp();
  const [leaders, setLeaders] = useState([]);

  const heroImg = useMemo(() => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)], []);
  const featured = MATCHES.find(m => m.featured);
  const homeTeam = featured ? getTeam(featured.homeTeam) : null;
  const awayTeam = featured ? getTeam(featured.awayTeam) : null;
  const upcomingMatches = MATCHES.filter(m => m.status === 'upcoming').slice(0, 6);
  const completedMatches = MATCHES.filter(m => m.status === 'completed').slice(0, 3);

  useEffect(() => { getLeaderboard().then(d => setLeaders(d.slice(0, 3))); }, []);

  return (
    <main>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        background: '#0a0a0a',
      }}>
        <img src={heroImg} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(120deg, rgba(0,0,0,0.72) 35%, rgba(0,0,0,0.2) 100%)',
        }} />

        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '5rem 1.25rem 4rem', width: '100%' }}>
          <span className="badge badge-lime anim-fade-up" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            ⚽ FIFA World Cup 2026 — USA · Canada · Mexico
          </span>

          <h1 className="display anim-fade-up anim-d1" style={{
            fontSize: 'clamp(4rem, 13vw, 9.5rem)',
            color: '#fff',
            marginBottom: '0.1em', lineHeight: 0.9,
          }}>
            Predict.<br />
            <span style={{ color: 'var(--lime)' }}>Compete.</span><br />
            Win.
          </h1>

          <p className="anim-fade-up anim-d2" style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 500,
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: 440, marginTop: '1.25rem', marginBottom: '2rem', lineHeight: 1.65,
          }}>
            Pick exact scores, call the goalscorers, and go head-to-head with your mates — who really knows their football?
          </p>

          <div className="anim-fade-up anim-d3" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/predict" className="btn btn-lime" style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
              Make a Prediction <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link to="/rooms" className="btn btn-outline-light" style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
              Play with Friends
            </Link>
          </div>

          {/* Live next match countdown */}
          {featured && (
            <div className="anim-fade-up anim-d4" style={{ marginTop: '3rem', display: 'inline-flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p className="caps" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem' }}>Next big match</p>
              <Countdown target={featured.kickoff} />
              <p style={{ fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginTop: '0.15rem' }}>
                {homeTeam?.name} vs {awayTeam?.name} · {fmtDate(featured.kickoff)}
              </p>
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, transparent, var(--surface))' }} />
      </section>

      {/* ── STATS BAR ─────────────────────────────────── */}
      <div style={{ background: 'var(--black)', borderTop: '1px solid #222' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1e1e1e' }}>
          {[
            { num: '104', label: 'Matches', emoji: '⚽' },
            { num: '48',  label: 'Teams',   emoji: '🏳️' },
            { num: '3',   label: 'Host Nations', emoji: '🌎' },
            { num: '11',  label: 'Stadiums', emoji: '🏟️' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--black)', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{s.emoji}</span>
              <div>
                <span className="display" style={{ fontSize: '1.6rem', color: 'var(--lime)', display: 'block', lineHeight: 1 }}>{s.num}</span>
                <span style={{ fontFamily: 'Barlow', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BIG MATCH ─────────────────────────────────── */}
      {featured && homeTeam && awayTeam && (
        <section style={{ background: 'var(--white)', borderBottom: '1.5px solid var(--surface-3)', padding: '3.5rem 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <h2 className="display" style={{ fontSize: '2rem' }}>⚡ Big Match</h2>
              <span className="badge badge-lime">Coming Up</span>
            </div>

            <div style={{
              background: 'var(--black)',
              borderRadius: 'var(--r-xl)',
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}>
              {/* Match header */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
                padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)',
                display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem',
              }}>
                {/* Home */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 80, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flag code={homeTeam.flagCode} size={80} />
                  </div>
                  <p className="display" style={{ color: '#fff', fontSize: 'clamp(1.25rem, 4vw, 2rem)', textAlign: 'center' }}>
                    {homeTeam.name}
                  </p>
                  <span className="caps" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>Group {homeTeam.group}</span>
                </div>

                {/* VS */}
                <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
                  <p className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: 'var(--lime)', lineHeight: 1 }}>VS</p>
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.45)' }}>
                      <Clock size={11} strokeWidth={2} />
                      <span style={{ fontFamily: 'Barlow', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtTime(featured.kickoff)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.45)' }}>
                      <MapPin size={11} strokeWidth={2} />
                      <span style={{ fontFamily: 'Barlow', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{featured.city}</span>
                    </div>
                    <div style={{ marginTop: '0.25rem', background: 'rgba(200,255,0,0.12)', border: '1px solid rgba(200,255,0,0.3)', borderRadius: 4, padding: '0.2rem 0.5rem' }}>
                      <span style={{ fontFamily: 'Barlow', fontSize: '0.72rem', fontWeight: 700, color: 'var(--lime)', whiteSpace: 'nowrap' }}>{fmtDate(featured.kickoff)}</span>
                    </div>
                  </div>
                </div>

                {/* Away */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 80, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flag code={awayTeam.flagCode} size={80} />
                  </div>
                  <p className="display" style={{ color: '#fff', fontSize: 'clamp(1.25rem, 4vw, 2rem)', textAlign: 'center' }}>
                    {awayTeam.name}
                  </p>
                  <span className="caps" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>Group {awayTeam.group}</span>
                </div>
              </div>

              {/* Match footer */}
              <div style={{ background: '#0e0e0e', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <p style={{ fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
                  📍 {featured.stadium}, {featured.city}
                </p>
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <Link to="/predict" className="btn btn-lime" style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}>Predict Now</Link>
                  <Link to="/rooms" className="btn btn-outline-light" style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}>Create Room</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── UPCOMING MATCHES GRID ─────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>Group Stage</p>
            <h2 className="display" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)' }}>Upcoming Fixtures</h2>
          </div>
          <Link to="/schedule" className="btn btn-outline" style={{ padding: '0.5rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            Full Schedule <ChevronRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}>
          {upcomingMatches.map(m => {
            const ht = getTeam(m.homeTeam);
            const at = getTeam(m.awayTeam);
            return (
              <Link key={m.id} to="/predict" style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="caps" style={{ color: 'var(--grey-light)', fontSize: '0.65rem' }}>{m.stage}</span>
                    <span className="caps" style={{ color: 'var(--grey-light)', fontSize: '0.65rem' }}>{fmtDate(m.kickoff)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <Flag code={ht?.flagCode} size={26} />
                      <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.92rem', color: 'var(--black)' }}>{ht?.name}</span>
                    </div>
                    <span className="display" style={{ fontSize: '1rem', color: 'var(--grey-light)', flexShrink: 0 }}>VS</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.92rem', color: 'var(--black)', textAlign: 'right' }}>{at?.name}</span>
                      <Flag code={at?.flagCode} size={26} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--grey-light)' }}>
                    <MapPin size={10} strokeWidth={2} />
                    <span style={{ fontFamily: 'Barlow', fontSize: '0.78rem', fontWeight: 600 }}>{m.city} · {fmtTime(m.kickoff)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── RESULTS ───────────────────────────────────── */}
      {completedMatches.length > 0 && (
        <section style={{ background: 'var(--white)', borderTop: '1.5px solid var(--surface-3)', borderBottom: '1.5px solid var(--surface-3)', padding: '3rem 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 className="display" style={{ fontSize: '2rem' }}>Latest Results</h2>
              <Link to="/schedule" className="btn btn-outline" style={{ padding: '0.5rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                All Results <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {completedMatches.map(m => {
                const ht = getTeam(m.homeTeam);
                const at = getTeam(m.awayTeam);
                return (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center',
                    gap: '1rem', padding: '0.875rem 1.25rem',
                    background: 'var(--surface)', border: '1.5px solid var(--surface-3)',
                    borderRadius: 'var(--r-md)', flexWrap: 'wrap',
                  }}>
                    <span className="caps" style={{ color: 'var(--grey-light)', fontSize: '0.65rem', minWidth: 70 }}>{m.stage}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 100 }}>
                      <Flag code={ht?.flagCode} size={22} />
                      <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.88rem', color: 'var(--black)' }}>{ht?.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="display" style={{ fontSize: '1.5rem', minWidth: 50, textAlign: 'center' }}>
                        {m.result.homeScore}–{m.result.awayScore}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 100, justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.88rem', color: 'var(--black)' }}>{at?.name}</span>
                      <Flag code={at?.flagCode} size={22} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Barlow', fontSize: '0.78rem', fontWeight: 600, color: 'var(--grey)', whiteSpace: 'nowrap' }}>⚽ {m.result.scorer}</span>
                      <span style={{ fontFamily: 'Barlow', fontSize: '0.78rem', fontWeight: 600, color: 'var(--grey)', whiteSpace: 'nowrap' }}>🏅 {m.result.motm}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW TO PLAY ───────────────────────────────── */}
      <section style={{ background: 'var(--black)', padding: '4rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p className="caps" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '0.4rem' }}>How it works</p>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff' }}>Three Steps to Glory</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '01', emoji: '🎯', title: 'Pick Your Scores', desc: 'Predict exact scorelines, goalscorers, assists, and man of the match for every fixture.', link: '/predict' },
              { step: '02', emoji: '👥', title: 'Challenge Your Mates', desc: 'Set up a private room, share the code, and build your own mini-league leaderboard.', link: '/rooms' },
              { step: '03', emoji: '🏆', title: 'Climb the Table', desc: 'Earn 5 pts for exact scores, 2 for correct results, and more. The top predictor takes glory.', link: '/leaderboard' },
            ].map((f, i) => (
              <Link key={f.step} to={f.link} style={{ textDecoration: 'none' }}>
                <div style={{
                  border: '1.5px solid #222', borderRadius: 'var(--r-xl)',
                  padding: '2rem', height: '100%',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lime-dark)'; e.currentTarget.style.background = '#161616'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '2rem' }}>{f.emoji}</span>
                    <span className="display" style={{ fontSize: '3.5rem', color: '#1e1e1e', lineHeight: 1 }}>{f.step}</span>
                  </div>
                  <p className="display" style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.6rem' }}>{f.title}</p>
                  <p style={{ fontFamily: 'Barlow', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.desc}</p>
                  <p className="caps" style={{ color: 'var(--lime-dark)', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem' }}>
                    Get going <ArrowRight size={11} strokeWidth={3} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP PREDICTORS ────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>🏆 Who's winning?</p>
            <h2 className="display" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)' }}>Top Predictors</h2>
          </div>
          <Link to="/leaderboard" className="btn btn-outline" style={{ padding: '0.5rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            Full Rankings <ArrowRight size={13} />
          </Link>
        </div>

        {leaders.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</p>
            <p className="display" style={{ fontSize: '2rem', color: 'var(--grey-light)', marginBottom: '0.5rem' }}>No players yet</p>
            <p style={{ fontFamily: 'Barlow', color: 'var(--grey-light)', marginBottom: '1.25rem' }}>Be first to sign up and make your mark!</p>
            <Link to="/predict" className="btn btn-lime" style={{ display: 'inline-flex' }}>
              Start Predicting <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {leaders.map((u, i) => (
              <div key={u.id} className="card-flat anim-fade-up" style={{
                padding: '1.5rem', animationDelay: `${i * 0.1}s`,
                borderColor: i === 0 ? 'var(--lime-dark)' : 'var(--surface-3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="display" style={{
                    fontSize: '2.5rem',
                    color: i === 0 ? 'var(--lime-dark)' : i === 1 ? 'var(--grey-light)' : '#CD7F32',
                  }}>#{i + 1}</span>
                  {i === 0 && <span className="badge badge-lime">🥇 Leader</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: i === 0 ? 'var(--lime)' : 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Barlow', fontWeight: 800, fontSize: '0.85rem',
                    color: i === 0 ? 'var(--black)' : 'var(--grey)',
                  }}>{u.avatar_initials}</div>
                  <div>
                    <p style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.95rem', color: 'var(--black)' }}>{u.username}</p>
                    <p className="caps" style={{ color: 'var(--grey-light)' }}>{u.total_points} pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── POINTS SCORING ────────────────────────────── */}
      <div style={{ background: 'var(--black)', padding: '1.5rem 0', borderTop: '1px solid #1e1e1e' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1e1e1e' }}>
          {[
            { pts: 5, label: 'Exact score', emoji: '🎯' },
            { pts: 2, label: 'Correct result', emoji: '✅' },
            { pts: 2, label: 'Goalscorer', emoji: '⚽' },
            { pts: 1, label: 'Assist / MOTM', emoji: '🏅' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--black)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
              <div>
                <span className="display" style={{ fontSize: '1.6rem', color: 'var(--lime)', display: 'block', lineHeight: 1 }}>{item.pts}pts</span>
                <span style={{ fontFamily: 'Barlow', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}
