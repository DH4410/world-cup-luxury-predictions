import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Target, Trophy, BarChart3, Newspaper, Clock, Goal, Users, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState, useEffect, useMemo } from 'react';
import { fetchUpcoming, fetchNextFeatured, fetchNews } from '../lib/espnApi';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=2000&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=2000&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=2000&q=80',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=2000&q=80',
  'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=2000&q=80',
];
const PITCH_IMAGES = [
  'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1600&q=80',
  'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1600&q=80',
  'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1600&q=80',
  'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=1600&q=80',
  'https://images.unsplash.com/photo-1602674809970-1e7196e08be5?w=1600&q=80',
];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function initials(name) { return name.split(' ').map(p => p[0]).slice(0, 2).join(''); }

function fmtKickoff(iso) {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day0 = new Date(d); day0.setHours(0, 0, 0, 0);
  const diffDays = Math.round((day0 - today) / 86400000);
  const label =
    diffDays === 0 ? 'Today' :
    diffDays === 1 ? 'Tomorrow' :
    d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${label}, ${time}`;
}

function TeamLogo({ src, alt, size = 28 }) {
  if (!src) return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--surface-2)' }} />;
  return <img src={src} alt={alt} style={{ width: size, height: size, objectFit: 'contain' }} onError={e => { e.target.style.visibility = 'hidden'; }} />;
}

function ScoreboardCountdown({ target }) {
  const [diff, setDiff] = useState(new Date(target) - Date.now());
  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(target) - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.max(0, Math.floor(diff / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  const pad = v => String(v).padStart(2, '0');
  const blocks = [['Days', d], ['Hrs', h], ['Mins', m], ['Secs', sc]];

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'stretch',
      background: 'rgba(20,32,26,0.92)', color: 'var(--pitch)',
      borderRadius: 6, overflow: 'hidden',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 12px 40px rgba(20,32,26,0.25)',
    }}>
      <div style={{ padding: '0.9rem 1.1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(182,232,75,0.18)', borderRight: '1px solid rgba(245,248,236,0.12)' }}>
        <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--turf)' }}>Kickoff in</span>
        <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '0.62rem', color: 'rgba(245,248,236,0.65)', marginTop: 3 }}>Next fixture</span>
      </div>
      {blocks.map(([unit, val], i) => (
        <div key={unit} style={{
          padding: '0.9rem 1rem', minWidth: 66, textAlign: 'center',
          borderLeft: i === 0 ? 'none' : '1px solid rgba(245,248,236,0.12)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <span className="h-mono" style={{ fontSize: '1.7rem', fontWeight: 700, lineHeight: 1, color: 'var(--turf)' }}>{pad(val)}</span>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '0.62rem', color: 'rgba(245,248,236,0.55)', marginTop: 5, letterSpacing: '0.04em' }}>{unit}</span>
        </div>
      ))}
    </div>
  );
}

const SPORT_TABS = ['All', 'World Cup', 'Football', 'Basketball', 'Tennis', 'Cricket'];

export default function Home() {
  const { getLeaderboard, matches: allMatches, teams } = useApp();
  const [leaders, setLeaders] = useState([]);
  const [tab, setTab] = useState('All');
  const [matches, setMatches] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);

  const heroBg = useMemo(() => pick(HERO_IMAGES), []);
  const pitchBg = useMemo(() => pick(PITCH_IMAGES), []);

  useEffect(() => { getLeaderboard().then(d => setLeaders(d.slice(0, 5))); }, []);
  useEffect(() => { fetchNews(3).then(setNews).catch(() => {}); }, []);

  // Live "tournament at a glance" stats
  const stats = useMemo(() => {
    const completed = allMatches.filter(m => m.status === 'completed' && m.result);
    const goals = completed.reduce((s, m) => s + (m.result.homeScore || 0) + (m.result.awayScore || 0), 0);
    return {
      played: completed.length,
      total: allMatches.length,
      goals,
      avgGoals: completed.length ? (goals / completed.length).toFixed(1) : '—',
      teams: teams.length,
    };
  }, [allMatches, teams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [upcoming, next] = await Promise.all([
          fetchUpcoming(4),
          fetchNextFeatured(),
        ]);
        if (cancelled) return;
        setMatches(upcoming);
        setFeatured(next);
      } catch (err) {
        console.error('ESPN fetch failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main style={{ background: 'var(--pitch)', color: 'var(--ink)' }}>

      {/* HERO */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        borderBottom: '1.5px solid var(--chalk)',
        minHeight: 620,
      }}>
        {/* Blurred photographic background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(14px) saturate(1.05)',
          transform: 'scale(1.1)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(245,248,236,0.96) 0%, rgba(245,248,236,0.86) 45%, rgba(245,248,236,0.55) 75%, rgba(245,248,236,0.25) 100%)',
        }} />

        <div style={{
          position: 'relative',
          maxWidth: 1440, margin: '0 auto',
          padding: '4.5rem 1.5rem 4rem',
          display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2.5rem', alignItems: 'center',
        }}>
          <div>
            <div className="anim-fade-up" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--turf-deep)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 28, height: 1.5, background: 'var(--turf-deep)' }} />
              FIFA World Cup 2026
            </div>

            <h1 className="h-display anim-fade-up anim-d1" style={{
              fontSize: 'clamp(2.75rem, 7vw, 5rem)',
              color: 'var(--ink)',
              marginBottom: '1.25rem',
            }}>
              Predict the cup.<br />
              Top the table.
            </h1>

            <p className="h-body anim-fade-up anim-d2" style={{
              fontSize: '1.05rem', color: 'var(--grey)', maxWidth: 460, marginBottom: '2rem',
            }}>
              Call the scores, pick the scorers, and stack points across the whole tournament. Free to play, week by week.
            </p>

            <div className="anim-fade-up anim-d3" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.25rem' }}>
              <Link to="/predict" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--ink)', color: 'var(--pitch)',
                padding: '0.95rem 1.7rem', borderRadius: 4,
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.92rem',
              }}>
                Make a prediction <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
              <Link to="/schedule" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.7)', color: 'var(--ink)',
                padding: '0.95rem 1.7rem', borderRadius: 4,
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.92rem',
                border: '1.5px solid var(--ink)',
                backdropFilter: 'blur(4px)',
              }}>
                View the bracket
              </Link>
            </div>

            {featured && <div className="anim-fade-up anim-d4"><ScoreboardCountdown target={featured.kickoff} /></div>}
          </div>

          {/* Hero card: featured match photo */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%', maxWidth: 440, aspectRatio: '4 / 5',
              borderRadius: 10, overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(20,32,26,0.25)',
              position: 'relative',
            }}>
              <img src={pitchBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,32,26,0.85) 0%, rgba(20,32,26,0.3) 50%, rgba(20,32,26,0.1) 100%)' }} />

              {featured && featured.home && featured.away && (
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '1.5rem' }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--turf)' }}>
                    {featured.group ? `Group ${featured.group}` : 'Next up'} · {featured.venue || featured.city || ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                      <TeamLogo src={featured.home.logo} alt={featured.home.name} size={38} />
                      <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1.05rem', color: 'var(--pitch)' }}>{featured.home.name}</span>
                    </div>
                    <span className="h-mono" style={{ fontSize: '0.95rem', color: 'rgba(245,248,236,0.55)' }}>vs</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1.05rem', color: 'var(--pitch)', textAlign: 'right' }}>{featured.away.name}</span>
                      <TeamLogo src={featured.away.logo} alt={featured.away.name} size={38} />
                    </div>
                  </div>
                  <p className="h-mono" style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: 'rgba(245,248,236,0.7)' }}>
                    {fmtKickoff(featured.kickoff)} {featured.broadcast ? `· ${featured.broadcast}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PREDICT EARN COMPETE + WHAT YOU CAN PREDICT */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '2.5rem 1.5rem 1rem' }}>
        <div style={{ background: 'var(--white)', border: '1.5px solid var(--chalk)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '1.75rem 2.25rem 1.5rem' }}>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)', textAlign: 'center', marginBottom: '1.5rem' }}>
              Predict. Earn. Compete.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
              {[
                { icon: Target,    title: 'Make predictions', desc: 'Predict on scores, goal scorers, assisters and more.' },
                { icon: Trophy,    title: 'Earn points',      desc: 'Get points for correct predictions and bonuses.' },
                { icon: BarChart3, title: 'Climb the leaderboard', desc: 'Compete with others and win exciting rewards.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--lime-faint)', border: '1.5px solid var(--turf)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} strokeWidth={2.2} color="var(--ink)" />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', marginBottom: 4 }}>{title}</p>
                    <p className="h-body" style={{ fontSize: '0.86rem', color: 'var(--grey)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction types strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            background: 'var(--surface)', borderTop: '1.5px solid var(--chalk)',
          }}>
            {[
              { label: 'Exact score',        pts: '+5 pts' },
              { label: 'Correct outcome',    pts: '+2 pts' },
              { label: 'Goal scorer',        pts: '+2 pts' },
              { label: 'Assister / MOTM',    pts: '+1 pt'  },
            ].map((c, i) => (
              <div key={c.label} style={{
                padding: '0.95rem 1rem',
                borderRight: i < 3 ? '1.5px solid var(--chalk)' : 'none',
                textAlign: 'center',
              }}>
                <p className="h-mono" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.04em' }}>{c.pts}</p>
                <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.78rem', color: 'var(--grey)', marginTop: 2 }}>{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOURNAMENT AT A GLANCE */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '1.25rem 1.5rem 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem',
        }}>
          {[
            { icon: Clock,    label: 'Matches played', value: `${stats.played}`, sub: `of ${stats.total}` },
            { icon: Goal,     label: 'Goals scored',   value: `${stats.goals}`,  sub: `${stats.avgGoals} per match` },
            { icon: Users,    label: 'Teams competing', value: `${stats.teams}`, sub: 'across 12 groups' },
            { icon: Activity, label: 'Live now',        value: featured ? '1' : '0', sub: 'kickoffs in 24 hours' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="lift" style={{
              background: 'var(--white)', border: '1.5px solid var(--chalk)',
              borderRadius: 10, padding: '1rem 1.1rem',
              display: 'flex', alignItems: 'center', gap: '0.85rem',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--lime-faint)', border: '1.5px solid var(--turf)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={17} strokeWidth={2.3} color="var(--turf-deep)" />
              </div>
              <div>
                <p className="h-mono" style={{ fontSize: '0.62rem', color: 'var(--grey-light)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</p>
                <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.6rem', color: 'var(--ink)', lineHeight: 1 }}>{value}</p>
                <p style={{ fontFamily: 'Inter', fontSize: '0.74rem', color: 'var(--grey)', marginTop: 2 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MATCHES + PREDICTORS */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '1.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>

          {/* Fixtures */}
          <div style={{ background: 'var(--white)', border: '1.5px solid var(--chalk)', borderRadius: 6, padding: '1.5rem 1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>Upcoming matches</h3>
              <Link to="/schedule" style={{ fontFamily: 'Inter', fontSize: '0.82rem', fontWeight: 600, color: 'var(--turf-deep)', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all matches <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1.5px solid var(--chalk)', margin: '1rem 0 0.25rem', overflowX: 'auto' }}>
              {SPORT_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.7rem 0',
                  fontFamily: 'Inter', fontWeight: 600, fontSize: '0.84rem',
                  color: tab === t ? 'var(--ink)' : 'var(--grey-light)',
                  borderBottom: tab === t ? '2.5px solid var(--turf)' : '2.5px solid transparent',
                  marginBottom: '-1.5px', whiteSpace: 'nowrap',
                }}>{t}</button>
              ))}
            </div>

            <div>
              {loading && (
                <div style={{ padding: '2.5rem 0', textAlign: 'center', fontFamily: 'Inter', fontSize: '0.88rem', color: 'var(--grey-light)' }}>
                  Loading fixtures from ESPN…
                </div>
              )}

              {!loading && matches.length === 0 && (
                <div style={{ padding: '2.5rem 0', textAlign: 'center', fontFamily: 'Inter', fontSize: '0.88rem', color: 'var(--grey-light)' }}>
                  No upcoming fixtures in range.
                </div>
              )}

              {matches.map((m, idx) => (
                <div key={m.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 28px 1fr auto',
                  alignItems: 'center', gap: '0.9rem',
                  padding: '1rem 0',
                  borderBottom: idx < matches.length - 1 ? '1px solid var(--surface-2)' : 'none',
                }}>
                  <div>
                    <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--turf-deep)' }}>
                      {m.group ? `Group ${m.group}` : 'World Cup'}
                    </p>
                    <p className="h-mono" style={{ fontSize: '0.74rem', color: 'var(--grey)', marginTop: 2 }}>{fmtKickoff(m.kickoff)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <TeamLogo src={m.home?.logo} alt={m.home?.name} size={26} />
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>{m.home?.name}</span>
                  </div>
                  <span className="h-mono" style={{ fontSize: '0.78rem', color: 'var(--grey-light)', textAlign: 'center' }}>vs</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <TeamLogo src={m.away?.logo} alt={m.away?.name} size={26} />
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>{m.away?.name}</span>
                  </div>
                  <Link to="/predict" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'var(--turf)', color: 'var(--ink)',
                    padding: '0.55rem 1.1rem', borderRadius: 4,
                    fontFamily: 'Inter', fontWeight: 700, fontSize: '0.78rem',
                  }}>
                    Predict now
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ background: 'var(--white)', border: '1.5px solid var(--chalk)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)', marginBottom: '1rem' }}>Top predictors</h3>

              {leaders.length === 0 ? (
                <p className="h-body" style={{ fontSize: '0.85rem', color: 'var(--grey-light)', padding: '1rem 0', textAlign: 'center' }}>No players yet. Be first.</p>
              ) : (
                <div>
                  {leaders.map((u, i) => (
                    <div key={u.id} style={{
                      display: 'grid', gridTemplateColumns: '22px 30px 1fr auto',
                      alignItems: 'center', gap: '0.7rem',
                      padding: '0.7rem 0',
                      borderBottom: i < leaders.length - 1 ? '1px solid var(--surface-2)' : 'none',
                    }}>
                      <span className="h-mono" style={{
                        fontSize: '0.85rem', fontWeight: 700,
                        color: i === 0 ? 'var(--ink)' : 'var(--grey-light)',
                      }}>{i + 1}</span>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: i === 0 ? 'var(--card-yellow)' : 'var(--surface-2)',
                        border: '1.5px solid var(--chalk)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Inter', fontWeight: 800, fontSize: '0.68rem',
                        color: 'var(--ink)',
                      }}>{u.avatar_initials}</div>
                      <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.88rem', color: 'var(--ink)' }}>{u.username}</span>
                      <span className="h-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>{u.total_points.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/leaderboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: '0.85rem',
                fontFamily: 'Inter', fontSize: '0.82rem', fontWeight: 600, color: 'var(--turf-deep)',
              }}>
                View leaderboard <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>

            {/* News */}
            <div style={{ background: 'var(--white)', border: '1.5px solid var(--chalk)', borderRadius: 6, padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Newspaper size={15} strokeWidth={2.3} color="var(--turf-deep)" /> News
                </h3>
                <Link to="/insights" style={{ fontFamily: 'Inter', fontSize: '0.74rem', fontWeight: 700, color: 'var(--turf-deep)' }}>
                  All news →
                </Link>
              </div>
              {news.length === 0 ? (
                <p className="h-body" style={{ fontSize: '0.82rem', color: 'var(--grey-light)' }}>Loading headlines…</p>
              ) : news.map((n, i) => (
                <a key={n.id} href={n.link} target="_blank" rel="noreferrer" style={{
                  display: 'flex', gap: '0.7rem',
                  padding: '0.6rem 0',
                  borderBottom: i < news.length - 1 ? '1px solid var(--surface-2)' : 'none',
                  color: 'inherit',
                }}>
                  {n.image && (
                    <img src={n.image} alt="" style={{
                      width: 60, height: 44, objectFit: 'cover', borderRadius: 4, flexShrink: 0,
                    }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.82rem', color: 'var(--ink)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.headline}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Rewards */}
            <div style={{
              position: 'relative', overflow: 'hidden',
              border: '1.5px solid var(--chalk)', borderRadius: 6, padding: '1.5rem',
              minHeight: 200,
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=80)`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'blur(2px) brightness(0.55)',
                transform: 'scale(1.05)',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(20,32,26,0.85) 0%, rgba(20,32,26,0.55) 100%)',
              }} />
              <div style={{ position: 'relative' }}>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--turf)' }}>Exclusive rewards</span>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1.15rem', color: 'var(--pitch)', marginTop: 6, marginBottom: '0.65rem', maxWidth: 200, lineHeight: 1.25 }}>
                  Win exciting prizes and bragging rights.
                </p>
                <Link to="/rewards" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--turf)', color: 'var(--ink)',
                  padding: '0.55rem 1.1rem', borderRadius: 4,
                  fontFamily: 'Inter', fontWeight: 700, fontSize: '0.78rem',
                }}>
                  See rewards <ArrowRight size={12} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
