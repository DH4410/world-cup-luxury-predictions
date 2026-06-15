import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, Trophy, Clock, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { TEAMS, MATCHES, flagUrl } from '../data/mockData';

const HERO_IMG = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80';

function getTeam(id) { return TEAMS.find(t => t.id === id); }

function fmtKickoff(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' ET';
}

// ── Flag image component ──────────────────────────────
function Flag({ code, size = 48 }) {
  return (
    <img
      src={flagUrl(code)}
      alt={code}
      width={size}
      height={Math.round(size * 0.67)}
      className="flag-img"
      style={{ width: size, height: 'auto' }}
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
}

// ── Feature cards data ────────────────────────────────
const FEATURES = [
  {
    icon: Target,
    title: 'Predict Matches',
    desc: 'Pick exact scores, goalscorers, and more for every World Cup game.',
    color: '#C8FF00',
    link: '/predict',
  },
  {
    icon: Users,
    title: 'Play with Friends',
    desc: 'Create a private room, share the code, and compete on your own leaderboard.',
    color: '#C8FF00',
    link: '/rooms',
  },
  {
    icon: Trophy,
    title: 'Climb the Rankings',
    desc: 'Earn points for every correct call and rise through the global standings.',
    color: '#C8FF00',
    link: '/leaderboard',
  },
];

export default function Home() {
  const { getLeaderboard } = useApp();
  const [leaders, setLeaders] = useState([]);
  const featured = MATCHES.find(m => m.featured);
  const homeTeam = featured ? getTeam(featured.homeTeam) : null;
  const awayTeam = featured ? getTeam(featured.awayTeam) : null;

  useEffect(() => { getLeaderboard().then(d => setLeaders(d.slice(0, 3))); }, []);

  return (
    <main>

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        background: '#111',
      }}>
        {/* Stadium photo */}
        <img
          src={HERO_IMG} alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(17,17,17,0.9) 40%, rgba(17,17,17,0.6) 100%)' }} />

        {/* Content */}
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '5rem 1.25rem 4rem', width: '100%' }}>
          <span className="badge badge-lime anim-fade-up" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            ⚽ FIFA World Cup 2026
          </span>

          <h1 className="display anim-fade-up anim-d1" style={{
            fontSize: 'clamp(4rem, 13vw, 9.5rem)',
            color: '#fff',
            marginBottom: '0.1em',
          }}>
            Predict.<br />
            <span style={{ color: 'var(--lime)' }}>Compete.</span><br />
            Win.
          </h1>

          <p className="anim-fade-up anim-d2" style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 500,
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: 'rgba(255,255,255,0.65)',
            maxWidth: 420, marginTop: '1.25rem', marginBottom: '2rem',
            lineHeight: 1.65,
          }}>
            Score points for every correct prediction. Challenge your friends. Rule the leaderboard.
          </p>

          <div className="anim-fade-up anim-d3" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/predict" className="btn btn-lime" style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
              Start Predicting <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link to="/rooms" className="btn btn-outline-light" style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
              Create a Room
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, transparent, var(--surface))' }} />
      </section>

      {/* ════════════════════════════════════════════════
          FEATURES — 3 cards
      ════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.5rem' }}>How it works</p>
          <h2 className="display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--black)' }}>
            Three Simple Steps
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Link key={f.title} to={f.link} className="card anim-fade-up" style={{ animationDelay: `${i * 0.1}s`, padding: '2rem', textDecoration: 'none', display: 'block' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--r-md)',
                  background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <Icon size={22} color="var(--black)" strokeWidth={2.5} />
                </div>
                <p className="display" style={{ fontSize: '1.6rem', color: 'var(--black)', marginBottom: '0.5rem' }}>{f.title}</p>
                <p style={{ fontFamily: 'Barlow', fontSize: '0.95rem', color: 'var(--grey)', lineHeight: 1.6 }}>{f.desc}</p>
                <p className="caps" style={{ color: 'var(--lime-dark)', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Get started <ArrowRight size={11} strokeWidth={3} />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURED MATCH
      ════════════════════════════════════════════════ */}
      {featured && homeTeam && awayTeam && (
        <section style={{ background: 'var(--white)', borderTop: '1.5px solid var(--surface-3)', borderBottom: '1.5px solid var(--surface-3)', padding: '3.5rem 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <h2 className="display" style={{ fontSize: '2rem' }}>Big Match</h2>
              <span className="badge badge-lime">Today</span>
            </div>

            <div style={{
              background: 'var(--black)', borderRadius: 'var(--r-xl)',
              padding: 'clamp(1.5rem, 4vw, 3rem)',
              display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1.5rem',
            }}>
              {/* Home team */}
              <div style={{ textAlign: 'center' }}>
                <Flag code={homeTeam.flagCode} size={80} />
                <p className="display" style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginTop: '0.75rem' }}>
                  {homeTeam.name}
                </p>
                <p className="caps" style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>{featured.stage}</p>
              </div>

              {/* VS */}
              <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                <p className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: 'var(--lime)', lineHeight: 1 }}>VS</p>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                    <Clock size={11} strokeWidth={2} />
                    <span style={{ fontFamily: 'Barlow', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtKickoff(featured.kickoff)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                    <MapPin size={11} strokeWidth={2} />
                    <span style={{ fontFamily: 'Barlow', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{featured.city}</span>
                  </div>
                </div>
              </div>

              {/* Away team */}
              <div style={{ textAlign: 'center' }}>
                <Flag code={awayTeam.flagCode} size={80} />
                <p className="display" style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginTop: '0.75rem' }}>
                  {awayTeam.name}
                </p>
                <p className="caps" style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>{featured.city}</p>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/predict" className="btn btn-lime">Predict This Match <ArrowRight size={14} /></Link>
              <Link to="/rooms" className="btn btn-outline">Create a Room</Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          LEADERBOARD SNAPSHOT
      ════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>Who's winning?</p>
            <h2 className="display" style={{ fontSize: '2rem' }}>Top Predictors</h2>
          </div>
          <Link to="/leaderboard" className="btn btn-outline" style={{ padding: '0.5rem 1.1rem', fontSize: '0.8rem' }}>
            Full Rankings <ArrowRight size={13} />
          </Link>
        </div>

        {leaders.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="display" style={{ fontSize: '2rem', color: 'var(--grey-light)' }}>No players yet</p>
            <p style={{ fontFamily: 'Barlow', color: 'var(--grey-light)', marginTop: '0.5rem' }}>Be the first to sign up and predict!</p>
            <Link to="/predict" className="btn btn-lime" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
              Start Now <ArrowRight size={14} />
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
                  {i === 0 && <span className="badge badge-lime">Leader</span>}
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

      {/* ════════════════════════════════════════════════
          POINTS STRIP (minimal, at the bottom)
      ════════════════════════════════════════════════ */}
      <div style={{ background: 'var(--black)', padding: '1.5rem 0', borderTop: '1.5px solid #222' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#333' }}>
          {[
            { pts: 5, label: 'Exact score' },
            { pts: 2, label: 'Correct result' },
            { pts: 2, label: 'Goalscorer' },
            { pts: 1, label: 'Assist / MOTM' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--black)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="display" style={{ fontSize: '2rem', color: 'var(--lime)' }}>{item.pts}</span>
              <span style={{ fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}
