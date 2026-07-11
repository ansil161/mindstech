import React, { useState } from 'react';

/**
 * Renders citation links representing ground-truth document sources used in RAG generation.
 * Rendered inside a collapsible accordion, collapsed by default.
 */
const SourceReferences = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2.5 pt-2 border-t border-white/5 select-none">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-[10px] font-semibold text-white/40 hover:text-white/60 transition-colors uppercase tracking-wider cursor-pointer"
        aria-expanded={isExpanded}
      >
        <span>Sources & Citations ({sources.length})</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {sources.map((src, i) => (
            <a
              key={i}
              href={src.source || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-medium text-white/70 hover:text-white transition-colors gap-1 border border-white/5 shadow-sm"
            >
              {/* Document Vector SVG Icon */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-2.5 h-2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {src.document_name || 'Document'}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(SourceReferences);
