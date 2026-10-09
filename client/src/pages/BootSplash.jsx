import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#c0c1ff', '#a855f7', '#818cf8', '#f7c6a4', '#e2e2e9'];

export default function BootSplash() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const navigatedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame;
    let startedAt = 0;
    let width = 0;
    let height = 0;
    let particles = [];

    const go = () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      navigate('/welcome', { replace: true });
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const makeTargets = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const off = offscreen.getContext('2d');
      const fontSize = Math.min(Math.max(width * 0.145, 74), 142);
      off.font = `600 ${fontSize}px Newsreader, Georgia, serif`;
      off.textAlign = 'center';
      off.textBaseline = 'middle';
      off.fillStyle = '#fff';
      off.fillText('Quilio', width / 2, height * 0.46);
      const data = off.getImageData(0, 0, width, height).data;
      const step = Math.max(3, Math.floor(width / 150));
      const targets = [];
      for (let y = height * 0.28; y < height * 0.64; y += step) {
        for (let x = width * 0.2; x < width * 0.8; x += step) {
          if (data[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] > 120) targets.push({ x, y });
        }
      }
      return targets;
    };

    const reset = () => {
      resize();
      const targets = makeTargets();
      const count = Math.min(targets.length, 480);
      particles = Array.from({ length: count }, (_, index) => {
        const target = targets[(index * 7) % targets.length];
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height) * (.45 + Math.random() * .75);
        return {
          x: width / 2 + Math.cos(angle) * distance,
          y: height / 2 + Math.sin(angle) * distance,
          tx: target.x,
          ty: target.y,
          size: 1 + Math.random() * 1.8,
          alpha: .35 + Math.random() * .65,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          drift: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = (now) => {
      if (!startedAt) startedAt = now;
      const elapsed = (now - startedAt) / 1000;
      const progress = Math.min(elapsed / 3.35, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(width / 2, height * .46, 0, width / 2, height * .46, width * .48);
      glow.addColorStop(0, `rgba(99,102,241,${.12 * progress})`);
      glow.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        const wander = (1 - eased) * 8;
        const x = particle.x + (particle.tx - particle.x) * eased + Math.cos(now * .0012 + particle.drift) * wander;
        const y = particle.y + (particle.ty - particle.y) * eased + Math.sin(now * .0012 + particle.drift) * wander;
        const alpha = Math.min(1, particle.alpha * (.24 + eased * 1.1));
        ctx.beginPath();
        ctx.arc(x, y, particle.size * (0.8 + eased * .3), 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (progress < 1) frame = requestAnimationFrame(draw);
      else window.setTimeout(go, 260);
    };

    reset();
    window.addEventListener('resize', reset);
    frame = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', reset);
      cancelAnimationFrame(frame);
    };
  }, [navigate]);

  return (
    <main className="q-boot" aria-label="Loading Quilio">
      <canvas ref={canvasRef} className="q-boot-canvas" aria-hidden="true" />
      <div className="q-boot-ui">
        <div className="q-boot-top"><span className="q-boot-mark">Q</span><span>QUILIO / SCHOLAR</span></div>
        <div className="q-boot-bottom">
          <div><span className="q-boot-pulse" /> Gathering your ideas</div>
          <button type="button" onClick={() => navigate('/welcome')} className="q-boot-skip">Skip intro <span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </main>
  );
}
