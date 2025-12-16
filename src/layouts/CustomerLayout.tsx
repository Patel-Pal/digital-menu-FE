import { Outlet } from "react-router-dom";

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}
