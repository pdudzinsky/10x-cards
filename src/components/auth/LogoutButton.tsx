import { useCallback, useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Wystąpił błąd podczas wylogowania");
      }

      // Usuń tokeny z localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh_token");

      // Przekieruj do strony logowania
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd podczas wylogowania");
      setIsLoading(false);
    }
  }, [isLoading]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading} aria-label="Wyloguj się">
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Wylogowywanie..." : "Wyloguj"}
    </Button>
  );
}
