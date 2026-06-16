import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const STORAGE_KEY = 'matchday.introSeenV1';

export default function TrophyIntro({ force = false }) {
  const [show, setShow] = useState(() => {
    if (force) return true;
    if (typeof window === 'undefined') return false;
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return true; }
  });
  const [closing, setClosing] = useState(false);
  const [phase, setPhase] = useState(0); // 0 idle, 1 reveal, 2 hold, 3 outro
  const mountRef = useRef(null);
  const rafRef = useRef(0);
  const sceneStateRef = useRef(null);
  const startedAt = useRef(performance.now());

  // Phase ticker: title reveal, then call-to-skip prompt
  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(() => handleSkip(), 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show]);

  function handleSkip() {
    if (closing) return;
    setClosing(true);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setTimeout(() => setShow(false), 750);
  }

  // three.js setup
  useEffect(() => {
    if (!show || !mountRef.current) return;
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x0a1410, 0.05);

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 1.2, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);

    // Lighting
    const key = new THREE.SpotLight(0xfff1c4, 6, 30, Math.PI / 5, 0.4, 1.2);
    key.position.set(4, 7, 6);
    scene.add(key);

    const rim = new THREE.PointLight(0x9bca35, 4, 25);
    rim.position.set(-5, 2, -3);
    scene.add(rim);

    const fill = new THREE.PointLight(0xffa840, 2, 22);
    fill.position.set(2, -2, 5);
    scene.add(fill);

    const ambient = new THREE.AmbientLight(0x223028, 0.55);
    scene.add(ambient);

    // Trophy material — gold
    const gold = new THREE.MeshStandardMaterial({
      color: 0xf6c443, metalness: 1.0, roughness: 0.22,
      emissive: 0x3a2700, emissiveIntensity: 0.35,
    });
    const goldShine = new THREE.MeshStandardMaterial({
      color: 0xffd770, metalness: 1.0, roughness: 0.12,
      emissive: 0x553200, emissiveIntensity: 0.5,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x14201a, metalness: 0.6, roughness: 0.4,
    });

    // Build a stylized trophy resembling the FIFA world cup silhouette
    const trophy = new THREE.Group();

    // Base — two-tier dark plinth with thin gold band
    const baseLow = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.7, 0.45, 64), dark);
    baseLow.position.y = -2.5; trophy.add(baseLow);
    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.04, 16, 100), goldShine);
    baseRing.rotation.x = Math.PI / 2; baseRing.position.y = -2.27; trophy.add(baseRing);
    const baseUp = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.5, 0.45, 64), dark);
    baseUp.position.y = -1.95; trophy.add(baseUp);
    const baseRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.04, 16, 100), goldShine);
    baseRing2.rotation.x = Math.PI / 2; baseRing2.position.y = -1.73; trophy.add(baseRing2);

    // Twisted stem (a column with a subtle twist using LatheGeometry)
    const stemPts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = -1.55 + t * 1.7;
      const r = 0.42 + Math.sin(t * Math.PI) * 0.18 + (1 - t) * 0.15;
      stemPts.push(new THREE.Vector2(r, y));
    }
    const stem = new THREE.Mesh(new THREE.LatheGeometry(stemPts, 64), gold);
    trophy.add(stem);

    // Globe — top sphere (the "world")
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 64), goldShine);
    globe.position.y = 1.05;
    trophy.add(globe);

    // Equator + meridian bands (continent suggestion)
    const eqBand = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.025, 16, 100), dark);
    eqBand.position.y = 1.05; eqBand.rotation.x = Math.PI / 2;
    trophy.add(eqBand);
    const merBand = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.025, 16, 100), dark);
    merBand.position.y = 1.05;
    trophy.add(merBand);

    // Crown ring at top of globe
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 16, 100), goldShine);
    crown.position.y = 2.1;
    crown.rotation.x = Math.PI / 2;
    trophy.add(crown);

    // Small star on top
    const star = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), goldShine);
    star.position.y = 2.35;
    trophy.add(star);

    trophy.position.y = 0.6;
    trophy.scale.set(0.001, 0.001, 0.001); // start invisible-small
    scene.add(trophy);

    // Spotlight halo behind trophy (radial gradient sprite)
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 256; haloCanvas.height = 256;
    const hg = haloCanvas.getContext('2d');
    const grad = hg.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, 'rgba(246,196,67,0.55)');
    grad.addColorStop(0.55, 'rgba(155,202,53,0.12)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    hg.fillStyle = grad; hg.fillRect(0, 0, 256, 256);
    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false }));
    halo.scale.set(11, 11, 1);
    halo.position.set(0, 0.6, -1.5);
    scene.add(halo);

    // Confetti / sparkle particles
    const PCOUNT = 220;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PCOUNT * 3);
    const speeds = new Float32Array(PCOUNT);
    const sizes = new Float32Array(PCOUNT);
    for (let i = 0; i < PCOUNT; i++) {
      const r = 6 + Math.random() * 6;
      const a = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 8;
      positions[i*3]   = Math.cos(a) * r;
      positions[i*3+1] = y;
      positions[i*3+2] = Math.sin(a) * r - 2;
      speeds[i] = 0.2 + Math.random() * 0.6;
      sizes[i] = 0.04 + Math.random() * 0.07;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const sparkleCanvas = document.createElement('canvas');
    sparkleCanvas.width = 64; sparkleCanvas.height = 64;
    const sg = sparkleCanvas.getContext('2d');
    const sgrad = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    sgrad.addColorStop(0, 'rgba(255,238,170,1)');
    sgrad.addColorStop(0.4, 'rgba(255,200,100,0.65)');
    sgrad.addColorStop(1, 'rgba(0,0,0,0)');
    sg.fillStyle = sgrad; sg.fillRect(0, 0, 64, 64);
    const sparkleTex = new THREE.CanvasTexture(sparkleCanvas);
    const pMat = new THREE.PointsMaterial({
      map: sparkleTex, size: 0.45, sizeAttenuation: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      color: 0xffe8a0,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    sceneStateRef.current = { renderer, scene, camera, trophy, halo, particles, speeds };

    function onResize() {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    const animate = () => {
      const t = (performance.now() - startedAt.current) / 1000;

      // Reveal scale: lerp from 0 to 1 over first 1.6s using ease-out-back
      const reveal = Math.min(1, t / 1.8);
      const easeBack = c => {
        const s = 1.6;
        return 1 + s * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2);
      };
      const scale = easeBack(reveal);
      trophy.scale.setScalar(Math.max(0.001, scale));

      // Y rotation always
      trophy.rotation.y = t * 0.55;
      // gentle bob
      trophy.position.y = 0.6 + Math.sin(t * 1.3) * 0.07;

      // halo subtle pulse
      const pulse = 1 + Math.sin(t * 2.2) * 0.05;
      halo.scale.set(11 * pulse, 11 * pulse, 1);

      // Camera dolly-in for first 2s
      const dolly = Math.min(1, t / 2.4);
      camera.position.z = 9 - dolly * 2.3;
      camera.position.y = 1.2 - dolly * 0.4;
      camera.lookAt(0, 0.6, 0);

      // particles drift upward + rotate
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < PCOUNT; i++) {
        pos[i*3+1] += 0.005 * speeds[i];
        if (pos[i*3+1] > 4) pos[i*3+1] = -4;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.05;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      pGeo.dispose();
      [gold, goldShine, dark, pMat].forEach(m => m.dispose && m.dispose());
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose?.();
      });
      mount.removeChild(renderer.domElement);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(circle at 50% 45%, #182921 0%, #060c09 70%, #020503 100%)',
        opacity: closing ? 0 : 1,
        transform: closing ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* subtle vignette grain */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle, transparent 35%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Header bar */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '1.5rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: 'var(--turf, #9BCA35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#14201A" stroke="none">
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: '1.5rem', letterSpacing: '0.06em' }}>MATCHDAY</span>
        </div>

        <button onClick={handleSkip} style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1.5px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.85)',
          padding: '0.55rem 1.1rem', borderRadius: 999,
          fontFamily: 'Inter', fontWeight: 700, fontSize: '0.78rem',
          cursor: 'pointer', backdropFilter: 'blur(8px)',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          transition: 'background 0.18s, border-color 0.18s, transform 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          Skip intro
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 3D mount */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      {/* Foreground copy */}
      <div style={{
        position: 'relative', zIndex: 2,
        marginTop: 'auto', padding: '0 2rem 3rem',
        color: '#fff', textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.7rem',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--turf, #9BCA35)',
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}>
          USA · Canada · Mexico · 2026
        </p>
        <h1 style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 'clamp(3rem, 9vw, 6.5rem)',
          lineHeight: 0.95, letterSpacing: '0.02em', textTransform: 'uppercase',
          marginTop: '0.7rem',
          background: 'linear-gradient(180deg, #fff 0%, #f6c443 70%, #b78400 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.9s 0.1s ease, transform 0.9s 0.1s ease',
          textShadow: '0 8px 40px rgba(246,196,67,0.25)',
        }}>
          The Trophy<br />awaits.
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '1rem',
          color: 'rgba(255,255,255,0.78)', maxWidth: 460, margin: '1rem auto 0',
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}>
          Predict every match. Stack points. Lift the cup in your own private league.
        </p>

        <div style={{
          marginTop: '1.5rem',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'opacity 0.6s 0.2s ease',
          pointerEvents: 'auto',
        }}>
          <button onClick={handleSkip} style={{
            background: 'var(--turf, #9BCA35)', color: '#14201A',
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
    </div>
  );
}
