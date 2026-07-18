import { useEffect, useRef } from 'react';

// 极简优雅的背景：纯色 + 微妙的渐变光斑动画
export default function Background3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let w = 0;
    let h = 0;

    // 柔和的光斑粒子
    const particles: {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      color: string;
    }[] = [];

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function initParticles() {
      particles.length = 0;
      const colors = [
        'rgba(96, 165, 250, 0.04)',
        'rgba(139, 92, 246, 0.03)',
        'rgba(59, 130, 246, 0.035)',
        'rgba(30, 58, 138, 0.03)',
      ];
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 120 + Math.random() * 180,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1,
          color: colors[i % colors.length],
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.r) p.x = w + p.r;
        if (p.x > w + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = h + p.r;
        if (p.y > h + p.r) p.y = -p.r;

        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx!.fillStyle = grad;
        ctx!.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: '#08080a',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
