import { useCallback, useState, useEffect } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");

    window.location.href = "/login";
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} aria-label="Wyloguj się">
      <LogOut className="mr-2 h-4 w-4" />
      Wyloguj
    </Button>
  );
}
