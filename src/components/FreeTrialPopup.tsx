import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface FreeTrialPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FreeTrialPopup({ isOpen, onClose }: FreeTrialPopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    shopName: "",
    shopType: "restaurant" as "restaurant" | "cafe",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Format the message as a free trial inquiry
      const message = [
        `🎉 Free Trial Inquiry`,
        ``,
        `Shop Name: ${formData.shopName}`,
        `Shop Type: ${formData.shopType === "cafe" ? "Cafe" : "Restaurant"}`,
        `Phone: ${formData.phone || "Not provided"}`,
        ``,
        `This user wants to get started with the Digital Menu free trial.`,
      ].join("\n");

      const res = await fetch(`${API_URL}/api/admin/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send inquiry");
      setSubmitted(true);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", shopName: "", shopType: "restaurant", phone: "" });
    setSubmitted(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-background rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Get Free Access
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Fill in your details and we'll set up your free digital menu within 24 hours.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Inquiry Sent!</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Thank you, {formData.name}! We've received your free trial request for <span className="font-medium">{formData.shopName}</span>. Check your email for a confirmation. Our team will set up your account within 24 hours.
              </p>
              <Button onClick={handleClose} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
                Done
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="trial-name" className="text-sm font-medium mb-1.5 block">Your Name</Label>
                <Input
                  id="trial-name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="trial-email" className="text-sm font-medium mb-1.5 block">Email Address</Label>
                <Input
                  id="trial-email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="trial-phone" className="text-sm font-medium mb-1.5 block">Phone Number</Label>
                <Input
                  id="trial-phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="trial-shop" className="text-sm font-medium mb-1.5 block">Shop / Restaurant Name</Label>
                <Input
                  id="trial-shop"
                  placeholder="My Restaurant"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Shop Type</Label>
                <RadioGroup
                  value={formData.shopType}
                  onValueChange={(value) => setFormData({ ...formData, shopType: value as "restaurant" | "cafe" })}
                  className="flex gap-4"
                  disabled={loading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="restaurant" id="type-restaurant" />
                    <Label htmlFor="type-restaurant" className="text-sm cursor-pointer">🍽️ Restaurant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cafe" id="type-cafe" />
                    <Label htmlFor="type-cafe" className="text-sm cursor-pointer">☕ Cafe</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-11"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Send Inquiry</>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-2">
                No credit card required. We'll set up everything for you.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
