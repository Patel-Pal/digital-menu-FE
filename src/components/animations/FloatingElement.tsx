import { useRef, useEffect, type ReactNode } from 'react';
import { gsap } from 'gsap';

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  className = '',
  amplitude = 12,
  duration = 3,
  delay = 0,
}: FloatingElementProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true, delay });
    tl.to(ref.current, {
      y: -amplitude,
      duration,
      ease: 'power1.inOut',
    });

    return () => {
      tl.kill();
    };
  }, [amplitude, duration, delay]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
