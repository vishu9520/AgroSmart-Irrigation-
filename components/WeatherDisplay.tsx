import React from 'react';
import type { WeatherData, WeatherDay } from '../types';

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const CloudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
);

const CloudRainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>
);

const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const AlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
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


const getWeatherIcon = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('rain') || desc.includes('shower')) {
    return <CloudRainIcon className="h-8 w-8 text-secondary" />;
  }
  if (desc.includes('cloud')) {
    return <CloudIcon className="h-8 w-8 text-text-secondary" />;
  }
  return <SunIcon className="h-8 w-8 text-yellow-400" />;
};


interface WeatherDisplayProps {
  weather: WeatherData | null;
  isLoading: boolean;
}

const WeatherDayCard: React.FC<{ day: WeatherDay; isToday?: boolean }> = ({ day, isToday }) => {
    // Adding 'Z' to the date string ensures it's parsed as UTC, avoiding timezone shifts.
    const formattedDate = new Date(day.date + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    
    return (
        <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
            <div className="flex items-center space-x-3">
                {getWeatherIcon(day.description)}
                <div>
                    <p className="font-semibold text-text-primary">{day.day}</p>
                    <p className="text-xs text-text-secondary">{formattedDate} · {day.description}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-text-primary">{day.temp}°C {isToday && <span className="text-xs font-normal text-secondary">(now)</span>}</p>
                <p className="text-xs text-secondary">{day.humidity}% Hum · {day.rainChance}% Rain</p>
            </div>
        </div>
    );
};


export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-24 mb-4 bg-surface rounded-lg animate-pulse"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!weather) {
    return <p className="text-text-secondary">No weather data available.</p>;
  }

  return (
    <div>
      <div className="mb-4 rounded-lg border border-border/40 bg-surface p-3">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
                <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                <div className="min-w-0">
                    <div className="font-semibold text-text-primary leading-tight truncate max-w-[18rem]" title={weather.resolvedLocation || 'Selected location'}>
                        {weather.resolvedLocation || 'Selected location'}
                    </div>
                    {typeof weather.lat === 'number' && typeof weather.lon === 'number' && (
                    <div className="text-xs text-text-secondary">
                        {weather.lat.toFixed(2)}, {weather.lon.toFixed(2)}
                    </div>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className={`px-2 py-0.5 rounded border ${weather.source === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30' : 'bg-amber-500/10 text-amber-400 border-amber-400/30'}`}>
                    {weather.source === 'live' ? 'Live · OpenWeather' : 'Mock data'}
                </span>

                {weather.current && (
                    <>
                        <div className="flex items-center gap-1 text-text-primary">
                            <ThermometerIcon className="h-4 w-4 text-orange-400" />
                            <span>{weather.current.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-primary">
                            <WindIcon className="h-4 w-4 text-blue-400" />
                            <span>{weather.current.humidity}%</span>
                        </div>
                    </>
                )}

                <div className="flex items-center gap-1 text-text-secondary whitespace-nowrap">
                    <ClockIcon className="h-4 w-4" />
                    <span>{weather.lastUpdated ? `Updated: ${new Date(weather.lastUpdated).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: 'numeric', minute: 'numeric' })}` : ''}</span>
                </div>
            </div>
        </div>
        
        {weather.error && (
            <div className="mt-3 text-xs text-red-300 bg-red-900/20 border border-red-500/30 rounded p-2 flex items-start gap-2">
                <AlertIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{weather.error}</span>
            </div>
        )}
      </div>

      <div className="space-y-3">
        {weather.forecast.length > 0 ? (
          weather.forecast.map((day) => {
            if (day.day === 'Today' && weather.current) {
                // For 'Today', show the current live data for consistency with sensor panels
                const todayWithCurrentData: WeatherDay = {
                    ...day,
                    temp: weather.current.temperature,
                    humidity: weather.current.humidity,
                };
                return <WeatherDayCard key={day.day} day={todayWithCurrentData} isToday={true} />;
            }
            return <WeatherDayCard key={day.day} day={day} />;
          })
        ) : (
          !weather.error && <p className="text-text-secondary text-sm text-center py-4">Forecast data is currently unavailable.</p>
        )}
      </div>
    </div>
  );
};