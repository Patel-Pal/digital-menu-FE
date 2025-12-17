import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Floating Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <div className="rounded-full bg-card/80 backdrop-blur-md shadow-lg p-1">
          <ThemeToggle size="sm" />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
