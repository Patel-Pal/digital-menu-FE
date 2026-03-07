import { motion } from "framer-motion";
import { Download, Share2, RefreshCcw, Eye, Smartphone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { shopService } from "@/services/shopService";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { toast } from "sonner";
import QRCode from "qrcode";

export function QRCodePage() {
  const { user } = useAuth();
  const { analytics, refreshAnalytics } = useAnalytics();
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [ownerId, setOwnerId] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrColor, setQrColor] = useState<string>("#000000");
  
  // Generate menu URL using ownerId from shops table with QR tracking parameter
  const menuUrl = ownerId ? `${window.location.origin}/menu/${ownerId}?source=qr` : "";
  
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await shopService.getShopProfile();
        setOwnerId(response.data?.ownerId || "");
        if (response.data?.qrColor) {
          setQrColor(response.data.qrColor);
        }
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
      }
    };
    
    if (user) {
      fetchShopData();
    }
  }, [user]);

  const saveQrColor = useCallback(async (color: string) => {
    try {
      await shopService.createOrUpdateShopProfile({ qrColor: color });
    } catch (error) {
      console.error("Failed to save QR color:", error);
    }
  }, []);

  const handleColorChange = (color: string) => {
    setQrColor(color);
    saveQrColor(color);
  };

  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    await refreshAnalytics();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
          dark: qrColor,
          light: '#ffffff'
        }
      }).catch(err => console.error('QR Code generation failed:', err));
    }
  }, [menuUrl, ownerId, qrColor]);

  return (
    <div className="space-y-6 p-4">
      {/* QR Code Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="elevated" className="overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center relative">
            {/* View Customer Menu Icon - Top Right */}
            {ownerId && (
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute top-4 right-4 h-10 w-10 rounded-lg hover:bg-primary/10 group"
                onClick={() => window.open(`/menu/${ownerId}`, '_blank')}
                title="Open customer menu in new tab"
              >
                <ExternalLink className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Button>
            )}

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

            {/* QR Color Picker */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs text-muted-foreground">QR Color:</span>
              <div className="flex gap-2">
                {['#000000', '#1e40af', '#dc2626', '#059669', '#7c3aed', '#d97706'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${qrColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <label className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center cursor-pointer text-xs text-muted-foreground hover:border-primary transition-colors" title="Custom color">
                  <span>+</span>
                  <input type="color" value={qrColor} onChange={e => handleColorChange(e.target.value)} className="sr-only" />
                </label>
              </div>
            </div>
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
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Statistics</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshStats}
            disabled={isRefreshing}
            className="h-8 gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
        </div>
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
