import React from 'react';

/**
 * Parses inline markdown tokens (like bold **text** and inline `code` blocks).
 * Returns an array of React elements or strings.
 */
export const parseInlineMarkdown = (text) => {
  if (!text) return '';

  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-neutral-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-xs text-red-650 border border-neutral-200/50">
          {part.slice(1, -1)}
        </code>
      );
    }
    
    // Check for links [anchor](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a 
          key={index} 
          href={linkMatch[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-500 underline transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
};

/**
 * A lightweight custom block markdown parser to style lists, tables, headers,
 * paragraphs, and code sections in message bubbles.
 */
export const renderMarkdown = (markdownText) => {
  if (!markdownText) return null;

  const lines = markdownText.split('\n');
  const elements = [];
  let currentList = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = '';

  const flushList = (key) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-2 space-y-1 text-sm text-neutral-750">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        inCodeBlock = false;
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 font-mono text-xs text-emerald-800 shadow-inner">
            {codeLang && (
              <div className="bg-neutral-100 px-4 py-1.5 text-[10px] text-neutral-500 border-b border-neutral-200 uppercase tracking-wider flex justify-between items-center">
                <span>{codeLang}</span>
                <span className="text-neutral-400 select-none">Code</span>
              </div>
            )}
            <pre className="p-4 overflow-x-auto whitespace-pre">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        codeLines = [];
        codeLang = '';
      } else {
        // Open code block
        flushList(i);
        inCodeBlock = true;
        codeLang = line.trim().slice(3) || 'javascript';
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Handle unordered lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletContent = line.trim().substring(2);
      currentList.push(
        <li key={`li-${i}`}>
          {parseInlineMarkdown(bulletContent)}
        </li>
      );
      continue;
    } else {
      flushList(i);
    }

    // Handle headers
    if (line.trim().startsWith('###')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-base font-bold mt-3 mb-1 text-neutral-900 border-b border-neutral-100 pb-1">
          {parseInlineMarkdown(line.trim().substring(4))}
        </h4>
      );
      continue;
    }
    if (line.trim().startsWith('##')) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-lg font-bold mt-4 mb-2 text-neutral-900 border-b border-neutral-200 pb-1">
          {parseInlineMarkdown(line.trim().substring(3))}
        </h3>
      );
      continue;
    }

    // Ignore empty lines but preserve spacing
    if (line.trim() === '') {
      if (elements.length > 0 && i < lines.length - 1) {
        elements.push(<div key={`space-${i}`} className="h-2" />);
      }
      continue;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${i}`} className="text-sm my-1 leading-relaxed text-neutral-750">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  // Flush remaining lists
  flushList('final');

  return <div className="space-y-1.5">{elements}</div>;
};
