import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const [uri, setUri] = useState("");
  const redirect = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uri) {
      try {
        if (uri.startsWith("https://whtwnd.com")) {
          redirect({
            to: "/$handle/$tid",
            params: { handle: uri.split("/")[3], tid: uri.split("/")[4] },
          });
          // at://futur.blue/com.whtwnd.blog.entry/3ls7sbvpsqc2w
        } else if (uri.startsWith("at://")) {
          const parts = uri.split("/");
          if (parts.length >= 5) {
            redirect({
              to: "/$handle/$tid",
              params: { handle: parts[2], tid: parts[4] },
            });
          } else {
            throw new Error("Invalid at-uri format");
          }
        }
      } catch (error) {
        console.error("Error redirecting to reader:", error);
        alert("Invalid link format. Please check the URL and try again.");
      }
    }
  };
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#05070a] via-[#10151b] to-[#181a20]">
      {/* Animated Blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <svg
          className="absolute top-[-10%] left-[-10%] w-[60vw] opacity-40 blur-2xl animate-pulse"
          viewBox="0 0 200 200"
        >
          <defs>
            <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#61dafb" />
              <stop offset="100%" stopColor="#282c34" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle fill="url(#blob1)" cx="100" cy="100" r="100" />
        </svg>
        <svg
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] opacity-20 blur-2xl animate-pulse"
          viewBox="0 0 200 200"
        >
          <defs>
            <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#61dafb" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle fill="url(#blob2)" cx="100" cy="100" r="100" />
        </svg>
      </div>

      {/* Hero Content */}
      <header className="flex flex-col items-start justify-center text-start gap-4 py-24 px-4">
        <h1 className="text-6xl md:text-7xl font-semibold bg-gradient-to-r from-white via-[#61dafb] to-[#a1c4fd] bg-clip-text text-transparent drop-shadow-[0_4px_32px_rgba(97,218,251,0.25)] tracking-tight animate-fade-in-up">
          Whitewind
          <br />
          Reader
        </h1>
        <p className="text-lg md:text-xl font-semibold text-white/80 max-w-xl animate-fade-in-up [animation-delay:0.2s]">
          Your new favourite{" "}
          <span className="text-[#a1c4fd]">hyper-optimized</span> way to gist
          your favorite articles. With dark mode.
        </p>
        {/* Overstyled Input Box */}
        <div className="w-full mt-4 max-w-xl animate-fade-in-up [animation-delay:0.4s]">
          <div className="relative">
            <input
              type="text"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(e);
                }
              }}
              placeholder="Paste your Whitewind link or at-uri here…"
              className="w-full rounded-2xl px-4 py-4 bg-white/10 backdrop-blur-xl border-2 border-[#61dafb] text-white shadow-xl focus:outline-none focus:ring-4 focus:ring-[#61dafb]/40 transition-all duration-300 placeholder-white/40"
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#61dafb] cursor-pointer hover:text-white transition-colors duration-200"
              onClick={handleSubmit}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </header>
      {/* Animations */}
      <style>
        {`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(10px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.6s cubic-bezier(.23,1.01,.32,1) both;
          }
        `}
      </style>
    </div>
  );
}
