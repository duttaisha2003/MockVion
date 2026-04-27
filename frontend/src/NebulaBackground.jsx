// src/components/NebulaBackground.jsx
import { useEffect, useRef } from "react";

const NebulaBackground = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const frame = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H, particles, orbs, shooters;
    let animId;

    const rand = (a, b) => a + Math.random() * (b - a);
    const dpr = devicePixelRatio || 1;

    class Particle {
      constructor(born) { this.reset(born); }
      reset(born) {
        this.x = rand(0, W); this.y = born ? rand(0, H) : -4;
        this.r = rand(0.4, 1.8); this.vx = rand(-0.1, 0.1); this.vy = rand(0.03, 0.18);
        this.life = 0; this.maxLife = rand(300, 700);
        this.hue = rand(200, 270); this.sat = rand(60, 100); this.bright = rand(70, 100);
        this.tw = rand(0, Math.PI * 2); this.tws = rand(0.01, 0.04);
      }
      update() {
        const dx = (mouse.current.x * dpr - this.x) * 0.00004;
        const dy = (mouse.current.y * dpr - this.y) * 0.00004;
        this.vx += dx; this.vy += dy;
        this.vx *= 0.998; this.vy *= 0.998;
        this.x += this.vx; this.y += this.vy;
        this.life++; this.tw += this.tws;
        if (this.life > this.maxLife || this.y > H + 10) this.reset(false);
      }
      draw() {
        const a = Math.min(this.life / 60, 1) * Math.min((this.maxLife - this.life) / 40, 1);
        const tw = 0.6 + 0.4 * Math.sin(this.tw);
        ctx.save(); ctx.globalAlpha = a * tw * 0.85;
        ctx.shadowBlur = this.r * 7;
        ctx.shadowColor = `hsl(${this.hue},${this.sat}%,${this.bright}%)`;
        ctx.fillStyle = `hsl(${this.hue},${this.sat}%,${this.bright}%)`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    class Orb {
      constructor(x, y, r, hue, sp) {
        this.ox = x; this.oy = y; this.r = r; this.hue = hue;
        this.angle = rand(0, Math.PI * 2); this.sp = sp;
        this.drift = rand(0.3, 0.7); this.ph = rand(0, Math.PI * 2);
      }
      update() {
        this.angle += this.sp;
        this.x = this.ox + Math.cos(this.angle) * this.drift * W * 0.055;
        this.y = this.oy + Math.sin(this.angle * 0.7 + this.ph) * this.drift * H * 0.045;
        this.x += (mouse.current.x * dpr - this.ox) * 0.006;
        this.y += (mouse.current.y * dpr - this.oy) * 0.006;
      }
      draw() {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        g.addColorStop(0, `hsla(${this.hue},90%,65%,0.16)`);
        g.addColorStop(0.5, `hsla(${this.hue},80%,50%,0.06)`);
        g.addColorStop(1, `hsla(${this.hue},70%,40%,0)`);
        ctx.save(); ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    class Shooter {
      constructor() { this.reset(); }
      reset() {
        this.x = rand(W * 0.1, W * 0.9); this.y = rand(H * 0.05, H * 0.25);
        this.len = rand(60, 140) * dpr; this.spd = rand(8, 16) * dpr;
        this.angle = rand(0.3, 0.65); this.life = 0; this.maxLife = rand(28, 55);
        this.hue = rand(200, 240); this.active = false;
      }
      update() {
        if (!this.active) { if (Math.random() < 0.004) this.active = true; return; }
        this.x += Math.cos(this.angle) * this.spd;
        this.y += Math.sin(this.angle) * this.spd;
        this.life++;
        if (this.life > this.maxLife) this.reset();
      }
      draw() {
        if (!this.active) return;
        const a = Math.sin((this.life / this.maxLife) * Math.PI) * 0.9;
        ctx.save(); ctx.globalAlpha = a;
        const g = ctx.createLinearGradient(
          this.x - Math.cos(this.angle) * this.len,
          this.y - Math.sin(this.angle) * this.len,
          this.x, this.y
        );
        g.addColorStop(0, `hsla(${this.hue},100%,90%,0)`);
        g.addColorStop(1, `hsla(${this.hue},100%,95%,1)`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.4 * dpr;
        ctx.shadowBlur = 7; ctx.shadowColor = `hsl(${this.hue},100%,80%)`;
        ctx.beginPath();
        ctx.moveTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
        ctx.lineTo(this.x, this.y); ctx.stroke(); ctx.restore();
      }
    }

    const resize = () => {
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      particles = Array.from({ length: 240 }, () => new Particle(true));
      orbs = [
        new Orb(W * 0.22, H * 0.4, W * 0.3, 220, 0.003),
        new Orb(W * 0.75, H * 0.35, W * 0.26, 260, 0.004),
        new Orb(W * 0.5, H * 0.75, W * 0.2, 210, 0.005),
        new Orb(W * 0.12, H * 0.18, W * 0.16, 240, 0.006),
      ];
      shooters = Array.from({ length: 4 }, () => new Shooter());
    };

    const drawGrid = () => {
      ctx.save(); ctx.strokeStyle = "rgba(80,120,255,0.035)"; ctx.lineWidth = 0.5;
      const s = 55 * dpr;
      for (let x = 0; x < W; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();
    };

    const drawAurora = () => {
      const t = frame.current * 0.003;
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.globalAlpha = 0.016 + i * 0.005;
        ctx.strokeStyle = `hsl(${210 + i * 22},80%,65%)`; ctx.lineWidth = 38 * dpr;
        ctx.beginPath();
        for (let j = 0; j <= 10; j++) {
          const x = (j / 10) * W;
          const y = H * (0.28 + i * 0.1) + Math.sin(j * 0.9 + t + i * 1.3) * H * 0.055 * Math.sin(t * 0.4 + i);
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.restore();
      }
    };

    const drawCenterGlow = () => {
      const cx = W * 0.5, cy = H * 0.42;
      const mx = (mouse.current.x * dpr - cx) * 0.1 + cx;
      const my = (mouse.current.y * dpr - cy) * 0.1 + cy;
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, W * 0.36);
      g.addColorStop(0, "rgba(60,130,255,0.055)");
      g.addColorStop(0.5, "rgba(80,50,180,0.025)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    };

    const tick = () => {
      frame.current++;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#05080f"; ctx.fillRect(0, 0, W, H);
      drawGrid(); drawAurora();
      orbs.forEach(o => { o.update(); o.draw(); });
      drawCenterGlow();
      particles.forEach(p => { p.update(); p.draw(); });
      shooters.forEach(s => { s.update(); s.draw(); });
      animId = requestAnimationFrame(tick);
    };

    const onMouseMove = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onTouch = (e) => { mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    resize();
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default NebulaBackground;