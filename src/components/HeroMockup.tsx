import { motion } from "framer-motion";
import { QrCode, Star, ShoppingBag, Clock, Flame } from "lucide-react";

/**
 * Premium hero mockup: a large phone showing a menu UI
 * with a floating QR card and decorative elements.
 */
export function HeroMockup() {
  const menuItems = [
    { name: "Margherita Pizza", price: "₹299", tag: "Popular", color: "bg-orange-500" },
    { name: "Caesar Salad", price: "₹199", tag: "Healthy", color: "bg-green-500" },
    { name: "Butter Chicken", price: "₹349", tag: "Spicy", color: "bg-red-500" },
    { name: "Mango Lassi", price: "₹99", tag: "New", color: "bg-yellow-500" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* ── Phone ── */}
      <motion.div
        className="relative z-10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Phone frame */}
        <div className="w-[280px] sm:w-[300px] h-[560px] sm:h-[600px] bg-gray-900 rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.45)] border border-gray-700/60 relative overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-gray-900 rounded-b-2xl z-20" />

          {/* Screen */}
          <div className="absolute inset-[6px] rounded-[2.6rem] overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
            {/* Status bar */}
            <div className="flex justify-between items-center px-6 pt-9 pb-2 text-[10px] text-white/60">
              <span>9:41</span>
              <div className="flex gap-1 items-center">
                <div className="w-3.5 h-2 border border-white/40 rounded-sm relative">
                  <div className="absolute inset-[1px] right-[2px] bg-green-400 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* App header */}
            <div className="px-5 pt-2 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-[10px]">Welcome to</p>
                  <h3 className="text-white font-bold text-base">Digital Menu</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Search bar */}
              <div className="mt-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-white/30" />
                <span className="text-white/30 text-[10px]">Search menu items...</span>
              </div>
            </div>

            {/* Category pills */}
            <div className="px-5 flex gap-2 pb-3">
              {["All", "Pizza", "Salads", "Drinks"].map((cat, i) => (
                <div
                  key={cat}
                  className={`px-3 py-1 rounded-full text-[9px] font-medium ${
                    i === 0
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "bg-white/5 text-white/50 border border-white/10"
                  }`}
                >
                  {cat}
                </div>
              ))}
            </div>

            {/* Menu items */}
            <div className="px-4 space-y-2.5 pb-4">
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3 flex items-center gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                >
                  {/* Food image placeholder */}
                  <div className={`w-11 h-11 rounded-xl ${item.color}/20 flex items-center justify-center flex-shrink-0`}>
                    <Flame className={`w-5 h-5 ${item.color.replace("bg-", "text-")}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-[11px] font-semibold truncate">{item.name}</p>
                      <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${item.color}/20 ${item.color.replace("bg-", "text-")} font-medium`}>
                        {item.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-white/40 text-[9px]">4.{8 - i}</span>
                      <span className="text-white/20 text-[9px] mx-1">•</span>
                      <Clock className="w-2.5 h-2.5 text-white/30" />
                      <span className="text-white/40 text-[9px]">{15 + i * 5}min</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-[11px]">{item.price}</p>
                    <div className="w-6 h-6 mt-0.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ml-auto">
                      <ShoppingBag className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom nav */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-white/5 px-6 py-3 flex justify-around">
              {["Home", "Menu", "Cart", "Profile"].map((tab, i) => (
                <div key={tab} className="flex flex-col items-center gap-0.5">
                  <div className={`w-4 h-4 rounded-full ${i === 1 ? "bg-blue-500" : "bg-white/10"}`} />
                  <span className={`text-[8px] ${i === 1 ? "text-blue-400" : "text-white/30"}`}>{tab}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full" />
        </div>
      </motion.div>

      {/* ── Floating QR Card ── */}
      <motion.div
        className="absolute -left-6 sm:-left-10 top-16 sm:top-24 z-20"
        initial={{ opacity: 0, x: -40, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-4 border border-gray-100 dark:border-slate-700"
        >
          {/* Mini QR grid */}
          <div className="w-20 h-20 bg-white rounded-xl border-2 border-blue-500/20 relative overflow-hidden mb-2">
            <div className="absolute inset-2 grid grid-cols-6 gap-[2px]">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-[1px] ${
                    [0,1,2,5,6,11,12,17,18,23,24,29,30,31,32,35].includes(i)
                      ? "bg-blue-600"
                      : [3,8,14,21,27,33].includes(i)
                      ? "bg-purple-500"
                      : "bg-gray-200 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <QrCode className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <p className="text-[9px] font-semibold text-gray-800 dark:text-gray-200 text-center">Scan to view</p>
          <p className="text-[8px] text-gray-400 text-center">menu instantly</p>
        </motion.div>
      </motion.div>

      {/* ── Floating stats card ── */}
      <motion.div
        className="absolute -right-4 sm:-right-8 bottom-20 sm:bottom-28 z-20"
        initial={{ opacity: 0, x: 40, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-3.5 border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-800 dark:text-gray-200">4.9 Rating</p>
              <p className="text-[8px] text-gray-400">1,200+ reviews</p>
            </div>
          </div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Glow behind phone ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-[80px] translate-x-10 translate-y-10" />
      </div>
    </div>
  );
}
