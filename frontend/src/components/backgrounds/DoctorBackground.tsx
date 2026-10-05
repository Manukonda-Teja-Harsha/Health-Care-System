import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export function DoctorBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [videoError, setVideoError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Subtle mouse-based parallax
  useEffect(() => {
    if (shouldReduceMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p !== undefined) p.catch(() => {});
  }, []);

  return (
    // ── CRITICAL: position ABSOLUTE, NOT fixed ──
    // Scoped to the main content area only — never bleeds into the sidebar.
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* Real clinical / medical technology video */}
      {!videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{
            transform: shouldReduceMotion
              ? 'none'
              : `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px) scale(1.06)`,
            opacity: 0.4,
            filter: 'brightness(0.5) saturate(0.85) hue-rotate(-10deg)',
          }}
        >
          <source src="/doctor-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Fallback gradient if video fails */}
      {videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-background to-background" />
      )}

      {/* Blue clinical tint */}
      <div className="absolute inset-0 bg-blue-950/10 mix-blend-multiply" />
      {/* Top gradient for header readability */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background/80 to-transparent" />
      {/* Bottom fade */}
      <div className="absolute left-0 right-0 bottom-0 h-2/3 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
      {/* Overall readability veil */}
      <div className="absolute inset-0 bg-background/22" />

      {/* Atmospheric telemetry overlay — top-right, xl screens only */}
      <div className="absolute top-8 right-8 hidden xl:flex flex-col items-end space-y-1.5 opacity-[0.18] font-mono text-[9px] tracking-widest text-foreground pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
          <span>DIAGNOSTIC_SUITE // CLINICAL_OS</span>
        </div>
        <div>12 PATIENTS &bull; 03 PENDING</div>
        <div>REPORT ACCURACY: 98.4% &bull; ON-DUTY</div>
      </div>
    </div>
  );
}
