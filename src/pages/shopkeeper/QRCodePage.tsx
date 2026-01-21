import { motion } from "framer-motion";
import { Download, Share2, RefreshCcw, Eye, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { shopService } from "@/services/shopService";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import QRCode from "qrcode";

export function QRCodePage() {
  const { user } = useAuth();
  const { analytics } = useAnalytics();
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [ownerId, setOwnerId] = useState<string>("");
  
  // Generate menu URL using ownerId from shops table
  const menuUrl = ownerId ? `${window.location.origin}/menu/${ownerId}` : "";
  
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await shopService.getShopProfile();
        setOwnerId(response.data?.ownerId || "");
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
      }
    };
    
    if (user) {
      fetchShopData();
    }
  }, [user]);

  const handleShare = async () => {
    if (navigator.share && menuUrl) {
      try {
        await navigator.share({
          title: 'Digital Menu',
          text: 'Check out our digital menu!',
          url: menuUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (menuUrl) {
      navigator.clipboard.writeText(menuUrl).then(() => {
        alert('Menu link copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = menuUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Menu link copied to clipboard!');
      });
    }
  };

  const handleDownload = () => {
    if (qrRef.current) {
      const canvas = qrRef.current;
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };
  
  useEffect(() => {
    if (qrRef.current && ownerId) {
      // Generate QR code
      QRCode.toCanvas(qrRef.current, menuUrl, {
        width: 224,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).catch(err => console.error('QR Code generation failed:', err));
    }
  }, [menuUrl, ownerId]);

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
            {/* QR Code */}
            <div className="relative">
              <canvas ref={qrRef} className="h-56 w-56 rounded-2xl bg-white"></canvas>
            </div>

            <p className="mt-4 text-sm text-muted-foreground text-center">
              Scan to view menu
            </p>
            <p className="text-xs text-muted-foreground break-all text-center max-w-xs">
              {menuUrl}
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
        <Button variant="gradient" size="lg" className="h-14" onClick={handleDownload}>
          <Download className="h-5 w-5 mr-2" />
          Download
        </Button>
        <Button variant="outline" size="lg" className="h-14" onClick={handleShare}>
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
          value={analytics.totalScans.toLocaleString()}
          change={analytics.scansChange}
          changeType="positive"
          icon={<Smartphone className="h-5 w-5" />}
        />
        <StatCard
          title="Menu Views"
          value={analytics.menuViews.toLocaleString()}
          change={analytics.viewsChange}
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
        {/* <Card variant="elevated">
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
        </Card> */}
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
