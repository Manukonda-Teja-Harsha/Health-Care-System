import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export function PatientBackground() {
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
    // This keeps the video scoped to the main content area only.
    // The sidebar sits outside this container with its own stacking context.
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* Real hospital/patient-care video */}
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
            opacity: 0.45,
            filter: 'brightness(0.55) saturate(1.1)',
          }}
        >
          <source src="/patient-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Fallback gradient if video fails */}
      {videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-background to-background" />
      )}

      {/* Top gradient: darken near header for text readability */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background/80 to-transparent" />
      {/* Bottom gradient: fade out toward page bottom */}
      <div className="absolute left-0 right-0 bottom-0 h-2/3 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
      {/* Overall content-readability veil */}
      <div className="absolute inset-0 bg-background/25" />

      {/* Atmospheric telemetry — top-right corner, xl screens only */}
      <div className="absolute top-8 right-8 hidden xl:flex flex-col items-end space-y-1.5 opacity-[0.18] font-mono text-[9px] tracking-widest text-foreground pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span>PATIENT_PORTAL // CONNECTED</span>
        </div>
        <div>♥ 72 BPM &bull; SpO₂ 98%</div>
        <div>WELLNESS INDEX: 94.2 &bull; OPTIMAL</div>
      </div>
    </div>
  );
}
