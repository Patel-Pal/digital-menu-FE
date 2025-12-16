import { motion } from "framer-motion";
import { Check, Crown, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    features: ["1 Menu", "Basic QR Code", "Limited Analytics", "Community Support"],
    current: false,
  },
  {
    name: "Basic",
    price: 9.99,
    period: "month",
    features: ["3 Menus", "Custom QR Codes", "Full Analytics", "Email Support", "Remove Branding"],
    current: false,
  },
  {
    name: "Premium",
    price: 24.99,
    period: "month",
    features: [
      "Unlimited Menus",
      "Advanced QR Codes",
      "Advanced Analytics",
      "Priority Support",
      "Custom Domain",
      "API Access",
    ],
    current: true,
    popular: true,
  },
];

export function ShopkeeperBillingPage() {
  return (
    <div className="space-y-6 p-4">
      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="elevated" className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 overflow-hidden">
          <CardContent className="p-5 relative">
            <Crown className="absolute -right-4 -top-4 h-24 w-24 opacity-10" />
            <div className="space-y-3">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">
                Current Plan
              </Badge>
              <div>
                <h2 className="text-2xl font-bold">Premium Plan</h2>
                <p className="text-sm opacity-90">$24.99/month</p>
              </div>
              <p className="text-sm opacity-90">
                Your plan renews on December 15, 2024
              </p>
              <Button variant="secondary" size="sm">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="font-semibold">Available Plans</h3>
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card
              variant={plan.current ? "elevated" : "default"}
              className={plan.current ? "ring-2 ring-primary" : ""}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.popular && (
                      <Badge variant="warning">
                        <Star className="h-3 w-3 mr-1" /> Popular
                      </Badge>
                    )}
                  </div>
                  {plan.current && (
                    <Badge variant="success">Current</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    ${plan.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.current ? "outline" : "default"}
                  className="w-full"
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Billing History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { date: "Nov 15, 2024", amount: 24.99, status: "Paid" },
              { date: "Oct 15, 2024", amount: 24.99, status: "Paid" },
              { date: "Sep 15, 2024", amount: 24.99, status: "Paid" },
            ].map((invoice) => (
              <div
                key={invoice.date}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
                <Badge variant="success">{invoice.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
