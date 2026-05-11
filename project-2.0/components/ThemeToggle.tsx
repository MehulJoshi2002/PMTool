"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-white/[0.04] dark:bg-[#1e2132] opacity-50" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-4 right-4 z-50 p-2 rounded-xl bg-white border border-gray-200 dark:bg-[#1e2132] dark:border-white/[0.06] text-slate-600 dark:text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 shadow-sm hover:shadow-md transition-all duration-200 group"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun size={18} className="group-hover:rotate-12 transition-transform" />
      ) : (
        <Moon size={18} className="group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}
