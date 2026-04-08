import { CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURE_MATRIX, FEATURE_KEYS, type SubscriptionPlan } from "@/config/featureMatrix";

const PLANS: SubscriptionPlan[] = ["free", "basic", "premium", "enterprise"];

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  enterprise: "Enterprise",
};

function humanize(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function FeatureMatrixTable() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Feature Matrix</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Feature</TableHead>
              {PLANS.map((plan) => (
                <TableHead key={plan} className="text-center">
                  {PLAN_LABELS[plan]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {FEATURE_KEYS.map((featureKey) => (
              <TableRow key={featureKey}>
                <TableCell className="font-medium">
                  {humanize(featureKey)}
                </TableCell>
                {PLANS.map((plan) => {
                  const enabled = FEATURE_MATRIX[plan].includes(featureKey);
                  return (
                    <TableCell key={plan} className="text-center">
                      {enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500 inline-block" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground/40 inline-block" />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
