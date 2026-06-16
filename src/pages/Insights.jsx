import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Activity, Award, Handshake, ExternalLink, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchTopScorers } from '../lib/wcApi';
import { fetchNews } from '../lib/espnApi';
import { flagUrl } from '../data/mockData';

function flagFor(team) {
  if (team?.flag) return team.flag;
  if (team?.flagCode) return flagUrl(team.flagCode);
  return null;
}
function Flag({ team, size = 22 }) {
  const src = flagFor(team);
  if (!src) return <div style={{ width: size, height: size * 0.66, background: 'var(--surface-2)', borderRadius: 2 }} />;
  return <img src={src} alt={team?.code || ''} style={{ width: size, height: 'auto', borderRadius: 2 }} onError={e => { e.target.style.display = 'none'; }} />;
}

function SectionCard({ icon: Icon, title, subtitle, children, accent }) {
  return (
    <div className="lift" style={{
      background: 'var(--white)',
      border: '1.5px solid var(--chalk)',
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1.5px solid var(--chalk)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: accent || 'var(--lime-faint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--turf)',
          }}>
            <Icon size={15} color="var(--ink)" strokeWidth={2.4} />
          </div>
          <div>
            <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '0.95rem', color: 'var(--ink)' }}>{title}</p>
            {subtitle && <p style={{ fontFamily: 'Inter', fontSize: '0.74rem', color: 'var(--grey-light)' }}>{subtitle}</p>}
          </div>
        </div>
      </div>
      <div style={{ padding: '0.4rem 0', flex: 1 }}>{children}</div>
    </div>
  );
}

