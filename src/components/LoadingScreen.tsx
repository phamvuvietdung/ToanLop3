import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, BrainCircuit } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center my-auto">
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-40 h-40 mb-8"
      >
        <div className="absolute inset-0 bg-sky-300 rounded-full blur-2xl opacity-50 animate-pulse" />
        <div className="relative text-8xl md:text-9xl">🐻</div>
        
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-4 -right-4"
        >
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-amber-400 fill-amber-400" />
        </motion.div>
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -bottom-2 -left-2 bg-white p-2 md:p-3 rounded-full shadow-lg"
        >
          <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-sky-500" />
        </motion.div>
      </motion.div>
      
      <h2 className="text-2xl md:text-3xl font-black text-sky-700 mb-3 tracking-wide drop-shadow-sm">
        Chú Gấu Đang Đọc Sách...
      </h2>
      <p className="text-base md:text-lg font-bold text-sky-600/80 animate-pulse">
        Việc này có thể mất vài giây, bé chờ một chút nhé! 📖✨
      </p>
    </div>
  );
};
