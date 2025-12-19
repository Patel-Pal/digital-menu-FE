import { motion } from "framer-motion";
import { QrCode, Smartphone, Zap, Clock, Leaf, Globe } from "lucide-react";

interface AboutDigitalMenuProps {
  themeColor: string;
}

export function AboutDigitalMenu({ themeColor }: AboutDigitalMenuProps) {
  const features = [
    {
      icon: QrCode,
      title: "Scan & Browse",
      description: "Simply scan the QR code to access the full menu instantly",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Optimized for all devices with a seamless experience",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Menu items and prices are always up to date",
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description: "Access the menu anytime, anywhere you want",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "No paper menus, reducing environmental impact",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Available in multiple languages for all guests",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold">About Digital Menu</h2>
        <p className="text-sm text-muted-foreground">
          Experience the future of dining
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-border/50 bg-card/50 p-3"
          >
            <div
              className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `hsl(${themeColor} / 0.1)` }}
            >
              <feature.icon
                className="h-4 w-4"
                style={{ color: `hsl(${themeColor})` }}
              />
            </div>
            <h3 className="text-sm font-semibold">{feature.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
