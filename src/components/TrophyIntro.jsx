import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'matchday.introSeenV2';
const FADE_DURATION = 1.4; // seconds of volume fade at end

export default function TrophyIntro({ force = false }) {
  const [show, setShow] = useState(() => {
    if (force) return true;
    if (typeof window === 'undefined') return false;
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return true; }
  });
  const [closing, setClosing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const videoRef = useRef(null);

  function handleSkip() {
    if (closing) return;
    setClosing(true);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    const v = videoRef.current;
    if (v) {
      // quick fade out before unmount
      const startVol = v.volume;
      const t0 = performance.now();
      const fade = () => {
        const t = (performance.now() - t0) / 600;
        if (!videoRef.current) return;
        videoRef.current.volume = Math.max(0, startVol * (1 - t));
        if (t < 1) requestAnimationFrame(fade);
      };
      fade();
    }
    setTimeout(() => setShow(false), 700);
  }

  useEffect(() => {
    if (!show) return;
    const v = videoRef.current;
    if (!v) return;

    v.volume = 1.0;
    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        // Browser blocked unmuted autoplay — fall back to muted autoplay
        v.muted = true;
        setMuted(true);
        try { await v.play(); }
        catch { setNeedsTapToPlay(true); }
      }
    };
    tryPlay();

    const onTime = () => {
      if (!v.duration) return;
      const remain = v.duration - v.currentTime;
      if (remain <= FADE_DURATION && remain > 0) {
        const k = remain / FADE_DURATION;     // 1 → 0
        v.volume = Math.max(0, Math.min(1, k));
      }
    };
    const onEnded = () => handleSkip();

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnded);
    };
  }, [show]);

  function enableSound() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    v.play().catch(() => {});
  }

  function tapToPlay() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    setNeedsTapToPlay(false);
    v.play().catch(() => {});
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        opacity: closing ? 0 : 1,
        transition: 'opacity 0.7s ease',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        playsInline
        autoPlay
        preload="auto"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          background: '#000',
        }}
      />

      {/* Soft top/bottom vignette so chrome reads cleanly */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.65) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top bar — brand + skip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '1.4rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#fff', zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: '#B6E84B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#14201A" stroke="none">
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: '1.5rem', letterSpacing: '0.06em' }}>MATCHDAY</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {muted && !needsTapToPlay && (
            <button onClick={enableSound} style={pillBtnStyle('rgba(255,255,255,0.07)')}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              Unmute
            </button>
          )}
          <button onClick={handleSkip} style={pillBtnStyle('rgba(255,255,255,0.07)')}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Skip intro
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* If autoplay was blocked entirely — show a big tap-to-play */}
      {needsTapToPlay && (
        <button onClick={tapToPlay} style={{
          position: 'absolute', inset: 0, margin: 'auto',
          width: 'fit-content', height: 'fit-content',
          background: 'rgba(20,32,26,0.65)',
          border: '1.5px solid rgba(255,255,255,0.25)',
          color: '#fff', padding: '1.1rem 2rem',
          borderRadius: 999, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1rem',
          backdropFilter: 'blur(12px)', display: 'inline-flex', alignItems: 'center', gap: 10,
          zIndex: 3,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
            <path d="M8 5v14l11-7z" />
          </svg>
          Tap to play intro
        </button>
      )}

      {/* Bottom CTA — kept low-key so the video carries the moment */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '0 2rem 2rem', zIndex: 2,
        display: 'flex', justifyContent: 'center',
      }}>
        <button onClick={handleSkip} style={{
          background: '#B6E84B', color: '#14201A',
          border: 'none', borderRadius: 8,
          padding: '0.95rem 1.8rem',
          fontFamily: 'Inter', fontWeight: 800, fontSize: '0.92rem',
          cursor: 'pointer',
          boxShadow: '0 14px 40px rgba(155,202,53,0.45)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          transition: 'transform 0.18s, box-shadow 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 18px 50px rgba(155,202,53,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(155,202,53,0.45)'; }}>
          Enter Matchday
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function pillBtnStyle(bg) {
  return {
    background: bg,
    border: '1.5px solid rgba(255,255,255,0.18)',
    color: 'rgba(255,255,255,0.92)',
    padding: '0.55rem 1.1rem', borderRadius: 999,
    fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.78rem',
    cursor: 'pointer', backdropFilter: 'blur(8px)',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'background 0.18s, border-color 0.18s, transform 0.18s',
  };
}
