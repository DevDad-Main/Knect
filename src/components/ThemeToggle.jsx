import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon 
          className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" 
        />
      ) : (
        <Sun 
          className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" 
        />
      )}
    </button>
  );
};

export default ThemeToggle;