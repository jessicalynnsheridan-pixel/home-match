"use client";

import { useRef, useCallback, CSSProperties, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max rotation in degrees, default 6 */
  intensity?: number;
  /** Disable tilt (e.g. on touch devices or when user prefers reduced motion) */
  disabled?: boolean;
}

/**
 * TiltCard, mouse-tracked 3D perspective tilt with radial shine overlay.
 *
 * Usage:
 *   <TiltCard className="rounded-2xl overflow-hidden shadow-warm-md">
 *     ...content...
 *   </TiltCard>
 *
 * Requires globals.css classes: .tilt-wrap, .tilt-shine
 */
export default function TiltCard({
  children,
  className = "",
  style,
  intensity = 6,
  disabled = false,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();

      // Normalised position: -1 … +1
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateX = -(y * intensity * 2).toFixed(2);
      const rotateY = (x * intensity * 2).toFixed(2);

      // CSS custom properties for the shine radial gradient position
      const mouseXPct = `${((e.clientX - rect.left) / rect.width) * 100}%`;
      const mouseYPct = `${((e.clientY - rect.top) / rect.height) * 100}%`;

      ref.current.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
      ref.current.style.setProperty("--mouse-x", mouseXPct);
      ref.current.style.setProperty("--mouse-y", mouseYPct);
    },
    [disabled, intensity]
  );

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      className={`tilt-wrap ${className}`}
    >
      {/* Shine overlay, positioned by --mouse-x/--mouse-y CSS vars */}
      <div className="tilt-shine" aria-hidden />
      {children}
    </div>
  );
}
