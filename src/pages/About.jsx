import { Link } from 'react-router-dom';
import { Code2, Globe, Mail, Shield, Sparkles, ArrowRight } from 'lucide-react';

const TEAM_IMG = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80';
const PITCH_IMG = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80';

export default function About() {
  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      {/* Hero */}
      <section className="anim-fade-up" style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 14, minHeight: 340,
        marginBottom: '1.5rem',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${TEAM_IMG})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'saturate(0.95) brightness(0.7)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(120deg, rgba(20,32,26,0.92) 0%, rgba(20,32,26,0.4) 70%, rgba(20,32,26,0.1) 100%)',
        }} />
        <div style={{ position: 'relative', padding: '3rem 2.5rem', color: '#fff', maxWidth: 720 }}>
          <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--turf)' }}>
            About Matchday
          </p>
          <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', lineHeight: 0.95, marginTop: 8 }}>
            Built by the team at<br />elitedevs.org
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: '1.05rem', color: 'rgba(245,248,236,0.85)', marginTop: '1rem', maxWidth: 560 }}>
            We're a small studio of independent developers obsessed with sport, design and the small details that make a product feel alive. Matchday is our take on prediction games — free to play, no nonsense.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <a href="https://elitedevs.org" target="_blank" rel="noreferrer" style={ctaPrimary}>
              Visit elitedevs.org <ArrowRight size={14} strokeWidth={2.5} />
            </a>
            <Link to="/predict" style={ctaGhost}>
              Start predicting
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { icon: Code2,    title: 'Independent studio',  desc: 'Self-funded. No ads, no trackers selling you out.' },
          { icon: Shield,   title: 'Free to play forever', desc: 'Predict every match without a paywall.' },
          { icon: Sparkles, title: 'Crafted in detail',    desc: 'Type, motion and dataflow — all hand-tuned.' },
          { icon: Globe,    title: 'Data you can trust',   desc: 'Sources: worldcup26.ir, ESPN, FIFA.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="lift" style={{
            background: 'var(--white)', border: '1.5px solid var(--chalk)',
            borderRadius: 12, padding: '1.25rem',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--lime-faint)', border: '1.5px solid var(--turf)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem',
            }}>
              <Icon size={18} strokeWidth={2.3} color="var(--turf-deep)" />
            </div>
            <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>{title}</p>
            <p style={{ fontFamily: 'Inter', fontSize: '0.86rem', color: 'var(--grey)', marginTop: 4, lineHeight: 1.45 }}>{desc}</p>
          </div>
        ))}
      </section>

      {/* Story */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          background: 'var(--white)', border: '1.5px solid var(--chalk)',
          borderRadius: 12, padding: '1.75rem 2rem',
        }}>
          <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--turf-deep)' }}>Our story</p>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.5rem', color: 'var(--ink)', marginTop: 6, marginBottom: '0.75rem' }}>
            A studio for software that earns its place on your screen.
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: '0.92rem', color: 'var(--grey)', lineHeight: 1.6 }}>
            elitedevs.org is a workshop of engineers and designers who ship under our own name. We choose projects we'd want to use ourselves — and we keep the surface area small so every screen can be considered.
          </p>
          <p style={{ fontFamily: 'Inter', fontSize: '0.92rem', color: 'var(--grey)', lineHeight: 1.6, marginTop: '0.85rem' }}>
            Matchday started as a side project ahead of the 48-team FIFA World Cup 2026. We wanted a prediction game where the data felt real, the controls felt sharp, and the design didn't look like every other template.
          </p>
        </div>

        <div style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 12, minHeight: 280,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${PITCH_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,32,26,0.25) 0%, rgba(20,32,26,0.85) 100%)' }} />
          <div style={{ position: 'relative', padding: '1.75rem', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--turf)' }}>Get in touch</p>
            <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.2rem', marginTop: 6 }}>
              Bug report, feature idea or partnership?
            </p>
            <a href="mailto:hello@elitedevs.org" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'var(--turf)', fontFamily: 'Inter', fontWeight: 700, fontSize: '0.92rem' }}>
              <Mail size={14} /> hello@elitedevs.org
            </a>
          </div>
        </div>
      </section>

      <p style={{ fontFamily: 'Inter', fontSize: '0.78rem', color: 'var(--grey-light)', textAlign: 'center' }}>
        © {new Date().getFullYear()} elitedevs.org · Matchday is unaffiliated with FIFA.
      </p>
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
