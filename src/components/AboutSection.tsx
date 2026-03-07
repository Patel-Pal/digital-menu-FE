import { useRef, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  QrCode, Users, Star, CheckCircle, TrendingUp,
  BarChart3, ArrowRight, Smartphone, ShoppingBag,
  Clock, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

const ctnr: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
const itm: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const feats = [
  { icon: Zap, color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", title: "1000+ Restaurants", sub: "Trusted by businesses worldwide" },
  { icon: Star, color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", title: "4.9/5 Rating", sub: "Loved by our customers" },
  { icon: CheckCircle, color: "from-emerald-500 to-green-500", bg: "bg-emerald-500/10", title: "99.9% Uptime", sub: "Enterprise-grade reliability" },
];

interface Props { onGetStarted: () => void; }
/* ── Illustration: Phone with dashboard overlay ── */
function PhoneIllustration() {
  const menuItems = [
    { name: "Margherita Pizza", price: "₹299", tag: "Popular", emoji: "🍕" },
    { name: "Caesar Salad", price: "₹199", tag: "Healthy", emoji: "🥗" },
    { name: "Butter Chicken", price: "₹349", tag: "Bestseller", emoji: "🍛" },
  ];

  return (
    <div className="relative">
      {/* Phone frame */}
      <div className="w-[260px] sm:w-[280px] h-[520px] sm:h-[560px] bg-gray-900 rounded-[2.8rem] shadow-[0_25px_80px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.6)] border border-gray-700/50 relative overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-20" />

        {/* Screen */}
        <div className="absolute inset-[5px] rounded-[2.4rem] overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          {/* Status bar */}
          <div className="flex justify-between items-center px-6 pt-8 pb-1 text-[10px] text-gray-400 dark:text-white/50">
            <span>9:41</span>
            <div className="flex gap-1 items-center">
              <div className="w-3.5 h-2 border border-gray-300 dark:border-white/30 rounded-sm relative">
                <div className="absolute inset-[1px] right-[2px] bg-green-400 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* App header */}
          <div className="px-5 pt-1 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 dark:text-white/40 text-[9px]">Your Restaurant</p>
                <h3 className="text-gray-900 dark:text-white font-bold text-sm">Digital Menu</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <QrCode className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Analytics mini card */}
          <div className="mx-4 mb-3 p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] text-white/70">Today's Overview</p>
              <TrendingUp className="w-3 h-3 text-white/70" />
            </div>
            <div className="flex justify-between">
              {[
                { v: "142", l: "Orders" },
                { v: "₹24K", l: "Revenue" },
                { v: "89", l: "Scans" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="text-sm font-bold">{s.v}</p>
                  <p className="text-[8px] text-white/60">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Menu items */}
          <div className="px-4 space-y-2">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-white/40 px-1">Popular Items</p>
            {menuItems.map((item, i) => (
              <motion.div
                key={item.name}
                className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 rounded-2xl p-3 flex items-center gap-3 shadow-sm"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 dark:text-white text-[11px] font-semibold truncate">{item.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-gray-400 text-[9px]">4.{8 - i}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">{item.tag}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-gray-900 dark:text-white font-bold text-[11px]">{item.price}</p>
                  <div className="w-6 h-6 mt-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ml-auto">
                    <ShoppingBag className="w-3 h-3 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-100 dark:border-white/5 px-6 py-2.5 flex justify-around">
            {["Home", "Menu", "Cart", "Profile"].map((tab, i) => (
              <div key={tab} className="flex flex-col items-center gap-0.5">
                <div className={`w-4 h-4 rounded-full ${i === 0 ? "bg-blue-500" : "bg-gray-200 dark:bg-white/10"}`} />
                <span className={`text-[7px] ${i === 0 ? "text-blue-500 font-medium" : "text-gray-400 dark:text-white/30"}`}>{tab}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Floating dashboard card - top right */}
      <motion.div
        className="absolute -right-8 sm:-right-16 top-8 z-20"
        initial={{ opacity: 0, x: 30, scale: 0.9 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-3 border border-gray-100 dark:border-slate-700 w-[140px]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">Analytics</span>
          </div>
          <div className="flex items-end gap-1 h-10 mb-1">
            {[35, 55, 40, 70, 50, 80, 65].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-purple-400"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.06, duration: 0.4 }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-gray-400">This week</span>
            <span className="text-[9px] font-bold text-green-500">+32%</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating scan counter - bottom left */}
      <motion.div
        className="absolute -left-6 sm:-left-12 bottom-24 z-20"
        initial={{ opacity: 0, x: -30, scale: 0.9 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-3 border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">256 Scans</p>
              <p className="text-[9px] text-emerald-500 font-medium">+18% today</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
/* ── Right side text content ── */
function RightContent({ onGetStarted }: Props) {
  return (
    <motion.div
      className="space-y-8"
      variants={ctnr}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <motion.div variants={itm} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">About Us</span>
      </motion.div>

      <motion.h2 variants={itm} className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight">
        Empowering Restaurants{" "}
        <br className="hidden sm:block" />
        with{" "}
        <span className="relative inline-block">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Smart Menus
          </span>
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-cyan-500/15 blur-lg -z-10 rounded-lg"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.h2>

      <motion.p variants={itm} className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
        We help restaurants go digital with beautiful QR-based menus, real-time
        analytics, and seamless ordering — all designed to elevate the dining experience
        for both owners and customers.
      </motion.p>

      {/* Feature cards */}
      <motion.div variants={itm} className="space-y-3 pt-2">
        {feats.map((f, i) => (
          <motion.div
            key={f.title}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-blue-500/30 hover:bg-card transition-all duration-300 cursor-default group"
            whileHover={{ x: 6, transition: { duration: 0.2 } }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <f.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{f.sub}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
          </motion.div>
        ))}
      </motion.div>


    </motion.div>
  );
}
/* ── Main exported component ── */
export function AboutSection({ onGetStarted }: Props) {
  const illustrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!illustrationRef.current) return;
    const el = illustrationRef.current;

    const ctx = gsap.context(() => {
      /* subtle continuous float */
      gsap.to(el, {
        y: 12,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      /* parallax depth on scroll */
      gsap.to(el, {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="py-20 sm:py-28 px-4 relative overflow-hidden bg-muted/30">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          {/* LEFT — Phone illustration with floating cards */}
          <motion.div
            ref={illustrationRef}
            className="relative flex justify-center order-2 lg:order-1"
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            {/* Glow behind phone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
              <div className="absolute w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[60px] translate-x-8 translate-y-8" />
            </div>

            <PhoneIllustration />
          </motion.div>

          {/* RIGHT — Text content */}
          <div className="order-1 lg:order-2">
            <RightContent onGetStarted={onGetStarted} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}