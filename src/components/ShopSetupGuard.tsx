import { Navigate, useLocation } from "react-router-dom";
import { useShopSetup } from "@/contexts/ShopSetupContext";
import { PageLoader } from "@/components/PageLoader";

export function ShopSetupGuard({ children }: { children: React.ReactNode }) {
  const { isSetupComplete, isLoading } = useShopSetup();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message="Checking shop setup..." />;
  }

  // Allow access to settings and details pages always (so they can complete setup)
  const allowedPaths = ["/shop/settings", "/shop/details", "/shop/about"];
  const isAllowed = allowedPaths.some((p) => location.pathname.startsWith(p));

  if (!isSetupComplete && !isAllowed) {
    // Redirect to settings with a flag so we can show the setup banner
    return <Navigate to="/shop/settings" state={{ fromSetupGuard: true }} replace />;
  }

  return <>{children}</>;
}
