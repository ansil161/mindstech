import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useChat from '../../hooks/useChat';

const FORM_WIDTH = 360;
const FORM_HEIGHT = 200;

/**
 * Decorative animated gradient orb, ported from the supplied design.
 * Purely presentational — all color/motion driven by CSS custom properties
 * set here and consumed by the `.color-orb` rules in src/index.css (moved
 * out of the source's `<style jsx>`, which Vite doesn't support).
 */
const ColorOrb = ({ dimension = '192px', className, tones, spinDuration = 20 }) => {
  const fallbackTones = {
    base: 'oklch(95% 0.02 264.695)',
    accent1: 'oklch(75% 0.15 350)',
    accent2: 'oklch(80% 0.12 200)',
    accent3: 'oklch(78% 0.14 280)',
  };
  const palette = { ...fallbackTones, ...tones };
  const dimValue = parseInt(dimension.replace('px', ''), 10);

  const blurStrength = dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4);
  const contrastStrength = dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5);
  const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1);
  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2);
  const maskRadius = dimValue < 30 ? '0%' : dimValue < 50 ? '5%' : dimValue < 100 ? '15%' : '25%';
  const adjustedContrast =
    dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength;

  return (
    <div
      className={cn('color-orb', maskRadius === '0%' && 'color-orb--no-mask', className)}
      style={{
        width: dimension,
        height: dimension,
        '--base': palette.base,
        '--accent1': palette.accent1,
        '--accent2': palette.accent2,
        '--accent3': palette.accent3,
        '--spin-duration': `${spinDuration}s`,
        '--blur': `${blurStrength}px`,
        '--contrast': adjustedContrast,
        '--dot': `${pixelDot}px`,
        '--shadow': `${shadowRange}px`,
        '--mask': maskRadius,
      }}
    />
  );
};

const FormContext = React.createContext({});
const useFormContext = () => React.useContext(FormContext);

/**
 * Floating "Ask AI" launcher — morphs from a small pill into a compact
 * single-question panel. Purely a launcher: submitting a question fires the
 * real sendMessage() from ChatContext and hands off to the existing
 * ChatWindow for the actual multi-turn conversation (untouched). Rendered
 * only while the chat window is closed — see ChatWidget.jsx.
 */
export default function AskAIPanel() {
  const { sendMessage, toggleChat, isOpen } = useChat();

  const wrapperRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  const [showForm, setShowForm] = React.useState(false);
  const [text, setText] = React.useState('');

  const triggerClose = React.useCallback(() => {
    setShowForm(false);
    textareaRef.current?.blur();
  }, []);

  const triggerOpen = React.useCallback(() => {
    setShowForm(true);
    setTimeout(() => textareaRef.current?.focus());
  }, []);

  React.useEffect(() => {
    function clickOutsideHandler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target) && showForm) {
        triggerClose();
      }
    }
    document.addEventListener('mousedown', clickOutsideHandler);
    return () => document.removeEventListener('mousedown', clickOutsideHandler);
  }, [showForm, triggerClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    sendMessage(value);
    if (!isOpen) toggleChat();
    setText('');
    triggerClose();
  };

  const handleKeys = (e) => {
    if (e.key === 'Escape') triggerClose();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const ctx = React.useMemo(
    () => ({ showForm, triggerOpen, triggerClose }),
    [showForm, triggerOpen, triggerClose]
  );

  return (
    <div className="ask-ai-panel fixed bottom-6 right-6 max-sm:bottom-5 max-sm:right-4" style={{ zIndex: 99999 }}>
      <motion.div
        ref={wrapperRef}
        className="relative z-[1] flex flex-col items-center overflow-hidden border border-[var(--line-soft)] bg-[var(--ink-2)]"
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        initial={false}
        animate={{
          width: showForm ? FORM_WIDTH : 'auto',
          height: showForm ? FORM_HEIGHT : 44,
          borderRadius: showForm ? 14 : 20,
        }}
        transition={{
          type: 'spring',
          stiffness: 550,
          damping: 45,
          mass: 0.7,
          delay: showForm ? 0 : 0.08,
        }}
      >
        <FormContext.Provider value={ctx}>
          <DockBar />
          <InputForm
            ref={textareaRef}
            text={text}
            setText={setText}
            onSubmit={handleSubmit}
            onKeyDown={handleKeys}
          />
        </FormContext.Provider>
      </motion.div>
    </div>
  );
}

function DockBar() {
  const { t } = useTranslation();
  const { showForm, triggerOpen } = useFormContext();

  return (
    <footer className="mt-auto flex h-[44px] items-center justify-center whitespace-nowrap select-none">
      <div className="flex items-center justify-center gap-2 px-3 max-sm:h-10 max-sm:px-2">
        <div className="flex w-fit items-center gap-2">
          <AnimatePresence mode="wait">
            {!showForm && (
              <motion.div
                key="orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ColorOrb dimension="24px" tones={{ base: 'oklch(22.64% 0 0)' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="button"
          className={cn(
            'flex h-fit flex-1 justify-end rounded-full px-2 !py-0.5',
            showForm && 'pointer-events-none opacity-0'
          )}
          variant="ghost"
          onClick={triggerOpen}
          tabIndex={showForm ? -1 : 0}
        >
          <span className="truncate">{t('chat.launcher.label', 'Ask AI')}</span>
        </Button>
      </div>
    </footer>
  );
}

const InputForm = React.forwardRef(({ text, setText, onSubmit, onKeyDown }, ref) => {
  const { t } = useTranslation();
  const { showForm } = useFormContext();
  const btnRef = React.useRef(null);

  return (
    <form
      onSubmit={onSubmit}
      className="absolute bottom-0"
      style={{ width: FORM_WIDTH, height: FORM_HEIGHT, pointerEvents: showForm ? 'all' : 'none' }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 550, damping: 45, mass: 0.7 }}
            className="flex h-full flex-col p-1"
          >
            <div className="flex justify-between py-1">
              <p className="text-white z-[2] ml-[38px] flex items-center gap-[6px] select-none text-sm">
                {t('chat.launcher.panel_label', 'Ask AI')}
              </p>
              <button
                type="submit"
                ref={btnRef}
                className="text-white right-4 mt-1 flex -translate-y-[3px] cursor-pointer items-center justify-center gap-1 rounded-[12px] bg-transparent pr-1 text-center select-none"
                aria-label={t('chat.launcher.label', 'Ask AI')}
              >
                <KeyHint>⌘</KeyHint>
                <KeyHint className="w-fit">Enter</KeyHint>
              </button>
            </div>
            <textarea
              ref={ref}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('chat.launcher.placeholder', 'Ask me anything...')}
              name="message"
              className="h-full w-full resize-none scroll-py-2 rounded-md p-4 text-white placeholder-white/40 outline-0"
              required
              onKeyDown={onKeyDown}
              spellCheck={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-3"
          >
            <ColorOrb dimension="24px" tones={{ base: 'oklch(22.64% 0 0)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
});
InputForm.displayName = 'InputForm';

function KeyHint({ children, className }) {
  return (
    <kbd
      className={cn(
        'text-white flex h-6 w-fit items-center justify-center rounded-sm border border-[var(--line-soft)] px-[6px] font-sans text-xs',
        className
      )}
    >
      {children}
    </kbd>
  )
}
