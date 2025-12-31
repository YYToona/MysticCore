// The Contract: Structured Data for the Analysis Engine

export type Language = 'en' | 'zh';

export enum TarotPosition {
    PAST = 'past',
    PRESENT = 'present',
    FUTURE = 'future'
  }
  
  export enum CardOrientation {
    UPRIGHT = 'Upright',
    REVERSED = 'Reversed'
  }
  
  export interface TarotCardData {
    id: number;
    name: { en: string; zh: string };
    image: string; // URL to the card image
    keywords_upright: { en: string[]; zh: string[] };
    keywords_reversed: { en: string[]; zh: string[] };
    arcana: 'Major' | 'Minor';
    suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  }
  
  export interface DrawnCard {
    card: TarotCardData;
    position: TarotPosition;
    orientation: CardOrientation;
  }
  
  export interface PlanetPosition {
    sign: string;
    house: number;
    deg: number;
  }
  
  export interface AstrologyChart {
    sun: PlanetPosition;
    moon: PlanetPosition;
    rising: PlanetPosition; // Ascendant
    aspects: string[];
  }
  
  export interface UserInfo {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    question: string;
  }
  
  // The final JSON payload sent to Gemini
  export interface AnalysisPayload {
    language: Language;
    user_info: {
      name: string;
      question: string;
    };
    tarot_spread: {
      [key in TarotPosition]: {
        card_name: string;
        position: string; // Upright/Reversed
        meaning_keywords: string[];
      };
    };
    astrology_chart: AstrologyChart;
  }
  
  export type AppStage = 'intro' | 'astrology-input' | 'tarot-reading' | 'analyzing' | 'result';