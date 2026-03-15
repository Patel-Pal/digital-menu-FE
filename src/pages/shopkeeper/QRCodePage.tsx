import { motion } from "framer-motion";
import { Download, Share2, RefreshCcw, Eye, Smartphone, ExternalLink, Image, Palette, Type, Square, Circle, RectangleHorizontal, Save, RotateCcw, Bold, Italic, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { shopService } from "@/services/shopService";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { toast } from "sonner";
import QRCode from "qrcode";

interface QrSettings {
  bgColor: string;
  logoInQr: boolean;
  style: 'squares' | 'dots' | 'rounded';
  frameText: string;
  frameColor: string;
  fontSize: number;
  fontStyle: 'normal' | 'bold' | 'italic' | 'bold italic';
  fontFamily: string;
}

const DEFAULT_SETTINGS: QrSettings = {
  bgColor: '#ffffff',
  logoInQr: false,
  style: 'squares',
  frameText: '',
  frameColor: '#000000',
  fontSize: 14,
  fontStyle: 'bold',
  fontFamily: 'Inter',
};

const FONT_FAMILIES = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Verdana', 'Times New Roman'];

const QR_COLORS = ['#000000', '#1e40af', '#dc2626', '#059669', '#7c3aed', '#d97706'];
const BG_COLORS = ['#ffffff', '#fde68a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fecdd3'];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStyledQR(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  offsetX: number,
  offsetY: number,
  size: number,
  style: 'dots' | 'rounded' | 'squares',
  fgColor: string
) {
  const moduleCount = modules.length;
  const moduleSize = size / moduleCount;

  ctx.fillStyle = fgColor;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!modules[row][col]) continue;

      const x = offsetX + col * moduleSize;
      const y = offsetY + row * moduleSize;

      if (style === 'dots') {
        ctx.beginPath();
        ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize * 0.42, 0, Math.PI * 2);
        ctx.fill();
      } else if (style === 'rounded') {
        const r = moduleSize * 0.35;
        roundRect(ctx, x + 0.5, y + 0.5, moduleSize - 1, moduleSize - 1, r);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, moduleSize, moduleSize);
      }
    }
  }
}

/** Extract the boolean module matrix from the qrcode library */
function getQRModules(data: string, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'): boolean[][] {
  const qr = QRCode.create(data, { errorCorrectionLevel });
  const size = qr.modules.size;
  const qrData = qr.modules.data;
  const modules: boolean[][] = [];
  for (let row = 0; row < size; row++) {
    const rowArr: boolean[] = [];
    for (let col = 0; col < size; col++) {
      rowArr.push(qrData[row * size + col] === 1);
    }
    modules.push(rowArr);
  }
  return modules;
}

