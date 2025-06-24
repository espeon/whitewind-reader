import type { ReactNode } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = containerRef.current?.children;
    if (!elements) return;
    Array.from(elements).forEach((el, i) => {
      el.classList.remove("visible"); // Reset in case of re-render
      setTimeout(() => {
        el.classList.add("visible");
      }, i * 120); // 120ms per element
    });
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="prose prose-fuchsia prose-h1:text-3xl prose-h1:-mb-6 dark:prose-invert"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
