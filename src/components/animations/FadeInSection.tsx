import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
}

const getVariants = (direction: string, distance: number): Variants => {
  const offsets: Record<string, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };
  const { x, y } = offsets[direction] || offsets.up;

  return {
    hidden: { opacity: 0, x, y },
    visible: { opacity: 1, x: 0, y: 0 },
  };
};

export function FadeInSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 40,
  duration = 0.6,
}: FadeInSectionProps) {
  return (
    <motion.div
      className={className}
      variants={getVariants(direction, distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
