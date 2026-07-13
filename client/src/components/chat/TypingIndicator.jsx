import React from 'react';
import { motion } from 'framer-motion';
import SupportAvatar from './SupportAvatar';

const dotVariants = {
  initial: {
    y: '0%',
  },
  animate: {
    y: '100%',
  },
};

const dotTransition = (delay) => ({
  duration: 0.5,
  repeat: Infinity,
  repeatType: 'reverse',
  ease: 'easeInOut',
  delay: delay,
  y: {
    duration: 0.4,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
    delay: delay
  }
});

const TypingIndicator = () => {
  return (
    <div className="flex items-start space-x-3 w-full select-none">
      <SupportAvatar size={30} showOnlineBadge={false} className="mt-1" />
      <div className="flex flex-col">
        <motion.div
          className="flex items-center space-x-2 px-4 py-3 rounded-[18px] rounded-tl-[4px] bg-[#1A1A1E] border border-white/5 shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-[13px] text-white/60 font-medium tracking-wide font-sans">
            Support Agent is typing...
          </span>

          <div className="flex items-center space-x-1 ml-1 pt-1">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#E30613]"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={dotTransition(0)}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#E30613]"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={dotTransition(0.15)}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#E30613]"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={dotTransition(0.3)}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(TypingIndicator);
