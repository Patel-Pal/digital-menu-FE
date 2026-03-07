import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlowPulseProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function GlowPulse({
  children,
  className = '',
  color = 'rgba(59, 130, 246, 0.4)',
}: GlowPulseProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        animate={{
          boxShadow: [
            `0 0 20px ${color}`,
            `0 0 40px ${color}`,
            `0 0 20px ${color}`,
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {children}
    </motion.div>
  );
}
