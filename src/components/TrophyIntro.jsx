import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'matchday.introSeenV2';
const FADE_DURATION = 2.4;   // seconds of volume fade at end
const BASE_VOLUME = 0.5;     // default volume, 50% of full
const CLOSE_DURATION = 1200; // ms, matches CSS opacity transition

export default function TrophyIntro({ force = false }) {
  const [show, setShow] = useState(() => {
    if (force) return true;
    if (typeof window === 'undefined') return false;
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return true; }
  });
  const [closing, setClosing] = useState(false);
  const videoRef = useRef(null);

  const handleSkip = useCallback(() => {
    if (closing) return;
    setClosing(true);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {
      // localStorage may be unavailable in private or embedded contexts.
    }
    const v = videoRef.current;
    if (v) {
      const startVol = v.volume;
      const t0 = performance.now();
      const fade = () => {
        if (!videoRef.current) return;
        const t = Math.min(1, (performance.now() - t0) / 900);
        videoRef.current.volume = Math.max(0, startVol * (1 - t));
        if (t < 1) requestAnimationFrame(fade);
      };
      fade();
    }
    setTimeout(() => setShow(false), CLOSE_DURATION);
  }, [closing]);

  useEffect(() => {
    if (!show) return;
    const v = videoRef.current;
    if (!v) return;

    const forceSoundOn = () => {
      if (!videoRef.current) return;
      videoRef.current.muted = false;
      videoRef.current.defaultMuted = false;
      videoRef.current.volume = BASE_VOLUME;
    };

    const tryPlayWithSound = async () => {
      forceSoundOn();
      try {
        await v.play();
      } catch {
        const retryWithSound = () => {
          forceSoundOn();
          videoRef.current?.play().catch(() => {});
        };

        requestAnimationFrame(retryWithSound);
        v.addEventListener('canplay', retryWithSound, { once: true });
        v.addEventListener('loadeddata', retryWithSound, { once: true });
      }
    };

    tryPlayWithSound();

    const onTime = () => {
      if (!v.duration) return;
      const remain = v.duration - v.currentTime;
      if (remain <= FADE_DURATION && remain > 0) {
        const k = remain / FADE_DURATION;
        v.volume = Math.max(0, BASE_VOLUME * k);
      }
    };
    const onEnded = () => handleSkip();

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnded);
    };
  }, [handleSkip, show]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        opacity: closing ? 0 : 1,
        transition: 'opacity 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
        overflow: 'hidden',
        pointerEvents: closing ? 'none' : 'auto',
      }}
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        playsInline
        autoPlay
        muted={false}
        preload="auto"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          background: '#000',
          transform: closing ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
        }}
      />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.65) 100%)',
        pointerEvents: 'none',
      }} />

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

        <button onClick={handleSkip} style={pillBtnStyle('rgba(255,255,255,0.07)')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          Skip intro
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '0 2rem 2rem', zIndex: 2,
        display: 'flex', justifyContent: 'center',
        opacity: closing ? 0 : 1,
        transition: 'opacity 0.6s ease',
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
