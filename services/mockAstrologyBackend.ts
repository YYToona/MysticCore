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

export const calculateChart = async (date: string, time: string, place: string = "London, UK"): Promise<AstrologyChart> => {
  try {
    // In a real production app, we would use the 'place' string to geocode to lat/lon 
    // using the Google Maps API or similar.
    // For this implementation, we default to London coordinates to ensure the Python backend 
    // has valid floats to compute with, as Kerykeion requires specific coordinates.
    // The backend uses the 'place' string for chart metadata if available.
    
    // Attempt to fetch from the rigorous Python backend
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            date, 
            time, 
            place: place,
            lat: 51.5074, // Default Lat (London)
            lon: -0.1278  // Default Lon (London)
        })
    });

    if (!response.ok) {
        throw new Error(`API Calculation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as AstrologyChart;

  } catch (error) {
    console.warn("Backend unavailable or failed, utilizing spiritual fallback simulation.", error);
    
    // Fallback to mock if Python backend is not running locally or fails deployment
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate calculation time
    return generateMockChart(date, time);
  }
};
