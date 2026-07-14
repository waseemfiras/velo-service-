import React from "react";
import { Link } from "react-router-dom";
import { Copy, Check } from "lucide-react";

interface FormattedMessageProps {
  content: string;
  isUser: boolean;
}

interface Block {
  type: "text" | "code" | "professional-text";
  language?: string;
  content: string;
}

// Stateful component to render multi-line code blocks with custom syntax highlighting and copy button
interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language === 'js' || language === 'javascript' ? 'JavaScript'
    : language === 'ts' || language === 'typescript' ? 'TypeScript'
    : language === 'html' ? 'HTML'
    : language === 'css' ? 'CSS'
    : language === 'json' ? 'JSON'
    : language === 'python' || language === 'py' ? 'Python'
    : language || 'Code';

  return (
    <div className="my-4 border border-white/10 rounded-xl overflow-hidden bg-[#07070a] shadow-xl group text-sm font-sans [direction:ltr]">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5 select-none">
        <span className="text-xs font-mono font-medium text-white/50 lowercase">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-xs text-white/70 hover:text-white transition-all cursor-pointer select-none"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code Content */}
      <div className="relative">
        <pre className="overflow-x-auto p-4 font-mono text-xs text-white/90 leading-relaxed scrollbar-thin scrollbar-thumb-white/10 [direction:ltr] text-left">
          {highlightCode(code, language)}
        </pre>
      </div>
    </div>
  );
}

// Light tokenizer for beautiful syntax coloring
function highlightCode(code: string, language: string) {
  if (!code) return "";
  
  // Escape HTML tags to prevent execution
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const normalizedLang = (language || "").toLowerCase();

  if (normalizedLang === "html" || normalizedLang === "xml" || normalizedLang === "svg") {
    // 1. Highlight tags: e.g., &lt;div or &lt;/div
    escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="text-pink-400 font-medium">$1</span>');
    // 2. Highlight attributes: e.g., class=, href=
    escaped = escaped.replace(/(\s[a-zA-Z0-9-]+)=/g, '<span class="text-teal-400">$1</span>=');
    // 3. Highlight strings in quotes
    escaped = escaped.replace(/(&quot;.*?&quot;)/g, '<span class="text-amber-200">$1</span>');
    escaped = escaped.replace(/(&#39;.*?&#39;)/g, '<span class="text-amber-200">$1</span>');
  } else {
    // JS/TS, Python, C++, etc.
    // 1. Strings (do this early to avoid highlighting keywords inside strings)
    const placeholders: string[] = [];
    
    // Replace double quoted strings
    escaped = escaped.replace(/(&quot;.*?&quot;)/g, (m) => {
      placeholders.push(`<span class="text-amber-200">${m}</span>`);
      return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });
    
    // Replace single quoted strings
    escaped = escaped.replace(/(&#39;.*?&#39;)/g, (m) => {
      placeholders.push(`<span class="text-amber-200">${m}</span>`);
      return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });

    // Replace backtick strings
    escaped = escaped.replace(/(`[\s\S]*?`)/g, (m) => {
      placeholders.push(`<span class="text-emerald-300 font-normal">${m}</span>`);
      return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });

    // Replace single-line comments
    escaped = escaped.replace(/(\/\/.*)/g, (m) => {
      placeholders.push(`<span class="text-zinc-500 italic">${m}</span>`);
      return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });

    // Replace multi-line comments
    escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, (m) => {
      placeholders.push(`<span class="text-zinc-500 italic">${m}</span>`);
      return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });

    // 2. Highlight keywords with word boundaries
    const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|import|export|from|class|extends|new|await|async|try|catch|finally|throw|typeof|instanceof|public|private|protected|interface|type|implements|as|any|string|number|boolean|void|def|elif|pass|lambda|try|except)\b/g;
    escaped = escaped.replace(keywords, '<span class="text-purple-400 font-medium">$1</span>');

    // 3. Highlight builtins, booleans, null
    const builtins = /\b(true|false|null|undefined|console|log|document|window|process|require|module|global|exports|this|super|self)\b/g;
    escaped = escaped.replace(builtins, '<span class="text-sky-400">$1</span>');

    // 4. Highlight numbers
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-blue-300">$1</span>');

    // 5. Restore placeholders in reverse order
    for (let j = placeholders.length - 1; j >= 0; j--) {
      escaped = escaped.replace(`___PLACEHOLDER_${j}___`, placeholders[j]);
    }
  }

  return <span dangerouslySetInnerHTML={{ __html: escaped }} />;
}

// Stateful component to render premium professional text card with a dedicated Copy button
interface ProfessionalTextBlockProps {
  content: string;
}

