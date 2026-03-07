import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverLift?: number;
  hoverScale?: number;
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  hoverLift = 8,
  hoverScale = 1.02,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -hoverLift,
        scale: hoverScale,
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}
