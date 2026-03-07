import { motion, AnimatePresence } from "framer-motion";

interface WelcomeSplashProps {
  shopName: string;
  shopLogo?: string;
  visible: boolean;
}

export function WelcomeSplash({ shopName, shopLogo, visible }: WelcomeSplashProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* Background decorative circles */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-[500px] h-[500px] rounded-full bg-primary"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.03 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            className="absolute w-[700px] h-[700px] rounded-full bg-primary"
          />

          {/* Utensils icon or shop logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 150, delay: 0.2 }}
            className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-lg overflow-hidden"
          >
            {shopLogo ? (
              <img src={shopLogo} alt={shopName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">🍽️</span>
            )}
          </motion.div>

          {/* Animated dots / loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 mb-8"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: 2, delay: 0.5 + i * 0.15, ease: "easeInOut" }}
                className="w-2.5 h-2.5 rounded-full bg-primary"
              />
            ))}
          </motion.div>

          {/* Welcome text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-sm text-muted-foreground mb-2"
          >
            Welcome to
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-2xl font-bold text-center px-6"
          >
            {shopName || "Digital Menu"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="text-xs text-muted-foreground mt-3"
          >
            Powered by Digital Menu
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
