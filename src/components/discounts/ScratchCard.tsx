import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { discountService } from "@/services/discountService";
import { toast } from "sonner";
import type { ScratchResult } from "@/types/discount";

interface Props {
  shopId: string;
  deviceId: string;
  open: boolean;
  onClose: () => void;
}

export function ScratchCard({ shopId, deviceId, open, onClose }: Props) {
  const [result, setResult] = useState<ScratchResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (!open) { setResult(null); setRevealed(false); setScratchPercent(0); return; }
    fetchResult();
  }, [open]);

  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#a0a0a0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText("Scratch here!", canvas.width / 2, canvas.height / 2);
  }, [result]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await discountService.scratchCard(shopId, deviceId);
      setResult(res);
    } catch {
      toast.error("Failed to get scratch card");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Check scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++;
    }
    const pct = (cleared / (imageData.data.length / 4)) * 100;
    setScratchPercent(pct);
    if (pct > 50 && !revealed) setRevealed(true);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-background rounded-2xl p-6 max-w-sm w-full text-center space-y-4 relative"
        >
          <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>

          <h2 className="text-lg font-bold">🎫 Scratch & Win</h2>

          {loading ? (
            <p className="text-sm text-muted-foreground py-8">Loading...</p>
          ) : result && !revealed ? (
            <div className="relative mx-auto rounded-xl overflow-hidden border" style={{ width: 260, height: 160 }}>
              {/* Prize underneath */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-3xl mb-1">🎁</span>
                <span className="font-bold text-primary">{result.label}</span>
                <span className="text-xs text-muted-foreground">
                  {result.rewardType === "percentage" ? `${result.rewardValue}% off` : `₹${result.rewardValue} off`}
                </span>
              </div>
              {/* Scratch overlay */}
              <canvas
                ref={canvasRef}
                width={260}
                height={160}
                className="absolute inset-0 cursor-pointer touch-none"
                onMouseDown={() => { isDrawing.current = true; }}
                onMouseUp={() => { isDrawing.current = false; }}
                onMouseLeave={() => { isDrawing.current = false; }}
                onMouseMove={scratch}
                onTouchStart={() => { isDrawing.current = true; }}
                onTouchEnd={() => { isDrawing.current = false; }}
                onTouchMove={scratch}
              />
            </div>
          ) : result && revealed ? (
            <div className="space-y-3 py-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-xl font-bold">You won!</h3>
              <p className="text-lg font-semibold text-primary">{result.label}</p>
              <p className="text-sm text-muted-foreground">
                {result.rewardType === "percentage" ? `${result.rewardValue}% off` : `₹${result.rewardValue} off`}
              </p>
              <Button onClick={onClose} className="w-full">Awesome!</Button>
            </div>
          ) : null}

          {result && !revealed && (
            <p className="text-xs text-muted-foreground">Scratch the card to reveal your prize!</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