function relTime(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Insights() {
  const { matches } = useApp();
  const [scorers, setScorers] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingScorers, setLoadingScorers] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    fetchTopScorers(15).then(r => { setScorers(r); setLoadingScorers(false); }).catch(() => setLoadingScorers(false));
    fetchNews(8).then(r => { setNews(r); setLoadingNews(false); }).catch(() => setLoadingNews(false));
  }, []);

  // Best-attack / best-defense leaderboards from completed matches
  const teamStats = (() => {
    const map = new Map();
    matches.filter(m => m.status === 'completed' && m.result).forEach(m => {
      const h = m.home, a = m.away;
      if (!h || !a) return;
      const hs = m.result.homeScore, as = m.result.awayScore;
      function bump(t, gf, ga) {
        const cur = map.get(t.id) || { team: t, gf: 0, ga: 0, mp: 0 };
        cur.gf += gf; cur.ga += ga; cur.mp += 1;
        map.set(t.id, cur);
      }
      bump(h, hs, as); bump(a, as, hs);
    });
    return Array.from(map.values());
  })();

  const bestAttack = [...teamStats].sort((a, b) => b.gf / Math.max(1, b.mp) - a.gf / Math.max(1, a.mp)).slice(0, 6);
  const bestDefense = [...teamStats].sort((a, b) => a.ga / Math.max(1, a.mp) - b.ga / Math.max(1, b.mp)).slice(0, 6);

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <div className="anim-fade-up" style={{ marginBottom: '1.75rem' }}>
        <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>FIFA World Cup 2026</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 0.95 }}>Insights</h1>
        <p style={{ fontFamily: 'Inter', fontSize: '0.95rem', color: 'var(--grey)', marginTop: '0.6rem', maxWidth: 760 }}>
          Form, scorers, injuries and the latest headlines — everything you need to predict smarter.
        </p>
      </div>

      <div className="anim-fade-up anim-d1" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1rem',
      }}>
        {/* Top scorers */}
        <SectionCard icon={Award} title="Top scorers" subtitle="Live, from worldcup26.ir match data">
          {loadingScorers ? (
            <p style={{ padding: '1rem 1.25rem', fontFamily: 'Inter', fontSize: '0.85rem', color: 'var(--grey-light)' }}>Loading…</p>
          ) : scorers.length === 0 ? (
            <p style={{ padding: '1rem 1.25rem', fontFamily: 'Inter', fontSize: '0.85rem', color: 'var(--grey-light)' }}>No goals scored yet.</p>
          ) : (
            <div>
              {scorers.map((s, i) => (
                <div key={s.name + (s.team?.id || '')} style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr auto 56px',
                  alignItems: 'center', gap: '0.7rem',
                  padding: '0.55rem 1.25rem',
                  borderBottom: i < scorers.length - 1 ? '1px solid var(--chalk)' : 'none',
                }}>
                  <span className="h-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: i < 3 ? 'var(--ink)' : 'var(--grey-light)' }}>{i + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <Flag team={s.team} size={22} />
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </div>
                  <span style={{ fontFamily: 'Inter', fontSize: '0.72rem', color: 'var(--grey-light)' }}>{s.team?.code}</span>
                  <span className="h-mono" style={{ textAlign: 'right', fontSize: '0.95rem', fontWeight: 800, color: 'var(--ink)' }}>
                    {s.goals} <span style={{ fontSize: '0.65rem', color: 'var(--grey-light)', fontWeight: 600 }}>G</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Top assists (placeholder — API does not expose assists) */}
        <SectionCard icon={Handshake} title="Top assists" subtitle="Assist tracking — unlocks during knockouts">
          <div style={{ padding: '1.25rem', fontFamily: 'Inter', fontSize: '0.86rem', color: 'var(--grey)', lineHeight: 1.5 }}>
            Assist totals will be published once FIFA confirms official match dossiers for the knockout rounds. Until then, use the <strong>Top scorers</strong> table and the <Link to="/groups" style={{ color: 'var(--ink)', fontWeight: 800, textDecoration: 'underline' }}>group form</Link> to gauge creators.
            <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['Creators to watch', 'Set-piece specialists', 'Penalty box delivery'].map(t => (
                <span key={t} style={{
                  fontFamily: 'Inter', fontWeight: 700, fontSize: '0.72rem',
                  padding: '0.3rem 0.7rem', borderRadius: 999,
                  background: 'var(--surface)', border: '1.5px solid var(--chalk)', color: 'var(--grey)',
                }}>{t}</span>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Injuries (placeholder) */}
        <SectionCard icon={Activity} title="Injury report" subtitle="Updated daily from team announcements">
          <div style={{ padding: '0.4rem 0' }}>
            {[
              { team: 'England',     name: 'Updates pending', detail: 'Camp report due 24 hours before kickoff' },
              { team: 'Brazil',      name: 'Updates pending', detail: 'Camp report due 24 hours before kickoff' },
              { team: 'France',      name: 'Updates pending', detail: 'Camp report due 24 hours before kickoff' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.55rem 1.25rem',
                borderBottom: i < 2 ? '1px solid var(--chalk)' : 'none',
              }}>
                <div>
                  <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.86rem', color: 'var(--ink)' }}>{r.team}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: '0.74rem', color: 'var(--grey-light)' }}>{r.detail}</p>
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: '0.72rem', fontWeight: 700, color: 'var(--grey-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TBC</span>
              </div>
            ))}
            <p style={{ padding: '0.85rem 1.25rem 0', fontFamily: 'Inter', fontSize: '0.74rem', color: 'var(--grey-light)' }}>
              Live FIFA injury feeds turn on once squads are submitted.
            </p>
          </div>
        </SectionCard>

        {/* Best attack */}
        <SectionCard icon={Award} title="Best attack" subtitle="Avg. goals scored per match">
          {bestAttack.length === 0 ? (
            <p style={{ padding: '1rem 1.25rem', fontFamily: 'Inter', fontSize: '0.85rem', color: 'var(--grey-light)' }}>Awaiting completed matches.</p>
          ) : bestAttack.map((r, i) => (
            <div key={r.team.id} style={{
              display: 'grid', gridTemplateColumns: '24px 1fr auto',
              alignItems: 'center', gap: '0.6rem',
              padding: '0.5rem 1.25rem',
              borderBottom: i < bestAttack.length - 1 ? '1px solid var(--chalk)' : 'none',
            }}>
              <span className="h-mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--grey-light)' }}>{i + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flag team={r.team} size={22} />
                <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.86rem', color: 'var(--ink)' }}>{r.team.name}</span>
              </div>
              <span className="h-mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--ink)' }}>{(r.gf / Math.max(1, r.mp)).toFixed(2)}</span>
            </div>
          ))}
        </SectionCard>

        {/* Best defense */}
        <SectionCard icon={Award} title="Best defense" subtitle="Avg. goals conceded per match">
          {bestDefense.length === 0 ? (
            <p style={{ padding: '1rem 1.25rem', fontFamily: 'Inter', fontSize: '0.85rem', color: 'var(--grey-light)' }}>Awaiting completed matches.</p>
          ) : bestDefense.map((r, i) => (
            <div key={r.team.id} style={{
              display: 'grid', gridTemplateColumns: '24px 1fr auto',
              alignItems: 'center', gap: '0.6rem',
              padding: '0.5rem 1.25rem',
              borderBottom: i < bestDefense.length - 1 ? '1px solid var(--chalk)' : 'none',
            }}>
              <span className="h-mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--grey-light)' }}>{i + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flag team={r.team} size={22} />
                <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.86rem', color: 'var(--ink)' }}>{r.team.name}</span>
              </div>
              <span className="h-mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--ink)' }}>{(r.ga / Math.max(1, r.mp)).toFixed(2)}</span>
            </div>
          ))}
        </SectionCard>

        {/* News spans full row on wide screens */}
        <div style={{ gridColumn: '1 / -1' }}>
          <SectionCard icon={Newspaper} title="Latest news" subtitle="Live from ESPN World Cup feed">
            {loadingNews ? (
              <p style={{ padding: '1rem 1.25rem', fontFamily: 'Inter', fontSize: '0.85rem', color: 'var(--grey-light)' }}>Loading…</p>
            ) : news.length === 0 ? (
              <p style={{ padding: '1rem 1.25rem', fontFamily: 'Inter', fontSize: '0.85rem', color: 'var(--grey-light)' }}>No news available right now.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem', padding: '0.85rem 1.25rem' }}>
                {news.map(n => (
                  <a key={n.id} href={n.link} target="_blank" rel="noreferrer" style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    background: 'var(--surface)', border: '1.5px solid var(--chalk)',
                    borderRadius: 10, overflow: 'hidden', color: 'inherit',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(20,32,26,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    {n.image && (
                      <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', background: '#000' }}>
                        <img src={n.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '0.7rem 0.85rem 0.85rem' }}>
                      <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.3 }}>{n.headline}</p>
                      {n.description && <p style={{ fontFamily: 'Inter', fontSize: '0.78rem', color: 'var(--grey)', marginTop: 4, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.description}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontFamily: 'Inter', fontSize: '0.7rem', color: 'var(--grey-light)' }}>
                        <Clock size={11} /> {relTime(n.published)}
                        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--ink)', fontWeight: 700 }}>Read <ExternalLink size={10} /></span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
