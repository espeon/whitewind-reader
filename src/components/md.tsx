import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/srcery.css";

export function Markdown({
  children,
  initialDelayMs,
  delayMs,
}: {
  children: string; // <-- Prefer string for markdown content
  initialDelayMs?: number;
  delayMs?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const animateElements = (delay: number) => {
    const elements = containerRef.current?.children;
    if (!elements) return;
    Array.from(elements).forEach((el, i) => {
      el.classList.remove("visible");
      setTimeout(() => {
        el.classList.add("visible");
      }, i * delay);
    });
  };

  useEffect(() => {
    const elements = containerRef.current?.children;
    if (!elements) return;
    const delay = delayMs || 100;
    const initialDelay = initialDelayMs || 0;
    setTimeout(() => {
      animateElements(delay);
    }, initialDelay);
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="prose prose-fuchsia prose-h1:text-3xl prose-h1:-mb-6 dark:prose-invert"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true }]]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
