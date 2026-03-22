import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { discountService } from "@/services/discountService";
import { toast } from "sonner";
import type { SpinResult } from "@/types/discount";

interface Segment {
  label: string;
  rewardType: string;
  rewardValue: number;
}

interface Props {
  shopId: string;
  deviceId: string;
  segments: Segment[];
  open: boolean;
  onClose: () => void;
}

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--primary) / 0.7)",
  "hsl(var(--accent-foreground))", "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.85)", "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.75)", "hsl(var(--primary) / 0.45)",
];

export function SpinWheel({ shopId, deviceId, segments, open, onClose }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    try {
      const res = await discountService.spinWheel(shopId, deviceId);
      // Find the winning segment index
      const winIdx = segments.findIndex(s => s.label === res.label);
      const segAngle = 360 / segments.length;
      // Spin 5 full rotations + land on winning segment
      const targetAngle = 360 * 5 + (360 - winIdx * segAngle - segAngle / 2);
      setRotation(prev => prev + targetAngle);

      setTimeout(() => {
        setResult(res);
        setSpinning(false);
      }, 3500);
    } catch {
      toast.error("Spin failed, try again");
      setSpinning(false);
    }
  };

  if (!open) return null;

  const segAngle = 360 / segments.length;

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

          <h2 className="text-lg font-bold">🎡 Spin & Win</h2>

          {!result ? (
            <>
              <div className="relative mx-auto" style={{ width: 260, height: 260 }}>
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 text-2xl">▼</div>
                {/* Wheel */}
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 3.5, ease: [0.17, 0.67, 0.12, 0.99] }}
                  className="w-full h-full rounded-full border-4 border-primary/30 overflow-hidden relative"
                  style={{ transformOrigin: "center center" }}
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {segments.map((seg, i) => {
                      const startAngle = (i * segAngle * Math.PI) / 180;
                      const endAngle = ((i + 1) * segAngle * Math.PI) / 180;
                      const x1 = 100 + 100 * Math.cos(startAngle);
                      const y1 = 100 + 100 * Math.sin(startAngle);
                      const x2 = 100 + 100 * Math.cos(endAngle);
                      const y2 = 100 + 100 * Math.sin(endAngle);
                      const largeArc = segAngle > 180 ? 1 : 0;
                      const midAngle = (startAngle + endAngle) / 2;
                      const tx = 100 + 60 * Math.cos(midAngle);
                      const ty = 100 + 60 * Math.sin(midAngle);
                      const textRotation = (midAngle * 180) / Math.PI;

                      return (
                        <g key={i}>
                          <path
                            d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                            fill={COLORS[i % COLORS.length]}
                            stroke="white"
                            strokeWidth="1"
                          />
                          <text
                            x={tx}
                            y={ty}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="7"
                            fontWeight="bold"
                            transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                          >
                            {seg.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>
              </div>
              <Button onClick={spin} disabled={spinning} className="w-full">
                {spinning ? "Spinning..." : "Spin Now!"}
              </Button>
            </>
          ) : result.rewardValue === 0 ? (
            <div className="space-y-3 py-4">
              <div className="text-4xl">😔</div>
              <h3 className="text-xl font-bold text-muted-foreground">Better luck next time!</h3>
              <p className="text-sm text-muted-foreground">
                Don't worry, try again on your next order.
              </p>
              <Button onClick={onClose} variant="outline" className="w-full">Close</Button>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-xl font-bold">You won!</h3>
              <p className="text-lg font-semibold text-primary">{result.label}</p>
              <p className="text-sm text-muted-foreground">
                {result.rewardType === "percentage" ? `${result.rewardValue}% off` : `₹${result.rewardValue} off`} your next order
              </p>
              <Button onClick={onClose} className="w-full">Awesome!</Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
