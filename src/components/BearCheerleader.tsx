import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BearState } from '../types';
import { Sparkles, Lightbulb, PartyPopper, Heart } from 'lucide-react';

interface BearCheerleaderProps {
  state: BearState;
  message: string;
}

export const BearCheerleader: React.FC<BearCheerleaderProps> = ({ state, message }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-5 my-2">
      {/* Cartoon Bear Avatar */}
      <div className="relative flex-shrink-0">
        <motion.div
          animate={
            state === 'celebrate' || state === 'happy'
              ? { y: [0, -14, 0, -10, 0], rotate: [0, -4, 4, -2, 0] }
              : state === 'thinking'
              ? { rotate: [-2, 2, -2], y: [0, -2, 0] }
              : { y: [0, -5, 0] }
          }
          transition={{
            duration: state === 'celebrate' ? 0.7 : 2.5,
            repeat: state === 'celebrate' ? 2 : Infinity,
            ease: 'easeInOut'
          }}
          className="relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center"
        >
          {/* Reaction icons floating */}
          <AnimatePresence>
            {(state === 'celebrate' || state === 'happy') && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 10 }}
                  animate={{ opacity: 1, scale: 1.2, y: -25 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute -top-3 -right-2 text-amber-400 bg-white p-1 rounded-full shadow-md z-20"
                >
                  <PartyPopper className="w-6 h-6 text-amber-500" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-1 -left-2 text-pink-500 bg-white p-1 rounded-full shadow-md z-20"
                >
                  <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
              </>
            )}

            {state === 'thinking' && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: [1, 1.2, 1], y: -20 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="absolute -top-4 -right-1 bg-amber-100 p-1.5 rounded-full shadow-lg border-2 border-amber-300 z-20"
              >
                <Lightbulb className="w-6 h-6 text-amber-500 fill-amber-300 animate-pulse" />
              </motion.div>
            )}

            {state === 'normal' && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 text-red-400 bg-white p-1 rounded-full shadow-sm z-20"
              >
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* SVG Teddy Bear */}
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full drop-shadow-lg filter"
          >
            <defs>
              <linearGradient id="bearBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="bearEarInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#FCD34D" />
              </linearGradient>
              <linearGradient id="bearCheeks" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#F43F5E" />
              </linearGradient>
            </defs>

            {/* Left Ear */}
            <circle cx="28" cy="28" r="18" fill="url(#bearBodyGrad)" stroke="#B45309" strokeWidth="2.5" />
            <circle cx="28" cy="28" r="10" fill="url(#bearEarInner)" />

            {/* Right Ear */}
            <circle cx="92" cy="28" r="18" fill="url(#bearBodyGrad)" stroke="#B45309" strokeWidth="2.5" />
            <circle cx="92" cy="28" r="10" fill="url(#bearEarInner)" />

            {/* Bear Head */}
            <circle cx="60" cy="62" r="44" fill="url(#bearBodyGrad)" stroke="#B45309" strokeWidth="3" />

            {/* Cheerleader Headband / Ribbon */}
            <path
              d="M 22 48 Q 60 40 98 48 Q 60 34 22 48 Z"
              fill="#0284C7"
              stroke="#0369A1"
              strokeWidth="2"
            />
            {/* Star on headband */}
            <polygon
              points="60,37 62,42 67,42 63,45 65,50 60,47 55,50 57,45 53,42 58,42"
              fill="#FDE047"
            />

            {/* Blush Cheeks */}
            <ellipse cx="32" cy="72" rx="7" ry="5" fill="url(#bearCheeks)" opacity="0.8" />
            <ellipse cx="88" cy="72" rx="7" ry="5" fill="url(#bearCheeks)" opacity="0.8" />

            {/* Snout */}
            <ellipse cx="60" cy="76" rx="19" ry="15" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />

            {/* Cute Nose */}
            <path
              d="M 54 70 C 54 68, 66 68, 66 70 C 66 74, 60 77, 60 77 C 60 77, 54 74, 54 70 Z"
              fill="#78350F"
            />

            {/* Mouth / Smile depending on state */}
            {state === 'celebrate' || state === 'happy' ? (
              // Big Happy Open Smile
              <path
                d="M 50 78 Q 60 92 70 78 Z"
                fill="#EF4444"
                stroke="#78350F"
                strokeWidth="2"
              />
            ) : state === 'thinking' ? (
              // Puzzled slightly wavy mouth
              <path
                d="M 52 82 Q 57 79 62 82 Q 67 85 70 82"
                fill="none"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              // Friendly gentle smile
              <path
                d="M 52 78 Q 60 86 68 78"
                fill="none"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Eyes */}
            {state === 'celebrate' || state === 'happy' ? (
              // Joyful curved laughing eyes: ^ ^
              <>
                <path
                  d="M 38 60 Q 44 51 50 60"
                  fill="none"
                  stroke="#78350F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 70 60 Q 76 51 82 60"
                  fill="none"
                  stroke="#78350F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </>
            ) : state === 'thinking' ? (
              // Looking up and thinking
              <>
                <circle cx="44" cy="56" r="5" fill="#78350F" />
                <circle cx="46" cy="54" r="2" fill="#FFFFFF" />
                <circle cx="76" cy="56" r="5" fill="#78350F" />
                <circle cx="78" cy="54" r="2" fill="#FFFFFF" />
                {/* Wondering eyebrows */}
                <path d="M 40 48 Q 45 45 50 49" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 70 49 Q 75 44 80 47" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              // Big round shiny friendly eyes
              <>
                <circle cx="44" cy="58" r="5.5" fill="#78350F" />
                <circle cx="42" cy="56" r="2" fill="#FFFFFF" />
                <circle cx="76" cy="58" r="5.5" fill="#78350F" />
                <circle cx="74" cy="56" r="2" fill="#FFFFFF" />
              </>
            )}

            {/* Paws position based on state */}
            {state === 'thinking' ? (
              // One paw touching chin/head
              <g>
                <circle cx="88" cy="78" r="11" fill="url(#bearBodyGrad)" stroke="#B45309" strokeWidth="2" />
                <circle cx="88" cy="78" r="5" fill="#FEF3C7" />
              </g>
            ) : state === 'celebrate' || state === 'happy' ? (
              // Both paws raised up cheering with cheerleader pom-poms
              <g>
                <circle cx="16" cy="46" r="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                <circle cx="104" cy="46" r="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                <path d="M 10 40 L 22 52 M 22 40 L 10 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M 98 40 L 110 52 M 110 40 L 98 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </g>
            ) : (
              // Friendly waving paw
              <g>
                <circle cx="102" cy="72" r="9" fill="url(#bearBodyGrad)" stroke="#B45309" strokeWidth="2" />
                <circle cx="102" cy="72" r="4.5" fill="#FEF3C7" />
              </g>
            )}
          </svg>
        </motion.div>
      </div>

      {/* Speech Bubble */}
      <motion.div
        key={message}
        initial={{ opacity: 0, scale: 0.92, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative px-5 py-3.5 rounded-3xl max-w-md shadow-md border-2 text-left transition-colors duration-300 ${
          state === 'celebrate' || state === 'happy'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-4 ring-emerald-100'
            : state === 'thinking'
            ? 'bg-amber-50 border-amber-300 text-amber-900 ring-4 ring-amber-100'
            : 'bg-white border-sky-200 text-slate-800 ring-4 ring-sky-50'
        }`}
      >
        {/* Tail pointing towards the bear */}
        <div
          className={`hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-[12px] ${
            state === 'celebrate' || state === 'happy'
              ? 'border-r-emerald-300'
              : state === 'thinking'
              ? 'border-r-amber-300'
              : 'border-r-sky-200'
          }`}
        />
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm md:text-base text-sky-600 uppercase tracking-wide flex items-center gap-1">
            <span>🐻 Chú Gấu Cổ Vũ:</span>
          </span>
        </div>
        <p className="mt-1 text-base md:text-lg font-bold leading-relaxed">
          {message}
        </p>
      </motion.div>
    </div>
  );
};