export function QRCodePage() {
  const { user } = useAuth();
  const { analytics, refreshAnalytics } = useAnalytics();
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [ownerId, setOwnerId] = useState("");
  const [shopLogo, setShopLogo] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrColor, setQrColor] = useState("#000000");
  const [settings, setSettings] = useState<QrSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  const menuUrl = ownerId ? `${window.location.origin}/menu/${ownerId}?source=qr` : "";

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await shopService.getShopProfile();
        const shop = response.data;
        setOwnerId(shop?.ownerId || "");
        setShopLogo(shop?.logo || "");
        if (shop?.qrColor) setQrColor(shop.qrColor);
        if (shop?.qrSettings) {
          setSettings(prev => ({ ...prev, ...shop.qrSettings }));
        }
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
      }
    };
    if (user) fetchShopData();
  }, [user]);

  const updateSetting = <K extends keyof QrSettings>(key: K, value: QrSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleColorChange = (color: string) => {
    setQrColor(color);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await shopService.createOrUpdateShopProfile({ qrColor, qrSettings: settings });
      toast.success("QR code settings saved!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setQrColor('#000000');
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    await refreshAnalytics();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleShare = async () => {
    if (navigator.share && menuUrl) {
      try {
        await navigator.share({ title: 'Digital Menu', text: 'Check out our digital menu!', url: menuUrl });
      } catch { copyToClipboard(); }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (menuUrl) {
      navigator.clipboard.writeText(menuUrl).then(() => toast.success('Menu link copied!')).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = menuUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast.success('Menu link copied!');
      });
    }
  };

  const handleDownload = () => {
    if (displayCanvasRef.current) {
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = displayCanvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  // Render the full QR with background, logo overlay, frame text
  const renderQR = useCallback(() => {
    if (!displayCanvasRef.current || !ownerId) return;

    const size = 280;
    const padding = 24;
    const frameHeight = settings.frameText ? Math.max(40, settings.fontSize * 2.5) : 0;
    const brandingHeight = 20;
    const totalHeight = size + padding * 2 + frameHeight + brandingHeight;
    const totalWidth = size + padding * 2;

    const errorLevel = settings.logoInQr ? 'H' : 'M';
    const modules = getQRModules(menuUrl, errorLevel);

    const display = displayCanvasRef.current;
    display.width = totalWidth;
    display.height = totalHeight;
    const ctx = display.getContext('2d')!;

    // Background
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw QR using the styled renderer for all styles
    drawStyledQR(ctx, modules, padding, padding, size, settings.style, qrColor);

    // Logo overlay
    if (settings.logoInQr && shopLogo) {
      const logoSize = size * 0.22;
      const logoX = padding + (size - logoSize) / 2;
      const logoY = padding + (size - logoSize) / 2;

      // White background circle for logo
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 4, 0, Math.PI * 2);
      ctx.fill();

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      };
      img.src = shopLogo;
    }

    // Frame text
    if (settings.frameText) {
      ctx.fillStyle = settings.frameColor;
      const fontStyle = settings.fontStyle === 'bold italic' ? 'bold italic' : settings.fontStyle === 'bold' ? 'bold' : settings.fontStyle === 'italic' ? 'italic' : '';
      ctx.font = `${fontStyle} ${settings.fontSize}px ${settings.fontFamily}, system-ui, sans-serif`.trim();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(settings.frameText, totalWidth / 2, size + padding * 2 + frameHeight / 2);
    }

    // Branding
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('digitalmenu.devinpro.co.in', totalWidth / 2, totalHeight - 4);

  }, [menuUrl, ownerId, qrColor, settings, shopLogo]);

  useEffect(() => {
    renderQR();
  }, [renderQR]);

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: QR Preview */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <CardContent className="p-6 flex flex-col items-center relative">
              {ownerId && (
                <Button
                  variant="ghost" size="icon"
                  className="absolute top-4 right-4 h-10 w-10 rounded-lg hover:bg-primary/10 group"
                  onClick={() => window.open(`/menu/${ownerId}`, '_blank')}
                  title="Open customer menu"
                >
                  <ExternalLink className="h-5 w-5 transition-transform group-hover:scale-110" />
                </Button>
              )}

              {/* Display canvas with all customizations */}
              <div className="rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-white">
                <canvas ref={displayCanvasRef} className="max-w-[328px] w-full h-auto" />
              </div>

              <p className="mt-4 text-sm text-muted-foreground text-center">Scan to view menu</p>
              <p className="text-xs text-muted-foreground break-all text-center max-w-xs">{menuUrl}</p>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 w-full">
                <Button variant="gradient" className="flex-1 h-11" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button variant="outline" className="flex-1 h-11" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Customization Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5" /> Customize QR Code
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges} className="h-8 text-xs">
                  <Save className="h-3.5 w-3.5 mr-1" /> {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* QR Foreground Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-3.5 w-3.5" /> QR Color
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {QR_COLORS.map(color => (
                    <button key={color} onClick={() => handleColorChange(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${qrColor === color ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color }} />
                  ))}
                  <label className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:border-primary transition-colors" title="Custom">
                    <span className="text-xs text-muted-foreground">+</span>
                    <input type="color" value={qrColor} onChange={e => handleColorChange(e.target.value)} className="sr-only" />
                  </label>
                </div>
              </div>

              <Separator />

              {/* Background Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <RectangleHorizontal className="h-3.5 w-3.5" /> Background Color
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {BG_COLORS.map(color => (
                    <button key={color} onClick={() => updateSetting('bgColor', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${settings.bgColor === color ? 'border-primary scale-110 shadow-md' : 'border-muted-foreground/20 hover:scale-105'}`}
                      style={{ backgroundColor: color }} />
                  ))}
                  <label className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:border-primary transition-colors" title="Custom">
                    <span className="text-xs text-muted-foreground">+</span>
                    <input type="color" value={settings.bgColor} onChange={e => updateSetting('bgColor', e.target.value)} className="sr-only" />
                  </label>
                </div>
              </div>

              <Separator />

              {/* QR Style */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">QR Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'squares', label: 'Squares', icon: Square },
                    { value: 'dots', label: 'Dots', icon: Circle },
                    { value: 'rounded', label: 'Rounded', icon: RectangleHorizontal },
                  ] as const).map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => updateSetting('style', value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-xs font-medium ${
                        settings.style === value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50'
                      }`}>
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Logo in QR */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Image className="h-3.5 w-3.5" /> Shop Logo in QR
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {shopLogo ? 'Overlay your shop logo in the center' : 'Upload a logo in Settings first'}
                  </p>
                </div>
                <Switch checked={settings.logoInQr} onCheckedChange={v => updateSetting('logoInQr', v)} disabled={!shopLogo} />
              </div>

              <Separator />

              {/* Frame Text */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-3.5 w-3.5" /> Frame Text
                </Label>
                <Input
                  placeholder="e.g. Scan Me, View Menu"
                  value={settings.frameText}
                  onChange={e => updateSetting('frameText', e.target.value)}
                  maxLength={30}
                />
                {settings.frameText && (
                  <div className="space-y-3">
                    {/* Font Family */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Font:</span>
                      <select
                        value={settings.fontFamily}
                        onChange={e => updateSetting('fontFamily', e.target.value)}
                        className="flex-1 h-8 text-xs rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {FONT_FAMILIES.map(f => (
                          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Font Size & Style */}
                    <div className="flex items-center gap-3">
                      {/* Font Size */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Size:</span>
                        <button onClick={() => updateSetting('fontSize', Math.max(10, settings.fontSize - 1))}
                          className="h-7 w-7 rounded border border-input flex items-center justify-center hover:bg-accent transition-colors">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-medium w-6 text-center">{settings.fontSize}</span>
                        <button onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 1))}
                          className="h-7 w-7 rounded border border-input flex items-center justify-center hover:bg-accent transition-colors">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Bold / Italic toggles */}
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => {
                            const isBold = settings.fontStyle.includes('bold');
                            const isItalic = settings.fontStyle.includes('italic');
                            const next = !isBold
                              ? (isItalic ? 'bold italic' : 'bold')
                              : (isItalic ? 'italic' : 'normal');
                            updateSetting('fontStyle', next as QrSettings['fontStyle']);
                          }}
                          className={`h-7 w-7 rounded border flex items-center justify-center transition-colors ${
                            settings.fontStyle.includes('bold') ? 'border-primary bg-primary/10 text-primary' : 'border-input hover:bg-accent'
                          }`}
                          title="Bold"
                        >
                          <Bold className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const isBold = settings.fontStyle.includes('bold');
                            const isItalic = settings.fontStyle.includes('italic');
                            const next = !isItalic
                              ? (isBold ? 'bold italic' : 'italic')
                              : (isBold ? 'bold' : 'normal');
                            updateSetting('fontStyle', next as QrSettings['fontStyle']);
                          }}
                          className={`h-7 w-7 rounded border flex items-center justify-center transition-colors ${
                            settings.fontStyle.includes('italic') ? 'border-primary bg-primary/10 text-primary' : 'border-input hover:bg-accent'
                          }`}
                          title="Italic"
                        >
                          <Italic className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Text Color */}
                      <div className="flex items-center gap-1">
                        <input type="color" value={settings.frameColor} onChange={e => updateSetting('frameColor', e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border border-input" title="Text Color" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Statistics</h3>
          <Button variant="ghost" size="sm" onClick={handleRefreshStats} disabled={isRefreshing} className="h-8 gap-2">
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Total Scans" value={analytics.totalScans.toLocaleString()} change={analytics.scansChange} changeType="positive" icon={<Smartphone className="h-5 w-5" />} />
          <StatCard title="Menu Views" value={analytics.menuViews.toLocaleString()} change={analytics.viewsChange} changeType="positive" icon={<Eye className="h-5 w-5" />} />
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card variant="gradient">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-2">💡 Pro Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use high contrast colors for better scannability</li>
              <li>• Adding your logo makes the QR code recognizable</li>
              <li>• Frame text helps customers know what to do</li>
              <li>• Place QR codes at eye level on tables for maximum scans</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
