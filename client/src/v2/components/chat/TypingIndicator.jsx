import React from 'react';
import { motion } from 'framer-motion';
import SupportAvatar from './SupportAvatar';

const dotVariants = {
  initial: {
    y: '0%',
  },
  animate: {
    y: '80%',
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
    <div className="flex items-start space-x-3.5 w-full select-none">
      {/* Bot avatar visible while typing */}
      <SupportAvatar size={32} showOnlineBadge={false} className="mt-0.5" />
      <div className="flex flex-col">
        <motion.div
          className="flex items-center space-x-2 px-4 py-3 rounded-[20px] rounded-tl-[4px] bg-[#111216] border border-[rgba(255,255,255,0.08)] shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-[13px] text-white/70 font-sans font-medium">
            AI Assistant is typing
          </span>

          <div className="flex items-center space-x-1.5 ml-1 pt-1">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#CC0001]"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={dotTransition(0)}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#CC0001]"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={dotTransition(0.15)}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#CC0001]"
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
