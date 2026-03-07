import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  QrCode,
  Smartphone,
  BarChart3,
  Palette,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect, useRef } from "react";
import { adminService } from "@/services/adminService";
import { ContactPopup } from "@/components/ContactPopup";
import { Simple3DPhone } from "@/components/3d/Simple3D";
import { HeroMockup } from "@/components/HeroMockup";
import { AboutSection } from "@/components/AboutSection";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import {
  FadeInSection,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  ParallaxWrapper,
  AnimatedButton,
  TextReveal,
} from "@/components/animations";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactPopupOpen, setContactPopupOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: "[email]",
    phone: "[phone]",
    address: "[address]",
  });

  // Smooth scrolling
  useSmoothScroll();

  // Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  // GSAP pinned section for features
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax background orbs
      gsap.utils.toArray<HTMLElement>(".parallax-orb").forEach((orb) => {
        gsap.to(orb, {
          y: () => gsap.utils.random(-80, 80),
          scrollTrigger: {
            trigger: orb,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await adminService.getContactInfo();
      if (response.data) {
        setContactInfo({
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
        });
      }
    } catch (error) {
      console.error("Failed to fetch contact info:", error);
    }
  };

  const features = [
    {
      icon: <QrCode className="h-8 w-8" />,
      title: "QR Code Menus",
      description: "Generate instant QR codes for contactless menu viewing",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Optimized",
      description: "Perfect viewing experience on all mobile devices",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-time Analytics",
      description: "Track scans, views, and customer engagement",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Custom Themes",
      description: "6 beautiful themes to match your brand",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Instant loading and seamless performance",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and 99.9% uptime",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const pricing = [
    {
      name: "Free",
      price: "₹0",
      period: "/month",
      features: ["Up to 10 menu items", "Basic QR code", "1 theme", "Basic analytics"],
      popular: false,
    },
    {
      name: "Basic",
      price: "₹599",
      period: "/month",
      features: [
        "Up to 50 menu items",
        "Custom QR codes",
        "All themes",
        "Advanced analytics",
        "Image uploads",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "₹1199",
      period: "/month",
      features: [
        "Unlimited menu items",
        "Priority support",
        "Custom branding",
        "Advanced features",
        "API access",
      ],
      popular: false,
    },
  ];

  // Hero stagger variants
  const heroContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const heroItem = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ─── Navigation ─── */}
      <motion.nav
        className="fixed top-0 w-full bg-background/70 backdrop-blur-xl border-b border-white/10 z-50"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Digital Menu
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {["features", "pricing", "about", "contact"].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item}`}
                  className="text-muted-foreground hover:text-foreground transition-colors capitalize"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                >
                  {item}
                </motion.a>
              ))}
              <ThemeToggle />
              <Link to="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <AnimatedButton>
                <Button
                  onClick={() => setContactPopupOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                </Button>
              </AnimatedButton>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden py-4 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {["features", "pricing", "about", "contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="block text-muted-foreground hover:text-foreground capitalize"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <div className="flex gap-2 pt-4">
                <Link to="/auth/login" className="flex-1">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Button
                  onClick={() => setContactPopupOpen(true)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative pt-24 sm:pt-20 pb-8 sm:pb-12 px-4 overflow-hidden min-h-[auto] sm:min-h-[85vh] flex items-center">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-cyan-950/20" />

        {/* Parallax background orbs */}
        <div className="parallax-orb absolute top-20 left-[10%] w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="parallax-orb absolute bottom-20 right-[15%] w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="parallax-orb absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/8 rounded-full blur-3xl" />

        <motion.div
          className="relative z-20 max-w-7xl mx-auto w-full"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content — staggered entrance */}
            <motion.div
              className="space-y-8"
              variants={heroContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                variants={heroItem}
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                Create Beautiful{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Digital Menus
                  </span>
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-lg -z-10"
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </span>{" "}
                in Minutes
              </motion.h1>

              <motion.p
                variants={heroItem}
                className="text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
              >
                Generate QR code menus, track analytics, and provide contactless dining
                experiences that your customers will love. Join 1000+ restaurants already
                transforming their business.
              </motion.p>

              {/* CTA Buttons — stagger */}
              <motion.div variants={heroItem} className="flex flex-col sm:flex-row gap-4">
                <AnimatedButton>
                  <Button
                    size="lg"
                    onClick={() => setContactPopupOpen(true)}
                    className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 transition-shadow"
                  >
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </AnimatedButton>
              </motion.div>

              {/* Stats counter */}
              <motion.div variants={heroItem} className="flex items-center gap-4 sm:gap-8 pt-4">
                {[
                  { value: "1000+", label: "Restaurants", color: "text-blue-600" },
                  { value: "50K+", label: "QR Scans", color: "text-purple-600" },
                  { value: "99.9%", label: "Uptime", color: "text-cyan-600" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                  >
                    <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Phone mockup with floating cards */}
            <motion.div
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="relative hidden sm:block h-[400px] sm:h-[500px] lg:h-[680px]"
            >
              <HeroMockup />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="pt-32 pb-14 px-4 bg-muted/30 relative overflow-hidden">
        {/* Parallax background element */}
        <ParallaxWrapper speed={-40} className="absolute top-20 right-20 w-32 h-32 opacity-10 pointer-events-none">
          <Simple3DPhone />
        </ParallaxWrapper>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <TextReveal as="h2" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" delay={0.1}>
              Everything You Need for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Digital Menus
              </span>
            </TextReveal>
            <FadeInSection delay={0.2}>
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to enhance your restaurant's digital presence
                and customer experience
              </p>
            </FadeInSection>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" staggerDelay={0.1}>
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <AnimatedCard
                  className="h-full"
                  delay={0}
                  hoverLift={10}
                  hoverScale={1.03}
                >
                  <Card className="h-full border-0 bg-gradient-to-br from-background to-muted/50 overflow-hidden group">
                    <CardContent className="p-6 text-center relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                      <motion.div
                        className={`text-white mb-4 flex justify-center p-3 rounded-2xl bg-gradient-to-r ${feature.color} mx-auto w-fit`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {feature.icon}
                      </motion.div>

                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>

                      <motion.div
                        className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-20`}
                        transition={{ duration: 0.4 }}
                      />
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section id="pricing" className="py-16 sm:py-24 px-4 relative">
        {/* Parallax orbs */}
        <ParallaxWrapper speed={30} className="absolute top-10 left-10 w-48 h-48 bg-green-400/5 rounded-full blur-3xl pointer-events-none" />
        <ParallaxWrapper speed={-20} className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <TextReveal as="h2" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" delay={0.1}>
              Simple, Transparent{" "}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </TextReveal>
            <FadeInSection delay={0.2}>
              <p className="text-base sm:text-xl text-muted-foreground">
                Choose the perfect plan for your restaurant's needs
              </p>
            </FadeInSection>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto" staggerDelay={0.15}>
            {pricing.map((plan, index) => (
              <StaggerItem key={index}>
                <AnimatedCard
                  className="h-full"
                  hoverLift={plan.popular ? 14 : 8}
                  hoverScale={1.03}
                >
                  <Card
                    className={`h-full relative overflow-hidden transition-all duration-300 ${
                      plan.popular
                        ? "ring-2 ring-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6 sm:p-8 relative">
                      {plan.popular && (
                        <>
                          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600">
                            ⭐ Most Popular
                          </Badge>
                          <motion.div
                            className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </>
                      )}

                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>

                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, i) => (
                          <motion.li
                            key={i}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + i * 0.05 }}
                          >
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>

                      <Link to="/auth/register" className="w-full">
                        <AnimatedButton>
                          <Button
                            className={`w-full ${
                              plan.popular
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 transition-shadow"
                                : ""
                            }`}
                            variant={plan.popular ? "default" : "outline"}
                          >
                            Get Started
                          </Button>
                        </AnimatedButton>
                      </Link>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── About Section ─── */}
      <AboutSection onGetStarted={() => setContactPopupOpen(true)} />

      {/* ─── Contact Section ─── */}
      <section id="contact" className="py-16 sm:py-24 px-4 min-h-[80vh] sm:min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <FadeInSection>
              <Badge className="mb-4">📞 Contact Us</Badge>
            </FadeInSection>
            <TextReveal as="h2" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" delay={0.1}>
              Get in{" "}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Touch
              </span>
            </TextReveal>
            <FadeInSection delay={0.2}>
              <p className="text-base sm:text-xl text-muted-foreground">
                Have questions? We'd love to hear from you and help you get started.
              </p>
            </FadeInSection>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto" staggerDelay={0.12}>
            {[
              { icon: Mail, title: "Email Us", info: contactInfo.email, color: "from-blue-500 to-cyan-500" },
              { icon: Phone, title: "Call Us", info: contactInfo.phone, color: "from-green-500 to-emerald-500" },
              { icon: MapPin, title: "Visit Us", info: contactInfo.address, color: "from-purple-500 to-pink-500" },
            ].map((contact, index) => (
              <StaggerItem key={index}>
                <AnimatedCard hoverLift={8} hoverScale={1.03}>
                  <Card className="hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 sm:p-8 text-center relative overflow-hidden">
                      <motion.div
                        className={`p-4 bg-gradient-to-r ${contact.color} rounded-full w-fit mx-auto mb-6`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <contact.icon className="h-8 w-8 text-white" />
                      </motion.div>

                      <h3 className="font-semibold text-lg mb-3">{contact.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{contact.info}</p>

                      <div className={`absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r ${contact.color} rounded-full opacity-10`} />
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-muted/50 py-8 sm:py-12 px-4 relative overflow-hidden">
        <ParallaxWrapper speed={20} className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
          <Simple3DPhone />
        </ParallaxWrapper>

        <div className="max-w-7xl mx-auto relative z-10">
          <FadeInSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <motion.div
                  className="flex items-center gap-2 mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Digital Menu
                  </span>
                </motion.div>
                <p className="text-muted-foreground leading-relaxed">
                  The easiest way to create beautiful digital menus for your restaurant.
                  Transform your dining experience today.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Demo</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Templates</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
                  <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground">
                &copy; 2026 Digital Menu. All rights reserved.
              </p>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                {[Star, Users, Mail].map((Icon, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.2, y: -2 }}
                    className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
      </footer>

      <ContactPopup
        isOpen={contactPopupOpen}
        onClose={() => setContactPopupOpen(false)}
        contactInfo={contactInfo}
      />
    </div>
  );
}