function ProfessionalTextBlock({ content }: ProfessionalTextBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isArabic = /[\u0600-\u06FF]/.test(content);

  return (
    <div className="my-5 border border-purple-500/25 rounded-2xl overflow-hidden bg-purple-950/[0.04] shadow-[0_4px_25px_rgba(168,85,247,0.04)] relative group transition-all duration-300 hover:border-purple-500/35 text-sm font-sans">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/[0.02] via-transparent to-transparent pointer-events-none" />
      
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-purple-500/[0.03] border-b border-purple-500/10 select-none">
        <span className="text-xs font-semibold text-purple-400 tracking-wide uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          {isArabic ? "✨ النص الاحترافي المولد" : "✨ Professional Text Generated"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 text-xs text-purple-300 hover:text-white font-medium transition-all cursor-pointer shadow-sm select-none"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">{isArabic ? "تم النسخ!" : "Copied!"}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{isArabic ? "نسخ النص" : "Copy Text"}</span>
            </>
          )}
        </button>
      </div>

      {/* Card Body */}
      <div className={`p-5 md:p-6 leading-relaxed whitespace-pre-wrap text-white/95 text-[15px] ${isArabic ? "text-right [direction:rtl] font-sans" : "text-left [direction:ltr]"}`}>
        {content}
      </div>
    </div>
  );
}

// Stateful block parsing for code blocks and professional-text wrappers
function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.split("\n");
  let currentBlockType: "text" | "code" | "professional-text" = "text";
  let currentLanguage = "";
  let accumulatedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check for markdown code block starts/ends
    if (trimmed.startsWith("```")) {
      // If we are currently inside a block (code or professional-text), close it
      if (currentBlockType === "code" || currentBlockType === "professional-text") {
        blocks.push({
          type: currentBlockType,
          language: currentLanguage,
          content: accumulatedLines.join("\n")
        });
        accumulatedLines = [];
        currentBlockType = "text";
        currentLanguage = "";
      } else {
        // We are currently in text mode. Close the text block first if it has lines
        if (accumulatedLines.length > 0) {
          blocks.push({
            type: "text",
            content: accumulatedLines.join("\n")
          });
          accumulatedLines = [];
        }
        
        // Open a new block
        const lang = trimmed.slice(3).trim().toLowerCase();
        if (lang === "professional-text" || lang === "professional" || lang === "pro-text" || lang === "نص-احترافي") {
          currentBlockType = "professional-text";
        } else {
          currentBlockType = "code";
          currentLanguage = lang || "code";
        }
      }
    } 
    // Check for alternative tag starts [PROFESSIONAL_TEXT]
    else if (trimmed === "[PROFESSIONAL_TEXT]" || trimmed === "[professional_text]") {
      if (currentBlockType === "text" && accumulatedLines.length > 0) {
        blocks.push({
          type: "text",
          content: accumulatedLines.join("\n")
        });
        accumulatedLines = [];
      }
      currentBlockType = "professional-text";
      currentLanguage = "professional";
    }
    // Check for alternative tag ends [/PROFESSIONAL_TEXT]
    else if (trimmed === "[/PROFESSIONAL_TEXT]" || trimmed === "[/professional_text]" || trimmed === "[END_PROFESSIONAL_TEXT]" || trimmed === "[end_professional_text]") {
      if (currentBlockType === "professional-text") {
        blocks.push({
          type: "professional-text",
          language: "professional",
          content: accumulatedLines.join("\n")
        });
        accumulatedLines = [];
        currentBlockType = "text";
        currentLanguage = "";
      }
    } 
    // Otherwise accumulate lines
    else {
      accumulatedLines.push(line);
    }
  }

  // Push remainder
  if (accumulatedLines.length > 0) {
    blocks.push({
      type: currentBlockType,
      language: currentLanguage,
      content: accumulatedLines.join("\n")
    });
  }

  return blocks;
}

export function FormattedMessage({ content, isUser }: FormattedMessageProps) {
  if (!content) return null;

  // Split into blocks first to support multi-line structures like code and professional text
  const blocks = parseBlocks(content);

  return (
    <div className="w-full space-y-3">
      {blocks.map((block, bIdx) => {
        if (block.type === "code") {
          return (
            <CodeBlock 
              key={bIdx} 
              language={block.language || ""} 
              code={block.content} 
            />
          );
        }

        if (block.type === "professional-text") {
          return (
            <ProfessionalTextBlock 
              key={bIdx} 
              content={block.content} 
            />
          );
        }

        // Render normal text blocks line by line as originally designed
        const lines = block.content.split("\n");
        const isArabic = /[\u0600-\u06FF]/.test(block.content);

        return (
          <div 
            key={bIdx}
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
