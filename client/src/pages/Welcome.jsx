import { useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/* ── Quilio Logo SVG ── */
const QuilioEmblem = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="qGradW" gradientUnits="userSpaceOnUse" x1="10" x2="90" y1="10" y2="90">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="sparkleW" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#C084FC" />
      </linearGradient>
    </defs>
    <circle cx="48" cy="46" r="32" fill="#0E1017" stroke="url(#qGradW)" strokeWidth="7.5" />
    <path d="M48 26V58" stroke="#F1F1F4" strokeLinecap="round" strokeWidth="5" />
    <path d="M36 40C36 40 42 38 48 42C54 38 60 40 60 40" stroke="#8B93A7" strokeLinecap="round" strokeWidth="3.5" />
    <path d="M58 58L78 80" stroke="url(#qGradW)" strokeLinecap="round" strokeWidth="8" />
    <path d="M72 24L74 18L76 24L82 26L76 28L74 34L72 28L66 26L72 24Z" fill="url(#sparkleW)" />
  </svg>
);

export default function Welcome() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const emblemRef = useRef(null);
  const subtextRef = useRef(null);
  const actionsRef = useRef(null);
  const barRef = useRef(null);
  const labelRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let startTime = null;
    let width, height;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const sampleTargets = () => {
      const title = titleRef.current;
      if (!title) return [];
      const off = document.createElement('canvas');
      const offCtx = off.getContext('2d');
      off.width = width; off.height = height;
      const titleRect = title.getBoundingClientRect();
      const fontSize = Math.min(Math.max(width * 0.12, 48), 76);
      offCtx.font = `600 ${fontSize}px "Newsreader", Georgia, serif`;
      offCtx.fillStyle = '#FFFFFF';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      const ty = titleRect.top > 0 ? titleRect.top + titleRect.height / 2 : height * 0.42;
      offCtx.fillText('Quilio', width / 2, ty);
      const data = offCtx.getImageData(0, 0, width, height).data;
      const pts = [];
      const step = Math.max(3, Math.floor(width / 140));
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const i = (y * width + x) * 4;
          if (data[i + 3] > 120) pts.push({ x, y });
        }
      }
      return pts;
    };

    class Dot {
      constructor(tx, ty) {
        this.tx = tx; this.ty = ty;
        this.reset();
        const cols = ['#818cf8','#a78bfa','#c084fc','#e0e7ff','#ffb783','#38bdf8'];
        this.color = cols[Math.floor(Math.random() * cols.length)];
        this.size = Math.random() * 2 + 1.2;
        this.alpha = Math.random() * 0.7 + 0.3;
        this.phase = Math.random() * Math.PI * 2;
      }
      reset() {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.max(width, height) * 0.65 + 120;
        this.x = width / 2 + Math.cos(angle) * dist;
        this.y = height / 2 + Math.sin(angle) * dist;
        this.ca = Math.random() * 0.4 + 0.1;
      }
      update(prog, t) {
        if (prog < 0.18) {
          this.x += Math.cos(t * 0.002 + this.phase) * 0.5;
          this.y += Math.sin(t * 0.002 + this.phase) * 0.5;
          this.ca = this.alpha * prog * 5.5;
        } else {
          const ct = Math.min(1, (prog - 0.18) / 0.65);
          const ease = 1 - Math.pow(1 - ct, 3.2);
          this.x += (this.tx - this.x) * (0.045 + ease * 0.14);
          this.y += (this.ty - this.y) * (0.045 + ease * 0.14);
          if (prog >= 0.82) {
            this.ca = (this.alpha + ease * 0.5) * Math.max(0, 1 - (prog - 0.82) / 0.15);
          } else {
            this.ca = Math.min(1, this.alpha + ease * 0.5);
          }
        }
      }
      draw() {
        if (this.ca <= 0.01) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.ca;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 3;
        ctx.fill();
        ctx.restore();
      }
    }

    const init = () => {
      const pts = sampleTargets();
      if (pts.length === 0) { setTimeout(init, 150); return; }
      const count = Math.min(pts.length, 320);
      const step = Math.floor(pts.length / count);
      particles = [];
      for (let i = 0; i < count; i++) {
        const pt = pts[i * step] || pts[Math.floor(Math.random() * pts.length)];
        particles.push(new Dot(pt.x, pt.y));
      }
      startAnim();
    };

    const startAnim = () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      startTime = null;

      /* Initial hidden state */
      if (titleRef.current) { titleRef.current.style.opacity = '0'; titleRef.current.style.transform = 'scale(0.95)'; }
      if (emblemRef.current) { emblemRef.current.style.opacity = '0'; emblemRef.current.style.transform = 'translateY(12px)'; }
      if (subtextRef.current) { subtextRef.current.style.opacity = '0'; subtextRef.current.style.transform = 'translateY(12px)'; }
      if (actionsRef.current) { actionsRef.current.style.opacity = '0'; actionsRef.current.style.transform = 'translateY(16px)'; }
      if (barRef.current) barRef.current.style.width = '15%';
      if (labelRef.current) labelRef.current.textContent = 'Scattering 320 semantic nodes…';
      particles.forEach(p => p.reset());

      const loop = (now) => {
        if (!startTime) startTime = now;
        const elapsed = (now - startTime) / 1000;
        ctx.clearRect(0, 0, width, height);
        const prog = Math.min(1, elapsed / 2.4);

        if (barRef.current && labelRef.current) {
          if (prog < 0.22) {
            labelRef.current.textContent = 'Synthesizing vector graph…';
            barRef.current.style.width = Math.floor(prog * 160) + '%';
          } else if (prog < 0.8) {
            labelRef.current.textContent = "Assembling wordmark 'Quilio'…";
            barRef.current.style.width = Math.floor(20 + prog * 75) + '%';
          } else {
            labelRef.current.textContent = '100% Consolidated & Verified';
            barRef.current.style.width = '100%';
          }
        }

        particles.forEach(p => { p.update(prog, now); p.draw(); });

        if (prog > 0.28 && prog < 0.82) {
          ctx.save();
          ctx.strokeStyle = 'rgba(168,85,247,0.12)';
          ctx.lineWidth = 0.6;
          for (let i = 0; i < particles.length; i += 8) {
            for (let j = i + 1; j < Math.min(i + 4, particles.length); j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              if (Math.hypot(dx, dy) < 34) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
          ctx.restore();
        }

        if (prog >= 0.80) {
          if (titleRef.current) { titleRef.current.style.opacity = '1'; titleRef.current.style.transform = 'scale(1)'; }
          if (emblemRef.current) { emblemRef.current.style.opacity = '1'; emblemRef.current.style.transform = 'translateY(0)'; }
        }
        if (prog >= 0.95) {
          if (subtextRef.current) { subtextRef.current.style.opacity = '1'; subtextRef.current.style.transform = 'translateY(0)'; }
          if (actionsRef.current) { actionsRef.current.style.opacity = '1'; actionsRef.current.style.transform = 'translateY(0)'; }
        }

        if (prog < 1) {
          animRef.current = requestAnimationFrame(loop);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
      };
      animRef.current = requestAnimationFrame(loop);
    };

    /* Start after fonts load */
    if (document.fonts) {
      document.fonts.ready.then(() => setTimeout(init, 300));
    } else {
      setTimeout(init, 400);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="ns-welcome-wrap">
      {/* Ambient glow */}
      <div className="ns-welcome-ambient" />
      {/* Dot grid */}
      <div className="ns-dot-grid" />
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}
      />

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 20, width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/login"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, padding: '6px 14px', borderRadius: 9999,
              background: '#181A22', border: '1px solid rgba(255,255,255,0.1)',
              color: '#C7C4D7', transition: 'all 0.15s', textDecoration: 'none',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#818cf8' }}>lock</span>
            Sign In
          </Link>
        </div>
      </header>

      {/* Main center content */}
      <main style={{
        position: 'relative', zIndex: 20, flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center',
        maxWidth: 480, margin: '0 auto', width: '100%', marginTop: -8,
      }}>
        {/* Logo emblem */}
        <div
          ref={emblemRef}
          style={{ marginBottom: 20, transition: 'all 0.7s', opacity: 0, transform: 'translateY(12px)' }}
        >
          <div style={{
            position: 'relative', width: 64, height: 64, borderRadius: 16,
            background: '#12141C', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 10, boxShadow: '0 0 50px -10px rgba(99,102,241,0.45)',
          }}>
            <QuilioEmblem />
          </div>
        </div>

        {/* Title */}
        <div style={{ position: 'relative', minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', margin: '4px 0' }}>
          <h1
            ref={titleRef}
            className="ns-shimmer"
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: 'clamp(48px, 12vw, 76px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              userSelect: 'none',
              opacity: 0,
              transform: 'scale(0.95)',
              transition: 'all 0.7s',
              filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.85))',
            }}
          >
            Quilio
          </h1>
        </div>

        {/* Subtitle */}
        <div
          ref={subtextRef}
          style={{ marginTop: 8, opacity: 0, transform: 'translateY(12px)', transition: 'all 0.7s 0.15s' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 14px', borderRadius: 9999,
            background: 'rgba(21,23,31,0.8)', border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 12, backdropFilter: 'blur(8px)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #818cf8, #c084fc)' }} />
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C084FC' }}>
              Synthesis &amp; Deep Learning
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#8B93A7', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
            Knowledge untangled. Where reading transforms into active cognitive mastery.
          </p>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, color: 'rgba(199,196,215,0.75)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ffb783' }}>vpn_key</span>
            Scholar access requires authentication
          </div>
        </div>

        {/* Convergence telemetry */}
        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 11, color: '#5A6076', fontFamily: 'monospace' }}>
          <div style={{ width: 96, height: 4, background: '#15171F', borderRadius: 9999, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div ref={barRef} style={{ height: '100%', background: 'linear-gradient(90deg, #6366F1, #A855F7, #F2A93B)', width: '100%', transition: 'width 0.5s' }} />
          </div>
          <span ref={labelRef}>100% Consolidated &amp; Verified</span>
        </div>
      </main>

      {/* Bottom CTAs */}
      <footer style={{
        position: 'relative', zIndex: 20, padding: '0 24px 36px',
        display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, margin: '0 auto', width: '100%',
      }}>
        <div
          ref={actionsRef}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0, transform: 'translateY(16px)', transition: 'all 0.7s' }}
        >
          {/* Primary CTA */}
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5, #6366F1, #7c3aed)',
              color: '#fff', fontWeight: 500, fontSize: 14, border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 8px 24px rgba(99,102,241,0.3)', transition: 'all 0.2s',
            }}
          >
            <span>Enter Workspace</span>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>

          {/* Secondary links */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#8B93A7' }}>
            <span>Already a Scholar?</span>
            <Link to="/login" style={{ color: '#c0c1ff', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>Sign In</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>•</span>
            <Link to="/register" style={{ color: '#ffb783', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>Register Free</Link>
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#5A6076', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.05)', paddingLeft: 4, paddingRight: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#818cf8' }}>verified_user</span>
              Grounded RAG Encrypted
            </span>
            <Link to="/login" style={{ color: '#5A6076', fontSize: 11 }}>Sign in with Scholar Key</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
