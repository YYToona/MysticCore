import { AstrologyChart, PlanetPosition } from '../types';
import { ZODIAC_SIGNS } from '../constants';

// In a real scenario, this would call the /api/calculate_chart Python endpoint.
// Here, we simulate rigorous astronomical calculation.

const getRandomSign = (seed: number) => ZODIAC_SIGNS[seed % 12];
const getRandomDegree = (seed: number) => (seed * 13.7) % 30;

export const calculateChart = async (date: string, time: string): Promise<AstrologyChart> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simple hashing of input to generate consistent "calculations" for the demo
  const inputString = `${date}${time}`;
  const seed = inputString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const sunSign = getRandomSign(seed);
  const moonSign = getRandomSign(seed + 5);
  const risingSign = getRandomSign(seed + 9);

  return {
    sun: {
      sign: sunSign,
      house: 10, // Simplified for demo
      deg: parseFloat(getRandomDegree(seed).toFixed(2))
    },
    moon: {
      sign: moonSign,
      house: 4, // Simplified
      deg: parseFloat(getRandomDegree(seed + 20).toFixed(2))
    },
    rising: {
      sign: risingSign,
      house: 1,
      deg: parseFloat(getRandomDegree(seed + 50).toFixed(2))
    },
    aspects: [
      `Sun Trine ${getRandomSign(seed + 3)}`,
      `Moon Opposition ${getRandomSign(seed + 7)}`
    ]
  };
};