import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Store, FolderOpen, UtensilsCrossed, QrCode, ShoppingBag,
  ChevronRight, ChevronLeft, X, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OnboardingGuideProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: Store,
    title: "Set Up Your Shop",
    description: "First, complete your shop profile with name, phone, address, and description. This info appears on your digital menu.",
    color: "text-primary",
    bg: "bg-primary/10",
    action: { label: "Go to Settings", path: "/shop/settings" },
  },
  {
    icon: FolderOpen,
    title: "Create Categories",
    description: "Organize your menu by creating categories like Starters, Main Course, Beverages, Desserts, etc.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    action: { label: "Go to Categories", path: "/shop/categories" },
  },
  {
    icon: UtensilsCrossed,
    title: "Add Menu Items",
    description: "Add your dishes with photos, prices, descriptions, and tags like Vegetarian or Spicy. Assign each item to a category.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    action: { label: "Go to Menu", path: "/shop/menu" },
  },
  {
    icon: QrCode,
    title: "Generate QR Code",
    description: "Generate and download your unique QR code. Print it and place it on tables so customers can scan and view your menu.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    action: { label: "Go to QR Code", path: "/shop/qr" },
  },
  {
    icon: ShoppingBag,
    title: "Manage Orders",
    description: "When customers place orders, you'll get real-time notifications. Approve, reject, or mark orders as completed.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    action: { label: "Go to Orders", path: "/shop/orders" },
  },
];

export function OnboardingGuide({ open, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const step = steps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === steps.length - 1;

  const handleAction = () => {
    onClose();
    navigate(step.action.path);
  };

  const markSeen = () => {
    localStorage.setItem("onboarding_seen", "true");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground">
            <button
              onClick={markSeen}
              className="absolute top-4 right-4 rounded-full p-1.5 bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="h-6 w-6" />
              <span className="text-sm font-medium opacity-90">Getting Started Guide</span>
            </div>
            <h2 className="text-xl font-bold">Welcome to Digital Menu</h2>
            <p className="text-sm opacity-80 mt-1">Follow these steps to set up your restaurant</p>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? "w-8 bg-white" : i < currentStep ? "w-4 bg-white/60" : "w-4 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step content */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.bg} flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${step.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Action button */}
                <Button onClick={handleAction} variant="outline" className="w-full mb-4 gap-2">
                  {step.action.label}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={markSeen}>
                  Skip
                </Button>
                {isLast ? (
                  <Button size="sm" onClick={markSeen} className="gap-1">
                    <Rocket className="h-4 w-4" />
                    Get Started
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)} className="gap-1">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
