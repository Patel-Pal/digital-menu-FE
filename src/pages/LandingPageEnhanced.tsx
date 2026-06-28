import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  QrCode, Smartphone, BarChart3, Palette, Users, Star,
  CheckCircle, ArrowRight, Menu, X, Mail, Phone, MapPin,
  Zap, Shield, ChefHat, ClipboardList, CreditCard,
  Utensils, Bell, Globe, Clock, TrendingUp, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect, useRef } from "react";
import { adminService } from "@/services/adminService";
import { ContactPopup } from "@/components/ContactPopup";
import { FreeTrialPopup } from "@/components/FreeTrialPopup";
import { DemoCredentials } from "@/components/DemoCredentials";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import {
  FadeInSection, StaggerContainer, StaggerItem,
  AnimatedCard, ParallaxWrapper, AnimatedButton, TextReveal,
} from "@/components/animations";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactPopupOpen, setContactPopupOpen] = useState(false);
  const [freeTrialPopupOpen, setFreeTrialPopupOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: "[email]", phone: "[phone]", address: "[address]",
  });

  useSmoothScroll();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".parallax-orb").forEach((orb) => {
        gsap.to(orb, {
          y: () => gsap.utils.random(-60, 60),
          scrollTrigger: { trigger: orb, start: "top bottom", end: "bottom top", scrub: 1.5 },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await adminService.getContactInfo();
      if (response.data) {
        setContactInfo({ email: response.data.email, phone: response.data.phone, address: response.data.address });
      }
    } catch (error) {
      console.error("Failed to fetch contact info:", error);
    }
  };

  const features = [
    { icon: <QrCode className="h-6 w-6" />, title: "QR Code Ordering", description: "Customers scan & order from their phone. No app download needed.", color: "from-blue-500 to-cyan-500" },
    { icon: <ClipboardList className="h-6 w-6" />, title: "Real-Time Orders", description: "Orders appear instantly on your dashboard with table numbers.", color: "from-purple-500 to-pink-500" },
    { icon: <Utensils className="h-6 w-6" />, title: "Table Management", description: "See all active tables, manage orders & bills from one view.", color: "from-green-500 to-emerald-500" },
    { icon: <CreditCard className="h-6 w-6" />, title: "Auto Billing", description: "Generate bills automatically from completed orders with tax.", color: "from-orange-500 to-red-500" },
    { icon: <ChefHat className="h-6 w-6" />, title: "Staff Apps", description: "Dedicated interfaces for waiters and kitchen staff.", color: "from-yellow-500 to-orange-500" },
    { icon: <BarChart3 className="h-6 w-6" />, title: "Analytics", description: "Track revenue, popular items, and business trends.", color: "from-indigo-500 to-purple-500" },
  ];

  const howItWorks = [
    { step: "01", title: "Set Up Your Menu", description: "Add categories, items, prices & images in minutes. Update anytime.", icon: Palette, color: "from-blue-500 to-cyan-500" },
    { step: "02", title: "Generate QR Code", description: "Get a customizable QR code to place on your tables.", icon: QrCode, color: "from-purple-500 to-pink-500" },
    { step: "03", title: "Customers Order", description: "Diners scan, browse, and order directly from their phone.", icon: Smartphone, color: "from-green-500 to-emerald-500" },
    { step: "04", title: "Manage & Bill", description: "Approve orders, track tables, generate bills — all in one dashboard.", icon: CreditCard, color: "from-orange-500 to-red-500" },
  ];

  const pricing = [
    { name: "Free", price: "₹0", period: "/month", description: "Perfect to get started", features: ["Digital menu with QR code", "Custom QR code styling", "Categories & menu items", "Shop settings & theme", "Customers can view menu"], popular: false },
    { name: "Pro", price: "₹599", period: "/month", description: "Everything unlocked for your restaurant", features: ["Everything in Free", "Order management", "Table management", "Billing with auto tax", "Waiter & Chef apps", "Analytics & billing analytics", "Data export"], popular: true },
  ];

  const testimonials = [
    { name: "Rajesh Kumar", role: "Owner, Spice Garden", quote: "Order mistakes dropped to zero. Our kitchen gets orders instantly and customers love the experience.", rating: 5, avatar: "RK" },
    { name: "Priya Sharma", role: "Manager, Cafe Bloom", quote: "Setup took 20 minutes. We saved ₹5000/month on printing costs alone. The analytics are a game-changer.", rating: 5, avatar: "PS" },
    { name: "Amit Patel", role: "Owner, The Food Hub", quote: "Table management is brilliant. I can see all active orders at a glance during peak hours. No more chaos.", rating: 5, avatar: "AP" },
  ];

  const heroContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };
  const heroItem = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const } },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <style>{`
        html::-webkit-scrollbar { width: 8px; }
        html::-webkit-scrollbar-track { background: transparent; }
        html::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #3b82f6, #8b5cf6); border-radius: 4px; }
        html::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #2563eb, #7c3aed); }
        html { scrollbar-color: #3b82f6 transparent; }
      `}</style>

      {/* ─── Navigation ─── */}
      <motion.nav
        className="fixed top-0 w-full bg-background/70 backdrop-blur-xl border-b border-white/10 z-50"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
              <div className="h-9 w-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Digital Menu
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {["features", "how-it-works", "pricing", "testimonials", "contact"].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors capitalize"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                >
                  {item.replace("-", " ")}
                </motion.a>
              ))}
              <ThemeToggle />
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <AnimatedButton>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20" onClick={() => setFreeTrialPopupOpen(true)}>
                    Start Free
                  </Button>
              </AnimatedButton>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <motion.div
              className="md:hidden py-4 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {["features", "how-it-works", "pricing", "testimonials", "contact"].map((item) => (
                <a key={item} href={`#${item}`} className="block text-muted-foreground hover:text-foreground capitalize py-1" onClick={() => setMobileMenuOpen(false)}>
                  {item.replace("-", " ")}
                </a>
              ))}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <div className="flex gap-2 pt-3">
                <Link to="/auth/login" className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link>
                <Button className="flex-1 w-full bg-gradient-to-r from-blue-600 to-purple-600" onClick={() => { setMobileMenuOpen(false); setFreeTrialPopupOpen(true); }}>Start Free</Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative pt-20 sm:pt-32 pb-10 sm:pb-24 px-4 overflow-hidden min-h-[auto] sm:min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/50 to-cyan-50 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-cyan-950/30" />
        <div className="parallax-orb absolute top-20 left-[10%] w-48 sm:w-96 h-48 sm:h-96 bg-blue-400/10 rounded-full blur-[60px] sm:blur-[100px]" />
        <div className="parallax-orb absolute bottom-20 right-[10%] w-64 sm:w-[500px] h-64 sm:h-[500px] bg-purple-400/10 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="hidden sm:block parallax-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/8 rounded-full blur-[80px]" />

        <motion.div className="relative z-20 max-w-7xl mx-auto w-full" style={{ y: heroY, opacity: heroOpacity }}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div className="space-y-8" variants={heroContainer} initial="hidden" animate="visible">
              <motion.div variants={heroItem}>
                <Badge className="px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/10">
                  <Zap className="h-3 w-3 mr-1.5" /> No commission. No middleman.
                </Badge>
              </motion.div>

              <motion.h1 variants={heroItem} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] tracking-tight">
                Your Restaurant,{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Fully Digital
                  </span>
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-cyan-600/15 blur-xl -z-10 rounded-2xl"
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.03, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </span>
              </motion.h1>

              <motion.p variants={heroItem} className="text-base sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                From QR code menus to real-time orders, table management, and automatic billing — run your entire dine-in operation from one platform.
              </motion.p>

              <motion.div variants={heroItem} className="flex flex-col sm:flex-row gap-3">
                <AnimatedButton>
                    <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40" onClick={() => setFreeTrialPopupOpen(true)}>
                      Get Started Free <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                </AnimatedButton>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 group" onClick={() => { const el = document.getElementById('how-it-works'); el?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <Play className="mr-2 h-4 w-4 group-hover:text-blue-600 transition-colors" /> See How It Works
                </Button>
              </motion.div>

              <motion.div variants={heroItem} className="flex items-center justify-between sm:justify-start gap-4 sm:gap-10 pt-4 sm:pt-6">
                {[
                  { value: "1000+", label: "Restaurants" },
                  { value: "50K+", label: "Orders/Month" },
                  { value: "4.9★", label: "Rating" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                    <div className="text-[10px] sm:text-sm text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative hidden lg:block"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/* Dashboard mockup */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.5)] border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200/70 dark:bg-slate-700 rounded-md px-3 py-1 text-[10px] text-muted-foreground text-center">
                        digitalmenu.devinpro.co.in/shop
                      </div>
                    </div>
                  </div>
                  {/* Dashboard content */}
                  <div className="p-5 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Today's Orders", value: "47", change: "+12%", color: "text-blue-600" },
                        { label: "Revenue", value: "₹18.4K", change: "+8%", color: "text-green-600" },
                        { label: "Active Tables", value: "12", change: "", color: "text-purple-600" },
                      ].map((s) => (
                        <div key={s.label} className="bg-gray-50 dark:bg-slate-800/80 rounded-xl p-3">
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                          {s.change && <p className="text-[9px] text-green-500">{s.change}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Orders list */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Recent Orders</p>
                      {[
                        { table: "T-05", name: "Rahul M.", amount: "₹680", status: "Pending", statusColor: "bg-yellow-500" },
                        { table: "T-02", name: "Anita S.", amount: "₹420", status: "Approved", statusColor: "bg-blue-500" },
                        { table: "T-08", name: "Vikram P.", amount: "₹950", status: "Completed", statusColor: "bg-green-500" },
                      ].map((order) => (
                        <div key={order.table} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-blue-600">{order.table}</span>
                            </div>
                            <div>
                              <p className="text-[11px] font-medium">{order.name}</p>
                              <p className="text-[10px] text-muted-foreground">{order.amount}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${order.statusColor}`} />
                            <span className="text-[10px] text-muted-foreground">{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating notification */}
              <motion.div
                className="absolute -left-8 top-12 z-20"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-3 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold">New Order!</p>
                    <p className="text-[9px] text-muted-foreground">Table 5 • ₹680</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── Trusted By Banner ─── */}
      <section className="py-8 sm:py-12 px-4 border-y border-border/50 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <FadeInSection>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Trusted by restaurants across India</p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-14 opacity-60">
              {["Spice Garden", "Cafe Bloom", "The Food Hub", "Royal Kitchen", "Urban Bites"].map((name) => (
                <span key={name} className="text-sm sm:text-lg font-bold text-muted-foreground/60">{name}</span>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ─── Demo Credentials Section ─── */}
      <DemoCredentials />

      {/* ─── Features Section ─── */}
      <section id="features" className="py-14 sm:py-28 px-4 relative overflow-hidden">
        <div className="hidden sm:block parallax-orb absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <FadeInSection>
              <Badge className="mb-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">Features</Badge>
            </FadeInSection>
            <TextReveal as="h2" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Everything to Run Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dine-In Business</span>
            </TextReveal>
            <FadeInSection delay={0.2}>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Replace paper menus, manual order-taking, and messy billing with one platform. Set up in 30 minutes.
              </p>
            </FadeInSection>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5" staggerDelay={0.08}>
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <AnimatedCard className="h-full" hoverLift={8} hoverScale={1.02}>
                  <Card className="h-full border-0 bg-gradient-to-br from-background to-muted/30 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
                    <CardContent className="p-4 sm:p-6 relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                      <div className="flex items-center gap-3 sm:block">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1 sm:flex-none">
                          <h3 className="text-base sm:text-lg font-semibold mb-0.5 sm:mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Beautiful Menus for Every Concept ─── */}
      <section className="py-14 sm:py-28 px-4 bg-muted/30 relative overflow-hidden">
        <div className="hidden sm:block parallax-orb absolute top-20 left-[20%] w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <FadeInSection>
              <Badge className="mb-4 bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20">Themes</Badge>
            </FadeInSection>
            <TextReveal as="h2" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Beautiful Menus for{" "}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Every Concept</span>
            </TextReveal>
            <FadeInSection delay={0.2}>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose from 6 stunning themes that match your restaurant's personality. Each theme adapts to your brand colors and style.
              </p>
            </FadeInSection>
          </div>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5" staggerDelay={0.08}>
            {[
              { name: "Coral", gradient: "from-rose-400 to-orange-400", bg: "bg-rose-50 dark:bg-rose-950/20", accent: "text-rose-600", items: ["🍕", "🥗", "🍝"] },
              { name: "Ocean", gradient: "from-blue-400 to-cyan-400", bg: "bg-blue-50 dark:bg-blue-950/20", accent: "text-blue-600", items: ["🍣", "🦐", "🐟"] },
              { name: "Forest", gradient: "from-green-400 to-emerald-400", bg: "bg-green-50 dark:bg-green-950/20", accent: "text-green-600", items: ["🥬", "🍄", "🌿"] },
              { name: "Sunset", gradient: "from-orange-400 to-amber-400", bg: "bg-orange-50 dark:bg-orange-950/20", accent: "text-orange-600", items: ["🍛", "🍲", "🫕"] },
              { name: "Midnight", gradient: "from-slate-600 to-indigo-600", bg: "bg-slate-50 dark:bg-slate-950/30", accent: "text-indigo-600", items: ["🍸", "🥂", "🍷"] },
              { name: "Lavender", gradient: "from-purple-400 to-violet-400", bg: "bg-purple-50 dark:bg-purple-950/20", accent: "text-purple-600", items: ["🧁", "🍰", "☕"] },
            ].map((theme, index) => (
              <StaggerItem key={index}>
                <AnimatedCard className="h-full" hoverLift={8} hoverScale={1.04}>
                  <div className={`rounded-2xl border border-border/50 overflow-hidden ${theme.bg} h-full group cursor-pointer transition-all duration-300 hover:shadow-lg`}>
                    {/* Theme header bar */}
                    <div className={`h-2 bg-gradient-to-r ${theme.gradient}`} />
                    {/* Mini menu preview */}
                    <div className="p-3 sm:p-4 space-y-2">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Palette className="w-4 h-4 text-white" />
                      </div>
                      {/* Fake menu items */}
                      {theme.items.map((emoji, i) => (
                        <div key={i} className="flex items-center gap-2 bg-background/60 rounded-lg p-1.5 sm:p-2">
                          <span className="text-sm sm:text-base">{emoji}</span>
                          <div className="flex-1 space-y-1">
                            <div className={`h-1.5 rounded-full bg-gradient-to-r ${theme.gradient} opacity-40 w-3/4`} />
                            <div className="h-1 rounded-full bg-muted-foreground/10 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Theme name */}
                    <div className="px-3 pb-3 sm:px-4 sm:pb-4 text-center">
                      <p className={`text-xs sm:text-sm font-semibold ${theme.accent}`}>{theme.name}</p>
                    </div>
                  </div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeInSection delay={0.4}>
            <div className="text-center mt-10">
              <p className="text-sm text-muted-foreground mb-4">Every theme is fully responsive, supports dark mode, and updates instantly.</p>
              <AnimatedButton>
                  <Button variant="outline" className="group" onClick={() => setFreeTrialPopupOpen(true)}>
                    Try All Themes Free <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </AnimatedButton>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-14 sm:py-28 px-4 relative overflow-hidden">
        <div className="hidden sm:block parallax-orb absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <FadeInSection>
              <Badge className="mb-4 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">How It Works</Badge>
            </FadeInSection>
            <TextReveal as="h2" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Go Live in{" "}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">4 Simple Steps</span>
            </TextReveal>
            <FadeInSection delay={0.2}>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
                From signup to your first customer order in under 30 minutes.
              </p>
            </FadeInSection>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                {/* Connector line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-40px)] h-[2px] bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="text-center group">
                  <div className="relative inline-block mb-3 sm:mb-5">
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      <span className="text-[8px] sm:text-[10px] font-bold text-muted-foreground">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xs sm:text-base font-semibold mb-1 sm:mb-2">{step.title}</h3>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section className="py-14 sm:py-28 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeInSection>
              <div className="space-y-6">
                <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">Why Digital Menu?</Badge>
                <h2 className="text-2xl sm:text-4xl font-bold leading-tight">
                  Not a Delivery App.{" "}
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">No Commission.</span>
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed">
                  Unlike Zomato or Swiggy that take 20-30% of every order, Digital Menu is for dine-in management. 
                  Your customers are already in your restaurant. You keep 100% of the revenue.
                </p>
                <div className="space-y-4 pt-2">
                  {[
                    { icon: Globe, text: "Works on any smartphone — no app download" },
                    { icon: Clock, text: "Set up in 30 minutes, not 30 days" },
                    { icon: Shield, text: "Your data, your customers — we're just the tool" },
                    { icon: TrendingUp, text: "Real-time insights into your business" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Comparison card */}
            <FadeInSection delay={0.2}>
              <div className="bg-gradient-to-br from-background to-muted/50 rounded-2xl border border-border/50 p-6 sm:p-8 shadow-sm">
                <h4 className="font-semibold mb-6 text-center">Digital Menu vs Traditional</h4>
                <div className="space-y-4">
                  {[
                    { feature: "Menu updates", traditional: "Reprint (₹2000+)", digital: "Instant & free" },
                    { feature: "Order accuracy", traditional: "Human errors", digital: "100% accurate" },
                    { feature: "Billing", traditional: "Manual calculation", digital: "Auto-generated" },
                    { feature: "Analytics", traditional: "None", digital: "Real-time dashboard" },
                    { feature: "Staff coordination", traditional: "Paper/shouting", digital: "Live notifications" },
                    { feature: "Setup time", traditional: "Ongoing", digital: "30 minutes" },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 text-sm items-center">
                      <span className="font-medium text-xs sm:text-sm">{row.feature}</span>
                      <span className="text-center text-muted-foreground text-xs line-through decoration-red-400/60">{row.traditional}</span>
                      <span className="text-center text-green-600 dark:text-green-400 font-medium text-xs sm:text-sm">{row.digital}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section id="pricing" className="py-14 sm:py-28 px-4 bg-muted/30 relative overflow-hidden">
        <div className="hidden sm:block parallax-orb absolute top-10 right-10 w-64 h-64 bg-green-400/5 rounded-full blur-[80px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <FadeInSection>
              <Badge className="mb-4 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">Pricing</Badge>
            </FadeInSection>
            <TextReveal as="h2" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Start Free,{" "}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Scale as You Grow</span>
            </TextReveal>
            <FadeInSection delay={0.2}>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
                No credit card required. No contracts. Upgrade or cancel anytime.
              </p>
            </FadeInSection>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto" staggerDelay={0.1}>
            {pricing.map((plan, index) => (
              <StaggerItem key={index}>
                <AnimatedCard className="h-full" hoverLift={plan.popular ? 12 : 6} hoverScale={1.02}>
                  <Card className={`h-full relative overflow-hidden transition-all duration-300 ${
                    plan.popular
                      ? "ring-2 ring-blue-500 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
                      : "hover:shadow-md"
                  }`}>
                    <CardContent className="p-6 relative flex flex-col h-full">
                      {plan.popular && (
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px]">
                          Popular
                        </Badge>
                      )}
                      <div className="mb-5">
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                      </div>
                      <div className="mb-5">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      </div>
                      <ul className="space-y-2.5 mb-6 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <AnimatedButton>
                          <Button className={`w-full ${plan.popular ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : ""}`} variant={plan.popular ? "default" : "outline"} onClick={() => setFreeTrialPopupOpen(true)}>
                            Get Started
                          </Button>
                      </AnimatedButton>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-14 sm:py-28 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <FadeInSection>
              <Badge className="mb-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Testimonials</Badge>
            </FadeInSection>
            <TextReveal as="h2" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Loved by{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Restaurant Owners</span>
            </TextReveal>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.12}>
            {testimonials.map((t, index) => (
              <StaggerItem key={index}>
                <AnimatedCard className="h-full" hoverLift={6}>
                  <Card className="h-full border-0 bg-gradient-to-br from-background to-muted/30 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex gap-0.5 mb-4">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
                      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {t.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-14 sm:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <FadeInSection>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready to Go Digital?
            </h2>
            <p className="text-sm sm:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join 1000+ restaurants already using Digital Menu. Start free today — your customers can order within 30 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <AnimatedButton>
                  <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 bg-white text-blue-700 hover:bg-gray-100 shadow-xl" onClick={() => setFreeTrialPopupOpen(true)}>
                    Start Free Now <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
              </AnimatedButton>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 border-white/30 text-white hover:bg-white/10" onClick={() => setContactPopupOpen(true)}>
                <Phone className="mr-2 h-4 w-4" /> Talk to Us
              </Button>
            </div>
            <p className="text-white/60 text-sm mt-6">No credit card required • Free plan forever • Cancel anytime</p>
          </FadeInSection>
        </div>
      </section>

      {/* ─── Contact Section ─── */}
      <section id="contact" className="py-14 sm:py-28 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <FadeInSection>
              <Badge className="mb-4 bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20">Contact</Badge>
            </FadeInSection>
            <TextReveal as="h2" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Get in{" "}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Touch</span>
            </TextReveal>
            <FadeInSection delay={0.2}>
              <p className="text-sm sm:text-lg text-muted-foreground">
                Have questions? We'd love to help you get started.
              </p>
            </FadeInSection>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto" staggerDelay={0.1}>
            {[
              { icon: Mail, title: "Email", info: contactInfo.email, color: "from-blue-500 to-cyan-500" },
              { icon: Phone, title: "Phone", info: contactInfo.phone, color: "from-green-500 to-emerald-500" },
              { icon: MapPin, title: "Location", info: contactInfo.address, color: "from-purple-500 to-pink-500" },
            ].map((contact, index) => (
              <StaggerItem key={index}>
                <AnimatedCard hoverLift={6}>
                  <Card className="text-center border-0 bg-gradient-to-br from-background to-muted/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${contact.color} flex items-center justify-center text-white mx-auto mb-4`}>
                        <contact.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold mb-1">{contact.title}</h3>
                      <p className="text-sm text-muted-foreground">{contact.info}</p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeInSection delay={0.3}>
            <div className="text-center mt-8">
              <AnimatedButton>
                <Button size="lg" onClick={() => setContactPopupOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Send a Message <Mail className="ml-2 h-4 w-4" />
                </Button>
              </AnimatedButton>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-background border-t border-border/50 py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Digital Menu
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The complete restaurant management platform. From menu to billing, all in one place.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><button onClick={() => setFreeTrialPopupOpen(true)} className="hover:text-foreground transition-colors">Get Started</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Digital Menu. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>

      <ContactPopup isOpen={contactPopupOpen} onClose={() => setContactPopupOpen(false)} contactInfo={contactInfo} />
      <FreeTrialPopup isOpen={freeTrialPopupOpen} onClose={() => setFreeTrialPopupOpen(false)} />
    </div>
  );
}
