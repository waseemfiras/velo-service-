import React from "react";
import { Link } from "react-router-dom";

interface FormattedMessageProps {
  content: string;
  isUser: boolean;
}

export function FormattedMessage({ content, isUser }: FormattedMessageProps) {
  if (!content) return null;

  // Simple Arabic character detection
  const isArabic = /[\u0600-\u06FF]/.test(content);

  // Split content into lines to handle block structures
  const lines = content.split("\n");

  return (
    <div 
      className={`space-y-1.5 ${isArabic ? "text-right [direction:rtl] font-sans" : "text-left [direction:ltr]"} ${
        isUser ? "text-black" : "text-white/95"
      }`}
      style={{ wordBreak: "break-word" }}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className={`font-display font-bold text-base mt-3 mb-1 ${isUser ? "text-black" : "text-white"}`}>
              {parseInlineMarkdown(trimmed.substring(4), isUser)}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className={`font-display font-bold text-lg mt-4 mb-2 ${isUser ? "text-black" : "text-white"}`}>
              {parseInlineMarkdown(trimmed.substring(3), isUser)}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className={`font-display font-bold text-xl mt-5 mb-2 ${isUser ? "text-black" : "text-white"}`}>
              {parseInlineMarkdown(trimmed.substring(2), isUser)}
            </h2>
          );
        }

        // List items
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          return (
            <div key={idx} className={`flex items-start gap-2 my-1 ${isArabic ? "mr-4" : "ml-4"}`}>
              <span className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${isUser ? "bg-black/60" : "bg-white/60"}`} />
              <span className="flex-1">{parseInlineMarkdown(trimmed.substring(2), isUser)}</span>
            </div>
          );
        }

        // Numbered list items (e.g., "1. " or "2. ")
        const numMatch = trimmed.match(/^(\d+)[\.\-]\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className={`flex items-start gap-1.5 my-1 ${isArabic ? "mr-4" : "ml-4"}`}>
              <span className={`font-semibold flex-shrink-0 ${isUser ? "text-black/60" : "text-white/60"}`}>
                {numMatch[1]}.
              </span>
              <span className="flex-1">{parseInlineMarkdown(numMatch[2], isUser)}</span>
            </div>
          );
        }

        // Empty lines
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Standard paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {parseInlineMarkdown(line, isUser)}
          </p>
        );
      })}
    </div>
  );
}

// Parser for inline markdown styling: **bold**, *italic*, `code`, and [label](url)
function parseInlineMarkdown(text: string, isUser: boolean): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Pattern to match: markdown links [label](url), bold **text**, italic *text*, or code `text`
  const regex = /(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(\*.*?\*)|(`.*?`)/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;

    // Add normal text before match
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    if (match[1]) {
      // It's a markdown link: [label](url)
      const linkMatch = match[1].match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const label = linkMatch[1];
        const url = linkMatch[2];
        const isRelative = url.startsWith("/");
        
        if (isRelative) {
          parts.push(
            <Link
              key={key++}
              to={url}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-emerald-400 font-semibold transition-all text-xs my-1 hover:scale-[1.03] active:scale-[0.97] duration-150 shadow-[0_2px_8px_rgba(16,185,129,0.05)] mx-1 select-none"
            >
              {label}
            </Link>
          );
        } else {
          parts.push(
            <a
              key={key++}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-emerald-400 font-semibold transition-all text-xs my-1 hover:scale-[1.03] active:scale-[0.97] duration-150 shadow-[0_2px_8px_rgba(16,185,129,0.05)] mx-1 select-none"
            >
              {label}
            </a>
          );
        }
      } else {
        parts.push(match[1]);
      }
    } else if (match[2]) {
      // Bold **text**
      const innerText = match[2].slice(2, -2);
      parts.push(
        <strong key={key++} className={`font-bold ${isUser ? "text-black" : "text-white"} mx-0.5`}>
          {innerText}
        </strong>
      );
    } else if (match[3]) {
      // Italic *text*
      const innerText = match[3].slice(1, -1);
      parts.push(
        <em key={key++} className="italic opacity-90 mx-0.5">
          {innerText}
        </em>
      );
    } else if (match[4]) {
      // Code `text`
      const innerText = match[4].slice(1, -1);
      parts.push(
        <code 
          key={key++} 
          className={`font-mono text-xs px-1.5 py-0.5 rounded mx-0.5 ${
            isUser ? "bg-black/10 text-black" : "bg-white/10 text-white"
          }`}
        >
          {innerText}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
