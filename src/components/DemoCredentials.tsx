import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Copy, Check, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FadeInSection,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
} from "@/components/animations";
import type { LucideIcon } from "lucide-react";

interface CredentialItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

const DEMO_CREDENTIALS: CredentialItem[] = [
  { label: "Email", value: "kenilp110043@gmail.com", icon: Mail },
  { label: "Password", value: "123456", icon: Lock },
];

export function DemoCredentials() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function handleCopy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard API unavailable — credentials remain selectable text
    }
  }

  return (
    <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <FadeInSection>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Try the{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Demo
              </span>
            </h2>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Use these credentials to explore the full application without registering.
            </p>
          </FadeInSection>
        </div>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8" staggerDelay={0.1}>
          {DEMO_CREDENTIALS.map((cred) => (
            <StaggerItem key={cred.label}>
              <AnimatedCard hoverLift={6} hoverScale={1.02}>
                <Card className="border-0 bg-gradient-to-br from-background to-muted/50 overflow-hidden">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                        <cred.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {cred.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm sm:text-base font-mono select-all break-all">
                        {cred.value}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8"
                        onClick={() => handleCopy(cred.value, cred.label)}
                        aria-label={`Copy ${cred.label}`}
                      >
                        {copiedField === cred.label ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeInSection delay={0.3}>
          <div className="text-center">
            <Link to="/auth/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 transition-shadow">
                Go to Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
