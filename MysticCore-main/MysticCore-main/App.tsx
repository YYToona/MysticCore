import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInfo, AppStage, AnalysisPayload, DrawnCard, AstrologyChart, Language } from './types';
import { UI_TEXT } from './constants';
import { calculateChart } from './services/mockAstrologyBackend';
import { getInterpretation } from './services/geminiService';
import TarotDeck from './components/TarotDeck';
import StarChart from './components/StarChart';
import { Moon, Star, Send, Loader2, Sparkles, RefreshCcw, Languages } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<AppStage>('intro');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    question: ''
  });
  const [chart, setChart] = useState<AstrologyChart | null>(null);
  const [tarotResult, setTarotResult] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<string>('');

  const t = UI_TEXT[lang];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const submitUserInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage('astrology-input'); 
    
    // Calls the service which attempts the Python backend first, then falls back to simulation
    const chartData = await calculateChart(userInfo.birthDate, userInfo.birthTime, userInfo.birthPlace);
    setChart(chartData);
    setStage('tarot-reading');
  };

  const handleTarotComplete = async (cards: DrawnCard[]) => {
    setTarotResult(cards);
    setStage('analyzing');
    
    if (!chart) return;

    // Prepare Payload with localized data
    const payload: AnalysisPayload = {
      language: lang,
      user_info: { name: userInfo.name, question: userInfo.question },
      tarot_spread: {
        past: { 
            card_name: cards[0].card.name[lang], 
            position: cards[0].orientation, 
            meaning_keywords: cards[0].orientation === 'Upright' ? cards[0].card.keywords_upright[lang] : cards[0].card.keywords_reversed[lang] 
        },
        present: { 
            card_name: cards[1].card.name[lang], 
            position: cards[1].orientation, 
            meaning_keywords: cards[1].orientation === 'Upright' ? cards[1].card.keywords_upright[lang] : cards[1].card.keywords_reversed[lang] 
        },
        future: { 
            card_name: cards[2].card.name[lang], 
            position: cards[2].orientation, 
            meaning_keywords: cards[2].orientation === 'Upright' ? cards[2].card.keywords_upright[lang] : cards[2].card.keywords_reversed[lang] 
        }
      },
      astrology_chart: chart
    };

    const text = await getInterpretation(payload);
    setInterpretation(text);
    setStage('result');
  };

  const resetApp = () => {
    setStage('intro');
    setInterpretation('');
    setTarotResult([]);
    setChart(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-slate-100 selection:bg-amber-500/30 font-sans">
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-amber-500/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <Moon className="text-amber-400" />
            <h1 className="text-2xl mystic-font tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-200">
                {t.title}
            </h1>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={toggleLanguage} 
                className="p-2 rounded-full hover:bg-slate-800 transition-colors border border-slate-700/50 flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400"
            >
                <Languages size={16} />
                {lang === 'en' ? 'EN' : '中文'}
            </button>
            {stage === 'result' && (
                <button onClick={resetApp} className="text-sm text-amber-200/70 hover:text-amber-200 flex items-center gap-1">
                    <RefreshCcw size={14} /> {t.newReading}
                </button>
            )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10 min-h-[85vh] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
            
            {/* STAGE: INTRO / FORM */}
            {stage === 'intro' && (
                <motion.div 
                    key="intro"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-lg bg-slate-950/60 p-8 rounded-2xl border border-amber-500/20 backdrop-blur-sm shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl mystic-font text-amber-100 mb-2">{t.subtitle}</h2>
                        <p className="text-slate-400 font-light">{t.intro}</p>
                    </div>
                    <form onSubmit={submitUserInfo} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-widest text-slate-500">{t.nameLabel}</label>
                            <input required name="name" value={userInfo.name} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 focus:border-amber-500 focus:outline-none transition-colors" placeholder={t.placeholderName} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest text-slate-500">{t.dateLabel}</label>
                                <input required type="date" name="birthDate" value={userInfo.birthDate} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 focus:border-amber-500 focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest text-slate-500">{t.timeLabel}</label>
                                <input required type="time" name="birthTime" value={userInfo.birthTime} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 focus:border-amber-500 focus:outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-widest text-slate-500">{t.questionLabel}</label>
                            <input required name="question" value={userInfo.question} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 focus:border-amber-500 focus:outline-none" placeholder={t.placeholderQuestion} />
                        </div>
                        <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-amber-700 to-purple-800 rounded-lg text-white font-bold tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex justify-center items-center gap-2">
                           <Star size={16} fill="white" /> {t.submitBtn}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* STAGE: ASTROLOGY VIZ */}
            {stage === 'astrology-input' && (
                <motion.div
                    key="astro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                >
                   <Loader2 className="animate-spin text-amber-500 w-12 h-12 mb-4" />
                   <p className="mystic-font text-amber-200">{t.aligning}</p>
                </motion.div>
            )}

            {/* STAGE: TAROT READING */}
            {stage === 'tarot-reading' && (
                <motion.div
                    key="tarot"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-4xl"
                >
                    <TarotDeck onComplete={handleTarotComplete} lang={lang} />
                </motion.div>
            )}

             {/* STAGE: ANALYZING - Now shows the drawn cards */}
             {stage === 'analyzing' && (
                <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center w-full max-w-3xl"
                >
                     <h2 className="text-2xl mystic-font text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-300 mb-8 animate-pulse text-center">{t.communing}</h2>
                     
                     {/* Show cards while waiting */}
                     <div className="flex justify-center gap-6 mb-8 perspective-1000">
                        {tarotResult.map((card, idx) => (
                           <motion.div 
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.2 }}
                              className="w-24 h-40 md:w-32 md:h-52 rounded-lg border border-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.2)] bg-cover bg-center"
                              style={{ 
                                  backgroundImage: `url(${card.card.image})`,
                                  transform: card.orientation === 'Reversed' ? 'rotate(180deg)' : 'none'
                              }}
                           />
                        ))}
                     </div>

                     <div className="flex items-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin text-purple-400" size={20} />
                        <p className="text-sm font-light tracking-wide">{t.synthesizing}</p>
                     </div>
                </motion.div>
            )}

            {/* STAGE: RESULT */}
            {stage === 'result' && chart && (
                <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl"
                >
                    {/* Left: Data Visualization */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-amber-500/20 backdrop-blur-md">
                            <h3 className="mystic-font text-amber-400 text-center mb-4 border-b border-amber-500/20 pb-2">{t.natalTitle}</h3>
                            <StarChart chart={chart} lang={lang} />
                            <div className="mt-4 text-xs text-center text-slate-500 font-mono">
                                {t.sun}: {chart.sun.deg}° {chart.sun.sign}<br/>
                                {t.moon}: {chart.moon.deg}° {chart.moon.sign}<br/>
                                {t.asc}: {chart.rising.deg}° {chart.rising.sign}
                            </div>
                        </div>

                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-amber-500/20 backdrop-blur-md">
                             <h3 className="mystic-font text-purple-400 text-center mb-4 border-b border-purple-500/20 pb-2">{t.spreadTitle}</h3>
                             <div className="space-y-4">
                                {tarotResult.map((d, i) => (
                                    <div 
                                        key={i} 
                                        className="group relative flex items-center gap-3 p-2 hover:bg-slate-900/50 rounded transition-all duration-300 cursor-default overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                                        <div 
                                            className="w-12 h-20 bg-cover bg-center rounded border border-slate-600 shadow-sm shrink-0 group-hover:border-amber-400/50 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
                                            style={{ 
                                                backgroundImage: `url(${d.card.image})`,
                                                transform: d.orientation === 'Reversed' ? 'rotate(180deg)' : 'none'
                                            }}
                                        >
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-amber-100 font-bold text-sm mystic-font group-hover:text-amber-300 transition-colors">{d.card.name[lang]}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                                                {i === 0 ? t.cardPast : i === 1 ? t.cardPresent : t.cardFuture} • {d.orientation === 'Reversed' ? t.reversed : t.upright}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>

                    {/* Right: Interpretation */}
                    <div className="lg:col-span-2 bg-slate-950/80 p-8 rounded-2xl border border-amber-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Send size={120} />
                        </div>
                        <h2 className="text-3xl mystic-font text-amber-100 mb-6 flex items-center gap-3">
                            <span className="text-purple-400">✦</span> {t.oracleTitle}
                        </h2>
                        
                        <div className="prose prose-invert prose-amber max-w-none leading-relaxed font-light grow">
                             <ReactMarkdown>{interpretation}</ReactMarkdown>
                        </div>
                    </div>
                </motion.div>
            )}

        </AnimatePresence>
      </main>
    </div>
  );
}
