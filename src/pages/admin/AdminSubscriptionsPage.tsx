import { motion } from "framer-motion";
import { CreditCard, TrendingUp, Users, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const subscriptions = [
  { id: 1, shop: "The Rustic Kitchen", plan: "premium", amount: 24.99, status: "active", nextBilling: "Dec 15, 2024" },
  { id: 2, shop: "Spice Garden", plan: "basic", amount: 9.99, status: "active", nextBilling: "Dec 20, 2024" },
  { id: 3, shop: "Pizza Paradise", plan: "premium", amount: 24.99, status: "active", nextBilling: "Dec 10, 2024" },
  { id: 4, shop: "Café Luna", plan: "free", amount: 0, status: "expired", nextBilling: "-" },
];

export function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage plans and billing</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Revenue" value="$3,456" change="+12%" changeType="positive" icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Active Subs" value="134" change="+8" changeType="positive" icon={<Users className="h-5 w-5" />} />
        <StatCard title="Premium Plans" value="67" change="+5" changeType="positive" icon={<CreditCard className="h-5 w-5" />} />
        <StatCard title="Churn Rate" value="2.3%" change="-0.5%" changeType="positive" icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      {/* Plan Distribution */}
      <Card variant="elevated">
        <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Premium</span>
                <span className="font-medium">67 shops (43%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[43%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Basic</span>
                <span className="font-medium">54 shops (35%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[35%] rounded-full bg-accent" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Free</span>
                <span className="font-medium">35 shops (22%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[22%] rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Subscriptions */}
      <Card variant="elevated">
        <CardHeader><CardTitle>Recent Subscriptions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {subscriptions.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {sub.shop.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{sub.shop}</p>
                  <p className="text-sm text-muted-foreground">Next billing: {sub.nextBilling}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={sub.plan === "premium" ? "default" : sub.plan === "basic" ? "secondary" : "outline"}>
                  {sub.plan}
                </Badge>
                <span className="font-bold">${sub.amount.toFixed(2)}</span>
                <Badge variant={sub.status === "active" ? "success" : "destructive"}>
                  {sub.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
