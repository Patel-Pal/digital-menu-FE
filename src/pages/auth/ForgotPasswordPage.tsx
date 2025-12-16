import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card variant="elevated" className="border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success"
          >
            <CheckCircle className="h-8 w-8" />
          </motion.div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We've sent password reset instructions to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSubmitted(false)}
          >
            Try another email
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            to="/auth/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

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
        <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
        <CardDescription>
          No worries! Enter your email and we'll send you reset instructions.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" variant="gradient">
            Send Reset Link
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <Link
          to="/auth/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
