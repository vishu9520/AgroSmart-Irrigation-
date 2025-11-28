
import type { WeatherData, WeatherDay, CurrentWeather } from '../types';

const API_KEY = 'fa3e1fcf2ac9b49801a2dd2a452fdc23';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface OWMForecastItem {
  dt_txt: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
  pop: number; // Probability of precipitation
}

interface OWMGeocodeResponse {
    lat: number;
    lon: number;
    name: string;
    country: string;
    state?: string;
}

export const getRealWeatherForecast = async (location: string): Promise<WeatherData> => {
    const baseResponse: Pick<WeatherData, 'forecast' | 'source' | 'lastUpdated'> = {
        forecast: [],
        source: 'live' as const,
        lastUpdated: new Date().toISOString(),
    };

    if (!location) {
        return { ...baseResponse, error: "No location provided to fetch weather." };
    }
    
    // 1. Geocode location to get coordinates
    let geocodeData: OWMGeocodeResponse[];
    try {
        const geoResponse = await fetch(`${GEO_API_URL}?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`);
        if (!geoResponse.ok) {
            let errorMessage = geoResponse.statusText;
            try {
                const errorData = await geoResponse.json();
                if (errorData && errorData.message) {
                    errorMessage = errorData.message.charAt(0).toUpperCase() + errorData.message.slice(1);
                }
            } catch (e) { /* Response not JSON, use status text */ }
            return { ...baseResponse, error: `Geocoding API Error: ${errorMessage}.` };
        }
        geocodeData = await geoResponse.json();
        if (!geocodeData || geocodeData.length === 0) {
            return { ...baseResponse, error: `Could not find coordinates for "${location}". Please try a different location.` };
        }
    } catch (error) {
        console.error("Geocoding fetch error:", error);
        return { ...baseResponse, error: "Failed to connect to the geocoding service." };
    }
    
    const { lat, lon, name, state, country } = geocodeData[0];
    const resolvedLocation = [name, state, country].filter(Boolean).join(', ');

    // 2. Fetch current weather and forecast using coordinates
    try {
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
             fetch(`${CURRENT_WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
             fetch(`${FORECAST_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        ]);

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            let errorMsg = '';
            if(!currentWeatherResponse.ok) errorMsg += `Current weather error: ${currentWeatherResponse.statusText}. `;
            if(!forecastResponse.ok) errorMsg += `Forecast error: ${forecastResponse.statusText}.`;
            return { ...baseResponse, resolvedLocation, lat, lon, error: errorMsg.trim() };
        }
        
        const currentData = await currentWeatherResponse.json();
        const forecastAPIData = await forecastResponse.json();
        
        // Process current weather
        const current: CurrentWeather = {
            temperature: parseFloat(currentData.main.temp.toFixed(1)),
            humidity: Math.round(currentData.main.humidity),
        };

        // Group forecast items by day
        const dailyData: { [key: string]: OWMForecastItem[] } = {};
        forecastAPIData.list.forEach((item: OWMForecastItem) => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyData[date]) dailyData[date] = [];
            dailyData[date].push(item);
        });

        const forecastDays: WeatherDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const dateString in dailyData) {
            if (forecastDays.length >= 5) break;

            const dayItems = dailyData[dateString];
            if (dayItems.length === 0) continue;

            const avgTemp = dayItems.reduce((sum, item) => sum + item.main.temp, 0) / dayItems.length;
            const avgHumidity = dayItems.reduce((sum, item) => sum + item.main.humidity, 0) / dayItems.length;
            const maxPop = Math.max(...dayItems.map(item => item.pop));
            const description = dayItems[Math.floor(dayItems.length / 2)].weather[0].main;
            
            const itemDate = new Date(dateString);
            itemDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            let dayLabel = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : itemDate.toLocaleString('en-US', { weekday: 'long' });

            forecastDays.push({
                day: dayLabel,
                date: dateString,
                temp: parseFloat(avgTemp.toFixed(1)),
                humidity: Math.round(avgHumidity),
                rainChance: Math.round(maxPop * 100),
                description: description,
            });
        }
        
        return { 
            ...baseResponse,
            forecast: forecastDays,
            current,
            resolvedLocation,
            lat,
            lon,
        };

    } catch (error) {
        console.error("Failed to fetch weather forecast:", error);
        return { ...baseResponse, resolvedLocation, lat, lon, error: "Failed to connect to the weather service." };
    }
};