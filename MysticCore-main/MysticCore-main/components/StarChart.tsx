import React from 'react';
import { motion } from 'framer-motion';
import { AstrologyChart, PlanetPosition, Language } from '../types';
import { ZODIAC_SIGNS, UI_TEXT } from '../constants';

interface StarChartProps {
  chart: AstrologyChart;
  lang: Language;
}

const StarChart: React.FC<StarChartProps> = ({ chart, lang }) => {
  const t = UI_TEXT[lang];

  // Helper: Convert Zodiac Sign + Degree to absolute 0-360 degree on the wheel.
  // Aries 0 starts at 0.
  const getAbsoluteDegree = (sign: string, deg: number) => {
    const signIndex = ZODIAC_SIGNS.indexOf(sign);
    return (signIndex * 30) + deg;
  };

  // Logic: In Western Astrology, the Ascendant (Rising Sign) is traditionally placed 
  // at the 9 o'clock position (180 degrees in SVG coordinate terms if 0 is 3 o'clock).
  // However, easier math is: Rising Degree becomes the "Anchor" at 180deg (Left).
  // We rotate the entire Zodiac wheel so that the Rising Sign degree is at the left.
  const risingAbsDeg = getAbsoluteDegree(chart.rising.sign, chart.rising.deg);
  
  // Calculate rotation needed:
  // If Rising is at `risingAbsDeg` (e.g. 90deg Cancer), we want that point to be at 180deg (Left).
  // So we rotate by: 180 - risingAbsDeg.
  const wheelRotation = 180 - risingAbsDeg;

  const PlanetMarker = ({ planet, label, radius, color }: { planet: PlanetPosition, label: string, radius: number, color: string }) => {
    const absDeg = getAbsoluteDegree(planet.sign, planet.deg);
    // Apply the wheel rotation to the planet's position
    const displayAngle = absDeg + wheelRotation;
    const radians = (displayAngle * Math.PI) / 180;
    
    // SVG Center (200,200)
    const x = 200 + radius * Math.cos(radians);
    const y = 200 + radius * Math.sin(radians);

    return (
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <circle cx={x} cy={y} r="4" fill={color} className="shadow-lg shadow-amber-500 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
        <line x1="200" y1="200" x2={x} y2={y} stroke={color} strokeWidth="1" strokeOpacity="0.3" />
        {/* Label Position adjustment to avoid overlap */}
        <text 
            x={x + (x > 200 ? 10 : -10)} 
            y={y + (y > 200 ? 10 : -5)} 
            fill={color} 
            fontSize="10" 
            fontWeight="bold" 
            fontFamily="Cinzel, serif"
            textAnchor={x > 200 ? "start" : "end"}
        >
          {label} ({planet.sign})
        </text>
      </motion.g>
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
            <radialGradient id="wheelGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0" />
                <stop offset="90%" stopColor="#1e293b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
            </radialGradient>
        </defs>

        {/* Outer Zodiac Ring (Rotated based on Rising Sign) */}
        <motion.g 
            initial={{ rotate: wheelRotation - 45, opacity: 0 }}
            animate={{ rotate: wheelRotation, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{ originX: "200px", originY: "200px" }}
        >
            <circle cx="200" cy="200" r="190" fill="url(#wheelGradient)" stroke="#64748b" strokeWidth="1" strokeOpacity="0.3" />
            
            {/* House/Sign Dividers */}
            {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30) * Math.PI / 180;
                const x1 = 200 + 150 * Math.cos(angle);
                const y1 = 200 + 150 * Math.sin(angle);
                const x2 = 200 + 190 * Math.cos(angle);
                const y2 = 200 + 190 * Math.sin(angle);
                
                // Sign Glyphs would go here in a full app. Using dots for now.
                const labelAngle = angle + (15 * Math.PI / 180);
                const lx = 200 + 175 * Math.cos(labelAngle);
                const ly = 200 + 175 * Math.sin(labelAngle);

                return (
                    <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="1" />
                        <text 
                            x={lx} y={ly} 
                            fill="#94a3b8" 
                            fontSize="8" 
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            style={{ transform: `rotate(${(i * 30) + 90}deg, ${lx}, ${ly})`}}
                        >
                            {ZODIAC_SIGNS[i].substring(0, 3).toUpperCase()}
                        </text>
                    </g>
                );
            })}
        </motion.g>

        {/* Fixed Houses Framework (Horizon Line) */}
        <line x1="10" y1="200" x2="390" y2="200" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 4" />
        <line x1="200" y1="10" x2="200" y2="390" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" />
        
        {/* Inner Hub */}
        <circle cx="200" cy="200" r="150" fill="none" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.2" />

        {/* Planets (They self-correct position based on wheelRotation) */}
        <PlanetMarker planet={chart.sun} label={t.sun} radius={120} color="#fbbf24" />
        <PlanetMarker planet={chart.moon} label={t.moon} radius={100} color="#e2e8f0" />
        {/* Rising is technically always at 9 o'clock (Left) now, but we draw it to show exact degree */}
        <PlanetMarker planet={chart.rising} label={t.asc} radius={190} color="#a855f7" />

        {/* Mystic Center */}
        <circle cx="200" cy="200" r="5" fill="#a855f7" className="animate-pulse" />
      </svg>
    </div>
  );
};

export default StarChart;