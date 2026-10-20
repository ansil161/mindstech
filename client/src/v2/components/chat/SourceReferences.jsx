import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        className="flex items-center justify-between w-full text-[10px] font-semibold text-white/40 hover:text-[#CC0001] transition-colors duration-200 uppercase tracking-wider cursor-pointer"
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

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {sources.map((src, i) => (
                <a
                  key={i}
                  href={src.source || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-[rgba(204,0,1,0.06)] hover:bg-[rgba(204,0,1,0.12)] text-[10px] font-medium text-white/70 hover:text-[#FAFAFA] transition-colors duration-200 gap-1.5 border border-[rgba(204,0,1,0.2)] hover:border-[rgba(204,0,1,0.4)]"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(SourceReferences);
