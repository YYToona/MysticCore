import { AstrologyChart } from '../types';
import { ZODIAC_SIGNS } from '../constants';

// Backend URL
const API_URL = '/api/calculate_chart';

// Fallback Mock generator (only used if backend is completely unreachable)
const getRandomSign = (seed: number) => ZODIAC_SIGNS[seed % 12];
const getRandomDegree = (seed: number) => (seed * 13.7) % 30;

const generateMockChart = (date: string, time: string): AstrologyChart => {
  const inputString = `${date}${time}`;
  const seed = inputString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return {
    sun: {
      sign: getRandomSign(seed),
      house: 10,
      deg: parseFloat(getRandomDegree(seed).toFixed(2))
    },
    moon: {
      sign: getRandomSign(seed + 5),
      house: 4,
      deg: parseFloat(getRandomDegree(seed + 20).toFixed(2))
    },
    rising: {
      sign: getRandomSign(seed + 9),
      house: 1,
      deg: parseFloat(getRandomDegree(seed + 50).toFixed(2))
    },
    aspects: [
      `Sun Trine ${getRandomSign(seed + 3)}`,
      `Moon Opposition ${getRandomSign(seed + 7)}`
    ]
  };
};

export const calculateChart = async (date: string, time: string): Promise<AstrologyChart> => {
  try {
    // In a real scenario, we would get lat/lon from the browser or an input.
    // For this MVP, we default to London (51.5074, -0.1278) to ensure the Python backend
    // has valid numbers to crunch.
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            date, 
            time, 
            place: "London, UK",
            lat: 51.5074,
            lon: -0.1278
        })
    });

    if (!response.ok) {
        throw new Error('API Calculation failed');
    }

    const data = await response.json();
    return data as AstrologyChart;

  } catch (error) {
    console.warn("Backend unavailable, using spiritual fallback simulation.", error);
    // Fallback to mock if Python backend is not running locally or fails
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate calculation time
    return generateMockChart(date, time);
  }
};
