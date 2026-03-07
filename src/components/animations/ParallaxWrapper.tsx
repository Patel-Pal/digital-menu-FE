import { useRef, useEffect, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxWrapperProps {
  children?: ReactNode;
  className?: string;
  speed?: number; // negative = slower, positive = faster
  direction?: 'vertical' | 'horizontal';
}

export function ParallaxWrapper({
  children,
  className = '',
  speed = -50,
  direction = 'vertical',
}: ParallaxWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const prop = direction === 'vertical' ? 'y' : 'x';

    const trigger = gsap.to(ref.current, {
      [prop]: speed,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    return () => {
      trigger.scrollTrigger?.kill();
      trigger.kill();
    };
  }, [speed, direction]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
