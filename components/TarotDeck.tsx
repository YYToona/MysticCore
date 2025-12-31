import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FULL_DECK_VISUAL, TAROT_DECK, UI_TEXT } from '../constants';
import { DrawnCard, TarotPosition, CardOrientation, Language } from '../types';
import { Sparkles, Dna, ArrowRight } from 'lucide-react';

interface TarotDeckProps {
  onComplete: (cards: DrawnCard[]) => void;
  lang: Language;
}

const TarotDeck: React.FC<TarotDeckProps> = ({ onComplete, lang }) => {
  const [stage, setStage] = useState<'intro' | 'shuffling' | 'picking' | 'revealing'>('intro');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  // Track revealed status for each of the 3 cards individually
  const [revealedStatus, setRevealedStatus] = useState<boolean[]>([false, false, false]);

  const t = UI_TEXT[lang];

  // Haptic feedback helper
  const vibrate = (ms: number = 20) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const startReading = () => {
    vibrate(50);
    setStage('shuffling');
    setTimeout(() => {
      setStage('picking');
    }, 2500);
  };

  const handleCardClick = (index: number) => {
    if (stage !== 'picking') return;

    if (selectedIndices.length < 3 && !selectedIndices.includes(index)) {
      vibrate(30); // Tactile feedback on select
      const newSelection = [...selectedIndices, index];
      setSelectedIndices(newSelection);
      
      if (newSelection.length === 3) {
        setTimeout(() => {
          prepareReveal(newSelection);
        }, 500);
      }
    }
  };

  const prepareReveal = (indices: number[]) => {
    // Generate the actual card data
    const shuffledDeck = [...TAROT_DECK].sort(() => 0.5 - Math.random());
    const cards: DrawnCard[] = indices.map((_, i) => {
       const card = shuffledDeck[i];
       return {
        card: card,
        position: i === 0 ? TarotPosition.PAST : i === 1 ? TarotPosition.PRESENT : TarotPosition.FUTURE,
        orientation: Math.random() > 0.3 ? CardOrientation.UPRIGHT : CardOrientation.REVERSED
       };
    });
    
    setDrawnCards(cards);
    setStage('revealing');
  };

  const autoSelect = () => {
    vibrate(50);
    // Crystal Ball mode
    const randomIndices = [5, 15, 25]; 
    setSelectedIndices(randomIndices);
    setTimeout(() => prepareReveal(randomIndices), 1500);
  };

  const revealCard = (index: number) => {
    if (!revealedStatus[index]) {
        vibrate(40); // Tactile feedback on reveal
        const newStatus = [...revealedStatus];
        newStatus[index] = true;
        setRevealedStatus(newStatus);
    }
  };

  const allRevealed = revealedStatus.every(s => s);

  // Common Card Back Style for reuse to ensure consistency
  const cardBackStyle = {
      backgroundColor: '#0f172a', // Slate 900 dark
      backgroundImage: `
        repeating-linear-gradient(
            45deg,
            #1e293b 0px,
            #1e293b 10px,
            #0f172a 10px,
            #0f172a 11px
        ),
        radial-gradient(circle at center, #334155 0%, transparent 70%)
      `,
      boxShadow: 'inset 0 0 10px #000'
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative min-h-[600px]">
      
      {stage === 'intro' && (
        <div className="flex flex-col gap-6 items-center z-20">
            <h2 className="text-3xl font-light mystic-font text-amber-200">{t.deckReady}</h2>
            <div className="flex gap-4">
                <button 
                    onClick={startReading}
                    className="px-8 py-3 border border-amber-500/50 bg-slate-900/80 hover:bg-amber-900/30 text-amber-100 rounded-full transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
                >
                    <Sparkles size={18} /> {t.spreadBtn}
                </button>
                <button 
                    onClick={() => { setStage('shuffling'); setTimeout(autoSelect, 2000); }}
                    className="px-8 py-3 border border-purple-500/50 bg-slate-900/80 hover:bg-purple-900/30 text-purple-100 rounded-full transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
                >
                    <Dna size={18} /> {t.autoBtn}
                </button>
            </div>
        </div>
      )}

      {stage === 'shuffling' && (
        <motion.div 
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="w-48 h-72 rounded-xl border-4 border-amber-600/50 shadow-[0_0_50px_rgba(217,119,6,0.2)] flex items-center justify-center z-20"
            style={cardBackStyle}
        >
            <div className="text-amber-500/80 text-6xl mystic-font drop-shadow-lg">☾</div>
        </motion.div>
      )}

      {/* PICKING STAGE: Fanned Cards */}
      {stage === 'picking' && (
        <div className="relative w-full h-[400px] flex justify-center items-end perspective-1000 overflow-visible z-20">
            {FULL_DECK_VISUAL.map((card, i) => {
                const totalCardsDisplayed = 40; 
                if (i >= totalCardsDisplayed) return null;
                
                const angle = (i - totalCardsDisplayed / 2) * 2;
                const x = (i - totalCardsDisplayed / 2) * 12;
                const isSelected = selectedIndices.includes(i);

                return (
                    <motion.div
                        key={i}
                        layoutId={`card-${i}`} 
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ 
                            y: isSelected ? -50 : 0, 
                            x: x, 
                            rotate: angle, 
                            opacity: 1,
                            zIndex: isSelected ? 50 : i 
                        }}
                        whileHover={{ y: -30, zIndex: 40 }}
                        onClick={() => handleCardClick(i)}
                        className={`absolute w-32 h-52 rounded-lg cursor-pointer origin-bottom transition-all duration-300
                            ${isSelected 
                                ? 'border-2 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.8)]' 
                                : 'border border-slate-600 hover:border-amber-400'
                            }
                        `}
                        style={{ 
                            transformOrigin: '50% 120%',
                            ...cardBackStyle // Use robust solid texture
                        }}
                    >
                         {/* Card decoration - Solid Gold-ish Foil effect */}
                         <div className="w-full h-full flex items-center justify-center border border-white/5 m-1 rounded opacity-100">
                            <span className="text-2xl text-amber-500/80 drop-shadow-md">✦</span>
                         </div>
                    </motion.div>
                );
            })}
        </div>
      )}

      {/* REVEALING STAGE: 3 Cards Center */}
      {stage === 'revealing' && (
          <div className="flex flex-col items-center gap-12 z-30 w-full max-w-4xl">
              <h3 className="text-xl mystic-font text-amber-200 animate-pulse">{t.revealBtn}</h3>
              <div className="flex justify-center gap-4 md:gap-8 w-full perspective-1000">
                {drawnCards.map((drawn, index) => {
                    const isRevealed = revealedStatus[index];
                    return (
                        <motion.div
                            key={index}
                            initial={{ y: 50, opacity: 0, rotateY: 0 }}
                            animate={{ 
                                y: 0, 
                                opacity: 1,
                                rotateY: isRevealed ? 180 : 0 
                            }}
                            transition={{ 
                                y: { duration: 0.5, delay: index * 0.2 },
                                opacity: { duration: 0.5, delay: index * 0.2 },
                                rotateY: { duration: 0.8, ease: "easeInOut" }
                            }}
                            onClick={() => revealCard(index)}
                            className="relative w-32 h-52 md:w-48 md:h-80 cursor-pointer preserve-3d"
                        >
                            {/* Card Back */}
                            <div 
                                className="absolute w-full h-full backface-hidden rounded-xl border-2 border-amber-600/40 shadow-2xl"
                                style={cardBackStyle}
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-4xl text-amber-500/80 drop-shadow-md">✦</span>
                                </div>
                            </div>

                            {/* Card Front */}
                            <div 
                                className="absolute w-full h-full backface-hidden rounded-xl border border-amber-500/50 shadow-[0_0_30px_rgba(251,191,36,0.2)] bg-slate-950 overflow-hidden rotate-y-180"
                            >
                                <div 
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ 
                                        backgroundImage: `url(${drawn.card.image})`,
                                        transform: drawn.orientation === 'Reversed' ? 'rotate(180deg)' : 'none'
                                    }}
                                />
                                {drawn.orientation === 'Reversed' && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="bg-black/70 text-white px-2 py-1 text-xs rounded uppercase tracking-wider border border-white/20">
                                            {t.reversed}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
              </div>

              <div className="h-16 flex items-center justify-center">
                  {allRevealed ? (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => onComplete(drawnCards)}
                        className="px-8 py-3 bg-gradient-to-r from-amber-600 to-purple-700 text-white rounded-full font-bold tracking-widest hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-purple-900/50"
                      >
                          {t.proceedBtn} <ArrowRight size={18} />
                      </motion.button>
                  ) : (
                      <p className="text-slate-400 text-sm animate-pulse">{t.tapToReveal}</p>
                  )}
              </div>
          </div>
      )}
      
      {stage === 'picking' && (
          <div className="mt-8 text-slate-400 font-light">
              {t.selectPrompt.replace('{count}', (3 - selectedIndices.length).toString())}
          </div>
      )}
    </div>
  );
};

export default TarotDeck;