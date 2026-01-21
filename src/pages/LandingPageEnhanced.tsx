import { motion } from "framer-motion";
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
  Sparkles,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { ContactPopup } from "@/components/ContactPopup";
import { Simple3DQR, Simple3DPhone } from "@/components/3d/Simple3D";

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactPopupOpen, setContactPopupOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: "patelpal.93130@gmail.com",
    phone: "+91 9313080291",
    address: "Segvi Peshvai Rood , Valsad"
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await adminService.getContactInfo();
      if (response.data) {
        setContactInfo({
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address
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
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Optimized",
      description: "Perfect viewing experience on all mobile devices",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-time Analytics",
      description: "Track scans, views, and customer engagement",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Custom Themes",
      description: "6 beautiful themes to match your brand",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Instant loading and seamless performance",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and 99.9% uptime",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const pricing = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: ["Up to 10 menu items", "Basic QR code", "1 theme", "Basic analytics"],
      popular: false
    },
    {
      name: "Basic",
      price: "$9",
      period: "/month",
      features: ["Up to 50 menu items", "Custom QR codes", "All themes", "Advanced analytics", "Image uploads"],
      popular: true
    },
    {
      name: "Premium",
      price: "$19",
      period: "/month",
      features: ["Unlimited menu items", "Priority support", "Custom branding", "Advanced features", "API access"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-white/10 z-50">
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
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              <ThemeToggle />
              <Link to="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Button 
                onClick={() => setContactPopupOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden py-4 space-y-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <a href="#features" className="block text-muted-foreground hover:text-foreground">Features</a>
              <a href="#pricing" className="block text-muted-foreground hover:text-foreground">Pricing</a>
              <a href="#about" className="block text-muted-foreground hover:text-foreground">About</a>
              <a href="#contact" className="block text-muted-foreground hover:text-foreground">Contact</a>
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
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-cyan-950/20" />
        
        <div className="relative z-20 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <Badge className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Transform Your Restaurant Experience
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Create Beautiful{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Digital Menus
                  </span>
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-lg"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </span>{" "}
                in Minutes
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Generate QR code menus, track analytics, and provide contactless dining experiences 
                that your customers will love. Join 1000+ restaurants already transforming their business.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => setContactPopupOpen(true)}
                    className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2">
                    View Demo
                  </Button>
                </motion.div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-8 pt-4">
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-2xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-muted-foreground">Restaurants</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-2xl font-bold text-purple-600">50K+</div>
                  <div className="text-sm text-muted-foreground">QR Scans</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-2xl font-bold text-cyan-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Right 3D Scene */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[600px] lg:h-[700px] perspective-1000"
            >
              <Simple3DQR />
              
              {/* Floating elements */}
              <motion.div
                className="absolute top-20 right-10 w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-20 blur-xl"
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <motion.div
                className="absolute bottom-32 left-8 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl"
                animate={{
                  y: [0, 15, 0],
                  scale: [1, 0.8, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-muted/30 relative overflow-hidden">
        {/* Background 3D Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 opacity-10">
          <Simple3DPhone />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4">✨ Powerful Features</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need for{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Digital Menus
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to enhance your restaurant's digital presence and customer experience
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/50">
                  <CardContent className="p-8 text-center relative overflow-hidden">
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`} />
                    
                    <motion.div 
                      className={`text-white mb-6 flex justify-center p-4 rounded-2xl bg-gradient-to-r ${feature.color}`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    
                    {/* Decorative elements */}
                    <motion.div
                      className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r ${feature.color} rounded-full opacity-20`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4">💰 Pricing Plans</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, Transparent{" "}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Choose the perfect plan for your restaurant's needs
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className={`h-full relative overflow-hidden ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20' 
                    : 'hover:shadow-xl'
                } transition-all duration-300`}>
                  <CardContent className="p-8 relative">
                    {plan.popular && (
                      <>
                        <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600">
                          ⭐ Most Popular
                        </Badge>
                        <motion.div
                          className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
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
                          transition={{ delay: (index * 0.1) + (i * 0.05) }}
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    <Link to="/auth/register" className="w-full">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          className={`w-full ${
                            plan.popular 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                              : ""
                          }`}
                          variant={plan.popular ? "default" : "outline"}
                        >
                          Get Started
                        </Button>
                      </motion.div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-muted/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4">🚀 About Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transforming Restaurant{" "}
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Experiences
                </span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We're passionate about helping restaurants modernize their dining experience. 
                Our platform makes it easy to create beautiful, contactless digital menus that 
                customers can access instantly with a simple QR code scan.
              </p>
              
              <div className="space-y-6">
                <motion.div 
                  className="flex items-center gap-4"
                  whileHover={{ x: 10 }}
                >
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Trusted by 1000+ restaurants worldwide</h4>
                    <p className="text-sm text-muted-foreground">Growing community of satisfied customers</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-4"
                  whileHover={{ x: 10 }}
                >
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">4.9/5 average customer rating</h4>
                    <p className="text-sm text-muted-foreground">Exceptional service and support</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-4"
                  whileHover={{ x: 10 }}
                >
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">99.9% uptime guarantee</h4>
                    <p className="text-sm text-muted-foreground">Reliable service you can count on</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl p-12 text-center relative overflow-hidden">
                {/* 3D QR Code */}
                <div className="h-48 mb-8">
                  <Simple3DQR />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Join thousands of restaurants already using Digital Menu to enhance their customer experience
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => setContactPopupOpen(true)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Create Your Menu Now
                  </Button>
                </motion.div>
                
                {/* Floating particles */}
                <motion.div
                  className="absolute top-8 right-8 w-4 h-4 bg-blue-500 rounded-full opacity-60"
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                <motion.div
                  className="absolute bottom-12 left-8 w-3 h-3 bg-purple-500 rounded-full opacity-60"
                  animate={{
                    y: [0, 8, 0],
                    scale: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4">📞 Contact Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get in{" "}
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Touch
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Have questions? We'd love to hear from you and help you get started.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Mail, title: "Email Us", info: contactInfo.email, color: "from-blue-500 to-cyan-500" },
              { icon: Phone, title: "Call Us", info: contactInfo.phone, color: "from-green-500 to-emerald-500" },
              { icon: MapPin, title: "Visit Us", info: contactInfo.address, color: "from-purple-500 to-pink-500" }
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center relative overflow-hidden">
                    <motion.div 
                      className={`p-4 bg-gradient-to-r ${contact.color} rounded-full w-fit mx-auto mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <contact.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    <h3 className="font-semibold text-lg mb-3">{contact.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{contact.info}</p>
                    
                    {/* Background decoration */}
                    <div className={`absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r ${contact.color} rounded-full opacity-10`} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-4 relative overflow-hidden">
        {/* 3D Background */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <Simple3DPhone />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
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
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Star className="h-5 w-5" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Users className="h-5 w-5" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Mail className="h-5 w-5" />
              </motion.div>
            </div>
          </div>
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
