import { useTheme } from "./theme-provider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={handleToggle}
      className={`relative flex items-center w-16 h-8 rounded-full transition-colors duration-200 focus:outline-none ${
        isDark ? "bg-gray-800" : "bg-blue-300"
      } border border-gray-300`}
    >
      {/* Sun icon */}
      <span
        className={`absolute left-1.5 text-blue-300 transition-opacity duration-200`}
        style={{ fontSize: "1.2em" }}
      >
        ☀️
      </span>
      {/* Moon icon */}
      <span
        className={`absolute right-1 top-0.5 text-indigo-500 transition-opacity duration-200`}
        style={{ fontSize: "1.2em" }}
      >
        🌙
      </span>
      {/* Toggle knob */}
      <span
        className={`absolute top-0.7 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
          isDark ? "translate-x-8" : ""
        }`}
      />
    </button>
  );
}

export default ThemeSwitcher;
