import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "shopkeeper" as "admin" | "shopkeeper" | "customer"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { register } = useAuth();

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      toast.success("Registration successful!");
      // Navigation will be handled by AuthContext based on user role
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="elevated" className="border-0 shadow-xl">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground shadow-glow"
        >
          DM
        </motion.div>
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Join Digital Menu and start managing your restaurant</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Name            </label>
            <Input
              type="text"
              placeholder="John Doe"
              icon={<User className="h-4 w-4" />}
              value={formData.name}
              onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })); }}
              required
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
              required
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={formData.role} onValueChange={(value: "admin" | "shopkeeper" | "customer") => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="shopkeeper">Shopkeeper</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                value={formData.password}
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                required
                className={errors.password ? "border-destructive" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full px-8 py-3" 
            size="lg" 
            variant="gradient"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
