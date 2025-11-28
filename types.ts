
export interface SensorData {
  soilMoisture: number; // percentage
  temperature: number; // celsius
  humidity: number; // percentage
}

export interface HistoryEntry {
  id: number;
  timestamp: Date;
  action: string;
  details: string;
}

export interface WeatherDay {
  day: string;
  date: string;
  temp: number;
  humidity: number;
  rainChance: number;
  description: string;
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
}

export interface WeatherData {
  forecast: WeatherDay[];
  current?: CurrentWeather;
  resolvedLocation?: string;
  lat?: number;
  lon?: number;
  source: 'live' | 'mock';
  lastUpdated?: string;
  error?: string;
}

export interface AIDecision {
  decision: 'Irrigate' | 'Hold' | 'Error';
  reason: string;
  analysis_points?: string[];
  confidence_score?: number;
  short_message?: string;
}
