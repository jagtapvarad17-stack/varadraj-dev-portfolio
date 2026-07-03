import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export interface MagicBentoCardProps {
  children: ReactNode;
  className?: string;
  /** RGB values as a string, e.g. "132, 0, 255" */
  glowColor?: string;
  spotlightRadius?: number;
  particleCount?: number;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableStars?: boolean;
  clickEffect?: boolean;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
}

/* ─────────────────────────────────────────────
   Helper – random number in range
───────────────────────────────────────────── */
const rand = (min: number, max: number) =>
  Math.random() * (max - min) + min;

/* ─────────────────────────────────────────────
   MagicBentoCard
───────────────────────────────────────────── */
const MagicBentoCard: React.FC<MagicBentoCardProps> = ({
  children,
  className = "",
  glowColor = "0, 208, 255",
  spotlightRadius = 400,
  particleCount = 12,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableStars = true,
  clickEffect = true,
  disableAnimations = false,
  style,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);

  const [mouse, setMouse] = useState({ x: -9999, y: -9999, inside: false });
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const rippleIdRef = useRef(0);

  /* ── Star initialisation ── */
  const initStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;
    starsRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: rand(0, width),
      y: rand(0, height),
      size: rand(0.5, 2.2),
      opacity: rand(0.15, 0.75),
      speedX: rand(-0.12, 0.12),
      speedY: rand(-0.22, -0.04),
      twinkleSpeed: rand(0.008, 0.025),
      twinkleOffset: rand(0, Math.PI * 2),
    }));
  }, [particleCount]);

  /* ── Canvas animation loop ── */
  useEffect(() => {
    if (!enableStars || disableAnimations) return;

    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const resize = () => {
      canvas.width = card.offsetWidth;
      canvas.height = card.offsetHeight;
      initStars();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(card);
    resize();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        const twinkle =
          0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${glowColor}, ${alpha})`;
        ctx.fill();

        star.x += star.speedX;
        star.y += star.speedY;

        if (star.y < -5) star.y = canvas.height + 5;
        if (star.x < -5) star.x = canvas.width + 5;
        if (star.x > canvas.width + 5) star.x = -5;
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [enableStars, disableAnimations, glowColor, initStars]);

  /* ── Mouse tracking ── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        inside: true,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setMouse({ x: -9999, y: -9999, inside: false });
  }, []);

  /* ── Click ripple ── */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!clickEffect || disableAnimations) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const id = rippleIdRef.current++;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(
        () => setRipples((prev) => prev.filter((r) => r.id !== id)),
        750
      );
    },
    [clickEffect, disableAnimations]
  );

  /* ── Dynamic styles ── */
  const spotlightStyle: React.CSSProperties =
    enableSpotlight && mouse.inside && !disableAnimations
      ? {
          background: `radial-gradient(circle ${spotlightRadius}px at ${mouse.x}px ${mouse.y}px, rgba(${glowColor}, 0.10) 0%, transparent 70%)`,
        }
      : {};

  const borderGlowStyle: React.CSSProperties =
    enableBorderGlow && mouse.inside && !disableAnimations
      ? {
          borderColor: `rgba(${glowColor}, 0.55)`,
          boxShadow: `0 0 0 1px rgba(${glowColor}, 0.22),
                      0 0 24px rgba(${glowColor}, 0.14),
                      inset 0 0 32px rgba(${glowColor}, 0.03)`,
        }
      : {};

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`magic-bento-card ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        transition: disableAnimations
          ? "none"
          : "border-color 0.3s ease, box-shadow 0.3s ease",
        ...borderGlowStyle,
        ...style,
      }}
    >
      {/* Floating star particles */}
      {enableStars && !disableAnimations && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Cursor spotlight */}
      {enableSpotlight && !disableAnimations && (
        <div
          aria-hidden="true"
          style={{
            ...spotlightStyle,
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      {/* Click ripples */}
      {clickEffect &&
        !disableAnimations &&
        ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden="true"
            className="magic-bento-ripple"
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              background: `rgba(${glowColor}, 0.3)`,
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        ))}

      {/* Card content */}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
};

export default MagicBentoCard;
