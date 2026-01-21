import { motion } from "framer-motion";
import { QrCode, Smartphone, Sparkles } from "lucide-react";

export function Simple3DQR() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          rotateY: [0, 360],
          rotateX: [0, 10, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* QR Code Base */}
        <div className="w-48 h-48 bg-white rounded-2xl shadow-2xl border-4 border-blue-500/20 relative overflow-hidden">
          {/* QR Pattern */}
          <div className="absolute inset-4 grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }).map((_, i) => (
              <motion.div
                key={i}
                className={`rounded-sm ${
                  Math.random() > 0.5 ? 'bg-blue-600' : 'bg-transparent'
                }`}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
          
          {/* Center Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
        
        <motion.div
          className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-30"
          animate={{
            y: [0, 15, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 1,
          }}
        />
      </motion.div>
    </div>
  );
}

export function Simple3DPhone() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          rotateY: [0, 15, -15, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Phone Body */}
        <div className="w-32 h-56 bg-gray-900 rounded-3xl shadow-2xl relative overflow-hidden border-2 border-gray-700">
          {/* Screen */}
          <div className="absolute inset-2 bg-black rounded-2xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-blue-900 to-purple-900 relative">
              {/* Menu Items */}
              <div className="p-3 space-y-2">
                <div className="text-white text-xs font-bold mb-2">Digital Menu</div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-6 bg-white/10 rounded backdrop-blur-sm"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
              
              {/* Screen Glow */}
              <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-600 rounded-full" />
        </div>
        
        {/* Floating Sparkles */}
        <Sparkles className="absolute -top-4 -right-4 w-6 h-6 text-yellow-400 animate-pulse" />
        <Sparkles className="absolute -bottom-4 -left-4 w-4 h-4 text-blue-400 animate-pulse" />
      </motion.div>
    </div>
  );
}
