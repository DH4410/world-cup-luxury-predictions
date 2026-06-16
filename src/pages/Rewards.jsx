import { Link } from 'react-router-dom';
import { Trophy, Star, Gift, Award, Sparkles, Crown, Lock, ArrowRight } from 'lucide-react';

const HERO_IMG = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=2000&q=80';

const TIERS = [
  {
    name: 'Group Stage',
    points: '0 – 199 pts',
    icon: Star,
    color: '#9CA39A',
    perks: [
      'Climb the global leaderboard',
      'Predict every fixture, week by week',
      'Public rooms with friends',
    ],
  },
  {
    name: 'Round of 32',
    points: '200 – 599 pts',
    icon: Award,
    color: '#B6E84B',
    perks: [
      'Custom username flair on leaderboard',
      'Early-bird kickoff notifications',
      'Weekly insights email digest',
    ],
  },
  {
    name: 'Quarter-finalist',
    points: '600 – 1199 pts',
    icon: Trophy,
    color: '#F2B600',
    featured: true,
    perks: [
      'Limited Matchday × elitedevs merch drop',
      'Private knockout-only prediction rooms',
      'Featured profile on the home page',
    ],
  },
  {
    name: 'Champion',
    points: '1200 + pts',
    icon: Crown,
    color: '#E8B05B',
    perks: [
      'Hand-engraved Matchday trophy (real)',
      'Cash prize from the elitedevs prize pool',
      'Invitation to the World Cup Final watch party',
    ],
  },
];

const PRIZES = [
  { title: 'Final 4 watch-party invite',  detail: 'New York · Mexico City · Toronto',                       img: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=900&q=80' },
  { title: 'Matchday × elitedevs merch',  detail: 'Numbered hoodies, capsule poster, ceramic mug',          img: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&q=80' },
  { title: '€1,000 prize pool',           detail: 'Split across top-10 finishers · paid by elitedevs.org',  img: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=900&q=80' },
  { title: 'Engraved trophy',             detail: 'For the overall winner — yours to keep',                 img: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=900&q=80' },
];

export default function Rewards() {
  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      {/* Hero */}
      <section className="anim-fade-up" style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 14, minHeight: 360,
        marginBottom: '1.5rem',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${HERO_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.55)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(20,32,26,0.88) 0%, rgba(20,32,26,0.4) 60%, rgba(20,32,26,0.1) 100%)' }} />
        <div style={{ position: 'relative', padding: '3rem 2.5rem', color: '#fff' }}>
          <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--turf)' }}>
            Rewards
          </p>
          <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', lineHeight: 0.95, marginTop: 8, maxWidth: 720 }}>
            Predict well. Earn real prizes.
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: '1.05rem', color: 'rgba(245,248,236,0.85)', marginTop: '1rem', maxWidth: 560 }}>
            Stack points across 104 matches. Climb four reward tiers. Top the table and we send you something tangible — including a real engraved trophy.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/predict" style={ctaPrimary}>
              Start earning <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <Link to="/leaderboard" style={ctaGhost}>
              View leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '0.85rem' }}>Tier system</h2>
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem',
        marginBottom: '2rem',
      }}>
        {TIERS.map(({ name, points, icon: Icon, color, perks, featured }) => (
          <div key={name} className="lift" style={{
            background: featured ? 'var(--ink)' : 'var(--white)',
            color: featured ? '#fff' : 'var(--ink)',
            border: `1.5px solid ${featured ? 'var(--ink)' : 'var(--chalk)'}`,
            borderRadius: 12, padding: '1.5rem',
            position: 'relative', overflow: 'hidden',
          }}>
            {featured && (
              <span style={{
                position: 'absolute', top: 14, right: 14,
                background: 'var(--turf)', color: 'var(--ink)',
                padding: '0.25rem 0.6rem', borderRadius: 999,
                fontFamily: 'Inter', fontWeight: 800, fontSize: '0.62rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Most popular</span>
            )}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: featured ? 'rgba(155,202,53,0.18)' : `${color}22`,
              border: `1.5px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem',
            }}>
              <Icon size={20} strokeWidth={2.3} color={color} />
            </div>
            <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.1rem' }}>{name}</p>
            <p className="h-mono" style={{ fontSize: '0.74rem', color: featured ? 'rgba(255,255,255,0.55)' : 'var(--grey-light)', marginTop: 2, letterSpacing: '0.06em' }}>{points}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {perks.map(p => (
                <li key={p} style={{ fontFamily: 'Inter', fontSize: '0.84rem', display: 'flex', alignItems: 'flex-start', gap: 8, color: featured ? 'rgba(255,255,255,0.85)' : 'var(--grey)' }}>
                  <Sparkles size={12} color={featured ? 'var(--turf)' : 'var(--turf-deep)'} style={{ marginTop: 3, flexShrink: 0 }} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Prize gallery */}
      <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '0.85rem' }}>What's on the table</h2>
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem',
        marginBottom: '2rem',
      }}>
        {PRIZES.map(p => (
          <div key={p.title} className="lift" style={{
            background: 'var(--white)', border: '1.5px solid var(--chalk)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', background: '#000' }}>
              <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '0.95rem 1.1rem 1.1rem' }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>{p.title}</p>
              <p style={{ fontFamily: 'Inter', fontSize: '0.82rem', color: 'var(--grey)', marginTop: 4 }}>{p.detail}</p>
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section style={{
        background: 'var(--white)', border: '1.5px solid var(--chalk)',
        borderRadius: 12, padding: '1.5rem 1.75rem',
      }}>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem' }}>How rewards work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { step: '01', title: 'Predict every fixture', desc: 'Lock in score, scorer, assister and MOTM before each kickoff.' },
            { step: '02', title: 'Earn points',           desc: 'Exact score +5 · Outcome +2 · Player picks +1 to +2 each.' },
            { step: '03', title: 'Hit a tier',            desc: 'New perks unlock automatically at 200, 600 and 1,200 points.' },
            { step: '04', title: 'Claim at the final',    desc: 'Top of the table at full-time of the final claims the cup.' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--lime-faint)', border: '1.5px solid var(--turf)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Inter', fontWeight: 800, fontSize: '0.78rem', color: 'var(--turf-deep)',
                flexShrink: 0,
              }}>{s.step}</div>
              <div>
                <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '0.92rem', color: 'var(--ink)' }}>{s.title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: '0.82rem', color: 'var(--grey)', marginTop: 2, lineHeight: 1.45 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1.5px solid var(--chalk)', marginTop: '1.25rem', paddingTop: '1rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Lock size={13} color="var(--grey-light)" style={{ marginTop: 3, flexShrink: 0 }} />
          <p style={{ fontFamily: 'Inter', fontSize: '0.76rem', color: 'var(--grey-light)', lineHeight: 1.5 }}>
            Rewards are funded and shipped by elitedevs.org. Matchday is unaffiliated with FIFA. Cash prizes are paid via SEPA or international wire. Eligibility excludes residents of jurisdictions where prediction contests are restricted.
          </p>
        </div>
      </section>
    </main>
  );
}

const ctaPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--turf)', color: 'var(--ink)',
  padding: '0.8rem 1.4rem', borderRadius: 8,
  fontFamily: 'Inter', fontWeight: 800, fontSize: '0.88rem',
  textDecoration: 'none',
};
const ctaGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'rgba(255,255,255,0.08)', color: '#fff',
  padding: '0.8rem 1.4rem', borderRadius: 8,
  fontFamily: 'Inter', fontWeight: 700, fontSize: '0.88rem',
  border: '1.5px solid rgba(255,255,255,0.4)',
  textDecoration: 'none',
};
