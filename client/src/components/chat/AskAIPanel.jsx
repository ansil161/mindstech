import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useChat from '../../hooks/useChat';

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

/**
 * Floating "Ask AI" launcher — a single pill button. Clicking it opens the
 * real ChatWindow directly via ChatContext's toggleChat(); no intermediate
 * text box. Rendered only while the chat window is closed — see
 * ChatWidget.jsx.
 */
export default function AskAIPanel() {
  const { t } = useTranslation();
  const { toggleChat } = useChat();

  return (
    <div className="ask-ai-panel fixed bottom-6 right-6 max-sm:bottom-5 max-sm:right-4" style={{ zIndex: 99999 }}>
      <motion.div
        className="relative z-[1] flex h-[44px] items-center overflow-hidden rounded-full border border-[var(--line-soft)] bg-[var(--ink-2)]"
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        initial={false}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 550, damping: 45, mass: 0.7 }}
      >
        <Button
          type="button"
          onClick={toggleChat}
          variant="ghost"
          className={cn('flex h-full items-center gap-2 rounded-full px-3 max-sm:h-10 max-sm:px-2')}
        >
          <ColorOrb dimension="24px" tones={{ base: 'oklch(22.64% 0 0)' }} />
          <span className="truncate">{t('chat.launcher.label', 'Ask AI')}</span>
        </Button>
      </motion.div>
    </div>
  );
}
