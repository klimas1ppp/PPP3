"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/switch";

export type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ppp-theme") as Theme | null;
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
    setReady(true);
  }, []);

  if (!ready) return <span className="theme-toggle-placeholder" aria-hidden />;

  return (
    <Switch
      checked={theme === "dark"}
      onChange={(on) => {
        const next: Theme = on ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
        localStorage.setItem("ppp-theme", next);
      }}
      label="Dark theme"
      className="theme-toggle"
    />
  );
}
