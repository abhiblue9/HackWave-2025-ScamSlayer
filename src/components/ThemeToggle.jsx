import { useEffect, useState } from "react";

function getInitialTheme() {
  const saved = localStorage.getItem("scamslayer_theme");
  if (saved === "light" || saved === "dark") return saved;
  // Default to dark until light theme contrast is fully mapped across components
  return "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("theme-light");
    else root.classList.remove("theme-light");
    localStorage.setItem("scamslayer_theme", theme);
  }, [theme]);

  return (
    <button
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
    >
      {theme === "light" ? "☀️" : "🌙"}
    </button>
  );
}
