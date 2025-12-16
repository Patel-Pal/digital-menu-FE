import { motion } from "framer-motion";
import { Download, Share2, RefreshCcw, Eye, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";

export function QRCodePage() {
  return (
    <div className="space-y-6 p-4">
      {/* QR Code Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="elevated" className="overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center">
            {/* QR Code Placeholder */}
            <div className="relative">
              <div className="h-56 w-56 rounded-2xl bg-foreground p-4 flex items-center justify-center">
                <div className="h-full w-full bg-background rounded-xl grid grid-cols-5 gap-1 p-3">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        Math.random() > 0.3 ? "bg-foreground" : "bg-background"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-lg bg-card shadow-md flex items-center justify-center text-xl font-bold text-primary">
                  RK
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground text-center">
              Scan to view menu
            </p>
            <p className="text-xs text-muted-foreground">
              https://menu.digital/rustic-kitchen
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <Button variant="gradient" size="lg" className="h-14">
          <Download className="h-5 w-5 mr-2" />
          Download
        </Button>
        <Button variant="outline" size="lg" className="h-14">
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatCard
          title="Total Scans"
          value="1,234"
          change="+12% this week"
          changeType="positive"
          icon={<Smartphone className="h-5 w-5" />}
        />
        <StatCard
          title="Menu Views"
          value="3,456"
          change="+8% this week"
          changeType="positive"
          icon={<Eye className="h-5 w-5" />}
        />
      </motion.div>

      {/* Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">QR Code Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <RefreshCcw className="h-4 w-4 mr-3" />
              Regenerate QR Code
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-3" />
              Download for Print (High Res)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Share2 className="h-4 w-4 mr-3" />
              Get Embeddable Link
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="gradient">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-muted-foreground">
              Place your QR code at eye level on tables, menus, and entrance
              areas for maximum visibility and scans.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
