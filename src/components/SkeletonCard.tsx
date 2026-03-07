import { Card, CardContent } from "@/components/ui/card";

interface SkeletonCardProps {
  count?: number;
  variant?: "menu-item" | "stat" | "order";
}

export function SkeletonCard({ count = 3, variant = "menu-item" }: SkeletonCardProps) {
  if (variant === "stat") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 space-y-3">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-6 w-16 bg-muted rounded" />
              <div className="h-2 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === "order") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
                <div className="h-6 w-20 bg-muted rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-3/4 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // menu-item variant (default)
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
                <div className="flex items-center justify-between mt-2">
                  <div className="h-5 w-16 bg-muted rounded" />
                  <div className="h-6 w-6 bg-muted rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
