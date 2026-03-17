import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Star, Users } from "lucide-react";
import type { Shop } from "@/types";

interface AboutShopProps {
  shop: Pick<Shop, "name" | "description" | "address" | "phone" | "email" | "rating" | "reviewCount"> | null;
  themeColor: string;
  averageRating?: number;
  totalReviews?: number;
}

export function AboutShop({ shop, themeColor, averageRating, totalReviews }: AboutShopProps) {
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
      className="space-y-3"
    >
      {/* Shop Description */}
      <div className="space-y-1">
        <h2 className="text-base font-bold text-foreground">About {shop.name}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {shop.description ||
            "Welcome to our restaurant! We take pride in serving delicious food made with fresh, quality ingredients. Our passionate team is dedicated to providing you with an exceptional dining experience."}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Star
              className="h-6 w-6"
              style={{ color: `hsl(${themeColor})` }}
            />
          </div>
          <p className="text-sm font-bold text-foreground">
            {averageRating != null ? averageRating.toFixed(1) : (shop?.rating != null ? Number(shop.rating).toFixed(1) : "—")}
          </p>
          <p className="text-[10px] text-muted-foreground">Rating</p>
        </div>
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Users
              className="h-6 w-6"
              style={{ color: `hsl(${themeColor})` }}
            />
          </div>
          <p className="text-sm font-bold text-foreground">
            {(() => {
              const count = totalReviews ?? shop?.reviewCount;
              if (count == null) return "—";
              return count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}+`;
            })()}
          </p>
          <p className="text-[10px] text-muted-foreground">Happy Guests</p>
        </div>
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Clock
              className="h-6 w-6"
              style={{ color: `hsl(${themeColor})` }}
            />
          </div>
          <p className="text-sm font-bold text-foreground">5+</p>
          <p className="text-[10px] text-muted-foreground">Years</p>
        </div>
      </div>

      {/* Contact Info */}
      {contactInfo.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Contact Us</h3>
          <div className="space-y-2">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `hsl(${themeColor} / 0.1)` }}
                >
                  <item.icon
                    className="h-4 w-4"
                    style={{ color: `hsl(${themeColor})` }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  <p className="text-xs font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opening Hours */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Opening Hours</h3>
        <div className="space-y-1">
          {openingHours.map((schedule) => (
            <div
              key={schedule.day}
              className="flex items-center justify-between py-1 border-b border-border/30 last:border-b-0"
            >
              <span className="text-xs text-muted-foreground">{schedule.day}</span>
              <span className="text-xs font-medium text-foreground">{schedule.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
