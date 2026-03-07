import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function AnimatedButton({ children, className = '', onClick }: AnimatedButtonProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{
        scale: 0.97,
        transition: { duration: 0.1 },
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
