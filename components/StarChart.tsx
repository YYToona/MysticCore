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
  const getAngle = (sign: string, deg: number) => {
    const signIndex = ZODIAC_SIGNS.indexOf(sign);
    return (signIndex * 30) + deg;
  };

  const PlanetMarker = ({ planet, label, radius, color }: { planet: PlanetPosition, label: string, radius: number, color: string }) => {
    const angle = getAngle(planet.sign, planet.deg);
    const radians = (angle * Math.PI) / 180;
    const x = 200 + radius * Math.cos(radians);
    const y = 200 + radius * Math.sin(radians);

    return (
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <circle cx={x} cy={y} r="5" fill={color} className="shadow-lg shadow-amber-500" />
        <line x1="200" y1="200" x2={x} y2={y} stroke={color} strokeWidth="1" strokeOpacity="0.3" />
        <text x={x + 10} y={y + 5} fill={color} fontSize="12" fontWeight="bold" fontFamily="Cinzel, Noto Serif SC">
          {label} ({planet.sign})
        </text>
      </motion.g>
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Outer Wheel */}
        <circle cx="200" cy="200" r="190" fill="none" stroke="#64748b" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="#475569" strokeWidth="1" strokeOpacity="0.5" />
        
        {/* House Lines */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const x2 = 200 + 190 * Math.cos(angle);
          const y2 = 200 + 190 * Math.sin(angle);
          return (
            <line 
                key={i} 
                x1="200" 
                y1="200" 
                x2={x2} 
                y2={y2} 
                stroke="#334155" 
                strokeWidth="1" 
            />
          );
        })}

        {/* Planets */}
        <PlanetMarker planet={chart.sun} label={t.sun} radius={120} color="#fbbf24" />
        <PlanetMarker planet={chart.moon} label={t.moon} radius={100} color="#e2e8f0" />
        <PlanetMarker planet={chart.rising} label={t.asc} radius={170} color="#a855f7" />

        {/* Center Decoration */}
        <circle cx="200" cy="200" r="10" fill="#a855f7" fillOpacity="0.5">
           <animate attributeName="r" values="10;15;10" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

export default StarChart;