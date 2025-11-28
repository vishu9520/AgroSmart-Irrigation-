
import React from 'react';
import type { WeatherData } from '../types';

const WaterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z"/>
  </svg>
);

const ThermometerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
  </svg>
);

const WindIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
  </svg>
);

const CloudRainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>
);

interface SensorCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
  isLive?: boolean;
  liveSource?: string;
  badgeText?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ icon, label, value, unit, color, isLive, liveSource, badgeText }) => {
  const percentage = label === 'Soil Moisture' || label === 'Humidity' || label === 'Rain Probability' ? value : (value + 40) / 100 * 100; // Normalize temp for gauge
  const borderClass = `border-${color}`;
  const textClass = `text-${color}`;

  return (
    <div className="bg-panel p-6 rounded-xl flex flex-col justify-between shadow-lg h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-secondary">{label}</h3>
          {badgeText && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeText === 'Live' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {badgeText}
            </span>
          )}
        </div>
        <div className={`${textClass}`}>{icon}</div>
      </div>
      <div>
        <p className="text-4xl font-bold text-text-primary mt-2">
          {value}<span className="text-2xl text-text-secondary ml-1">{unit}</span>
        </p>
        {isLive && (
          <p className="text-xs text-secondary mt-1">Live from {liveSource}</p>
        )}
        <div className="w-full bg-surface rounded-full h-2.5 mt-4">
          <div className={`bg-${color} h-2.5 rounded-full`} style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}></div>
        </div>
      </div>
    </div>
  );
};

interface SensorDisplayProps {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  weather: WeatherData | null;
  isDeviceConnected: boolean;
  onDemoMoistureChange?: (value: number) => void;
}

export const SensorDisplay: React.FC<SensorDisplayProps> = ({ soilMoisture, temperature, humidity, weather, isDeviceConnected, onDemoMoistureChange }) => {
  const liveTemperature = weather?.current?.temperature;
  const liveHumidity = weather?.current?.humidity;
  const rainChance = weather?.forecast[0]?.rainChance ?? 0;

  return (
    <>
      {isDeviceConnected ? (
        <SensorCard 
          icon={<WaterIcon />}
          label="Soil Moisture"
          value={soilMoisture}
          unit="%"
          color="secondary"
          isLive={true}
          liveSource="ESP32"
          badgeText="Live"
        />
      ) : (
        <div className="bg-panel p-6 rounded-xl flex flex-col justify-between shadow-lg h-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-secondary">Soil Moisture</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Demo</span>
            </div>
            <div className="text-secondary"><WaterIcon /></div>
          </div>
          <div>
            <p className="text-4xl font-bold text-text-primary mt-2">
              {soilMoisture}<span className="text-2xl text-text-secondary ml-1">%</span>
            </p>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={soilMoisture}
              onChange={(e) => onDemoMoistureChange?.(Number(e.target.value))}
              className="w-full mt-4 accent-cyan-400"
            />
            <div className="w-full bg-surface rounded-full h-2.5 mt-2">
              <div className={`bg-secondary h-2.5 rounded-full`} style={{ width: `${Math.max(0, Math.min(100, soilMoisture))}%` }}></div>
            </div>
            <p className="text-xs text-text-secondary mt-1">Drag to simulate moisture</p>
          </div>
        </div>
      )}
      <SensorCard
        icon={<ThermometerIcon />}
        label="Temperature"
        value={liveTemperature ?? temperature}
        unit="°C"
        color="[#fb923c]" // orange-400
        isLive={liveTemperature !== undefined}
        liveSource="OpenWeather"
      />
      <SensorCard
        icon={<WindIcon />}
        label="Humidity"
        value={liveHumidity ?? humidity}
        unit="%"
        color="[#60a5fa]" // blue-400
        isLive={liveHumidity !== undefined}
        liveSource="OpenWeather"
      />
       <SensorCard
        icon={<CloudRainIcon />}
        label="Rain Probability"
        value={rainChance}
        unit="%"
        color="[#38bdf8]" // sky-400
        isLive={weather !== null}
        liveSource="OpenWeather"
      />
    </>
  );
};
