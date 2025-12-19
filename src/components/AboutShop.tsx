import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Star, Users } from "lucide-react";
import type { Shop } from "@/types";

interface AboutShopProps {
  shop: Pick<Shop, "name" | "description" | "address" | "phone" | "email">;
  themeColor: string;
}

export function AboutShop({ shop, themeColor }: AboutShopProps) {
  const contactInfo = [
    { icon: MapPin, label: "Address", value: shop.address },
    { icon: Phone, label: "Phone", value: shop.phone },
    { icon: Mail, label: "Email", value: shop.email },
  ].filter((item) => item.value);

  const openingHours = [
    { day: "Mon - Fri", hours: "10:00 AM - 10:00 PM" },
    { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
    { day: "Sunday", hours: "11:00 AM - 9:00 PM" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6 space-y-5"
    >
      {/* Shop Description */}
      <div>
        <h2 className="text-lg font-bold mb-2">About {shop.name}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {shop.description ||
            "Welcome to our restaurant! We take pride in serving delicious food made with fresh, quality ingredients. Our passionate team is dedicated to providing you with an exceptional dining experience."}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-4">
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ backgroundColor: `hsl(${themeColor} / 0.08)` }}
        >
          <div className="flex justify-center mb-1">
            <Star
              className="h-4 w-4"
              style={{ color: `hsl(${themeColor})` }}
            />
          </div>
          <p className="text-lg font-bold">4.8</p>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ backgroundColor: `hsl(${themeColor} / 0.08)` }}
        >
          <div className="flex justify-center mb-1">
            <Users
              className="h-4 w-4"
              style={{ color: `hsl(${themeColor})` }}
            />
          </div>
          <p className="text-lg font-bold">2.5k+</p>
          <p className="text-xs text-muted-foreground">Happy Guests</p>
        </div>
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ backgroundColor: `hsl(${themeColor} / 0.08)` }}
        >
          <div className="flex justify-center mb-1">
            <Clock
              className="h-4 w-4"
              style={{ color: `hsl(${themeColor})` }}
            />
          </div>
          <p className="text-lg font-bold">5+</p>
          <p className="text-xs text-muted-foreground">Years</p>
        </div>
      </div>

      {/* Contact Info */}
      {contactInfo.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Contact Us</h3>
          <div className="space-y-2">
            {contactInfo.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-3"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `hsl(${themeColor} / 0.1)` }}
                >
                  <item.icon
                    className="h-4 w-4"
                    style={{ color: `hsl(${themeColor})` }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opening Hours */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Opening Hours</h3>
        <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2">
          {openingHours.map((schedule) => (
            <div
              key={schedule.day}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{schedule.day}</span>
              <span className="font-medium">{schedule.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
