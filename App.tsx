
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { SensorDisplay } from './components/SensorDisplay';
import { WeatherDisplay } from './components/WeatherDisplay';
import { ControlPanel } from './components/ControlPanel';
import { HistoryLog } from './components/HistoryLog';
import { DataChart } from './components/DataChart';
import { AuthPage } from './components/AuthPage';
import { UserSettings } from './components/UserSettings';
import { RegionSelector } from './components/RegionSelector';
import { AIInsights } from './components/AIInsights';
import { Toast } from './components/Toast';
import type { SensorData, HistoryEntry, WeatherData, AIDecision } from './types';
import { getIrrigationDecision } from './services/geminiService';
import { AuthApi, ActivityApi } from './services/api';
import { getRealWeatherForecast } from './services/weatherService';
import { regions } from './data/regions';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind?: 'info' | 'success' | 'error' } | null>(null);
  const [sensorData, setSensorData] = useState<SensorData>({
    soilMoisture: 45,
    temperature: 22,
    humidity: 60,
  });
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([sensorData]);
  const [pumpStatus, setPumpStatus] = useState<'ON' | 'OFF'>('OFF');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aiDecision, setAiDecision] = useState<AIDecision>({ decision: 'Hold', reason: 'Initializing...', analysis_points: [], confidence_score: 0 });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiModeEnabled, setAiModeEnabled] = useState<boolean>(false);
  const [aiAutoRefreshEnabled, setAiAutoRefreshEnabled] = useState<boolean>(false);
  // Crop Type State
  const [cropType, setCropType] = useState<string>('');
  const sensorDataRef = useRef<SensorData>(sensorData);
  const locationRef = useRef<string>("");
  const aiInFlightRef = useRef<boolean>(false);
  const lastMoistureCategoryRef = useRef<'Dry' | 'Optimal' | 'Wet' | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [transitionCountdown, setTransitionCountdown] = useState<number | null>(null);
  const [transitionTarget, setTransitionTarget] = useState<'Dry' | 'Optimal' | null>(null);
  const lastPumpChangeRef = useRef<number>(Date.now());
  const stableCategoryRef = useRef<'Dry' | 'Optimal' | 'Wet'>(
    sensorData.soilMoisture < 35 ? 'Dry' : sensorData.soilMoisture > 65 ? 'Wet' : 'Optimal'
  );
  const stableSinceRef = useRef<number>(Date.now());

  useEffect(() => { sensorDataRef.current = sensorData; }, [sensorData]);
  
  // Device Connection State
  const [deviceIp, setDeviceIp] = useState<string>('');
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Region State (blank unless user has a defaultRegion)
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedZilla, setSelectedZilla] = useState<string>('');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('');
  const [hasDefaultRegion, setHasDefaultRegion] = useState<boolean>(false);

  const currentLocation = useMemo(() => {
    if (selectedUpazila && selectedZilla && selectedCountry) {
        const locationName = selectedUpazila.toLowerCase().includes('sadar') 
            ? selectedZilla 
            : selectedUpazila;
        return `${locationName}, ${selectedCountry}`;
    }
    return '';
  }, [selectedUpazila, selectedZilla, selectedCountry]);

  useEffect(() => { locationRef.current = currentLocation; }, [currentLocation]);

  // Verify token with backend if present
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    (async () => {
      try {
        const res = await AuthApi.me(token);
        setIsAuthenticated(true);
        const dr: any = res.user.defaultRegion;
        const present = !!(dr && (dr.country || dr.division || dr.zilla || dr.upazila));
        setHasDefaultRegion(present);
        if (present) {
          setSelectedCountry(dr.country || '');
          setSelectedDivision(dr.division || '');
          setSelectedZilla(dr.zilla || '');
          setSelectedUpazila(dr.upazila || '');
        } else {
          setSelectedCountry('');
          setSelectedDivision('');
          setSelectedZilla('');
          setSelectedUpazila('');
        }
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setIsAuthenticated(false);
      }
    })();
  }, []);

  // Fetch activity logs from backend after authentication
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    (async () => {
      try {
        const logs = await ActivityApi.listMine(token);
        const mapped: HistoryEntry[] = logs.map((l: any) => ({
          id: Date.parse(l.createdAt) || Date.now(),
          timestamp: new Date(l.createdAt),
          action: l.action,
          details: l.metadata?.details || '',
        }));
        setHistory(mapped);
      } catch (e) {
        console.error('Failed to fetch activity logs', e);
      }
    })();
  }, [isAuthenticated]);

  // Load auth, device IP, and history from localStorage (region stays blank unless defaultRegion is set)
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) setIsAuthenticated(true);
    const savedAiMode = localStorage.getItem('irrigation_aiMode');
    if (savedAiMode) {
      setAiModeEnabled(savedAiMode === 'true');
    }
    const savedAiAutoRefresh = localStorage.getItem('irrigation_aiAutoRefresh');
    if (savedAiAutoRefresh) {
      setAiAutoRefreshEnabled(savedAiAutoRefresh === 'true');
    }
    // Do not hydrate region from localStorage; users set it via Default Region in Settings.
    const savedCrop = localStorage.getItem('irrigation_cropType');
    if (savedCrop) {
      setCropType(savedCrop);
    }
    const savedIp = localStorage.getItem('irrigation_deviceIp');
    if (savedIp) {
      setDeviceIp(savedIp);
    }
    const savedHistory = localStorage.getItem('irrigation_history');
    if (savedHistory) {
      try {
        const parsed: any[] = JSON.parse(savedHistory);
        const rehydrated: HistoryEntry[] = parsed.map((e) => ({
          id: typeof e.id === 'number' ? e.id : Date.now(),
          action: e.action ?? 'Unknown',
          details: e.details ?? '',
          timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
        }));
        setHistory(rehydrated);
      } catch (e) {
        console.error('Failed to parse saved history from localStorage', e);
      }
    }
  }, []);

  // Persist AI mode
  useEffect(() => {
    localStorage.setItem('irrigation_aiMode', aiModeEnabled ? 'true' : 'false');
  }, [aiModeEnabled]);

  // Persist AI auto refresh
  useEffect(() => {
    localStorage.setItem('irrigation_aiAutoRefresh', aiAutoRefreshEnabled ? 'true' : 'false');
  }, [aiAutoRefreshEnabled]);

  // Save region to localStorage
  useEffect(() => {
    const region = {
      country: selectedCountry,
      division: selectedDivision,
      zilla: selectedZilla,
      upazila: selectedUpazila,
    };
    localStorage.setItem('irrigation_region', JSON.stringify(region));
  }, [selectedCountry, selectedDivision, selectedZilla, selectedUpazila]);

  // Persist crop type
  useEffect(() => {
    localStorage.setItem('irrigation_cropType', cropType || '');
  }, [cropType]);


  const memoizedSensorData = useMemo(() => sensorData, [sensorData]);

  const addHistoryEntry = useCallback((entry: Omit<HistoryEntry, 'timestamp' | 'id'>) => {
    const item: HistoryEntry = { ...entry, timestamp: new Date(), id: Date.now() } as any;
    setHistory(prev => [item, ...prev]);
    const token = localStorage.getItem('auth_token');
    if (token) {
      ActivityApi.create(token, entry.action, { details: entry.details }).catch(() => {});
    }
  }, []);

  // Helper: categorize soil moisture
  const moistureCategory = useMemo<'Dry' | 'Optimal' | 'Wet'>(() => {
    const m = sensorData.soilMoisture;
    if (m < 35) return 'Dry';
    if (m > 65) return 'Wet';
    return 'Optimal';
  }, [sensorData.soilMoisture]);

  // Persist activity history to localStorage
  useEffect(() => {
    try {
      const serializable = history.map(h => ({ ...h, timestamp: h.timestamp.toISOString() }));
      localStorage.setItem('irrigation_history', JSON.stringify(serializable));
    } catch (e) {
      console.error('Failed to persist history to localStorage', e);
    }
  }, [history]);

  const handlePumpToggle = useCallback(async (manualStatus: 'ON' | 'OFF', source: 'manual' | 'ai' = 'manual') => {
    if (!isDeviceConnected) {
        setDeviceError("Cannot control pump. Device is not connected.");
        setToast({ message: 'Cannot control pump. Device is not connected.', kind: 'error' });
        return;
    }
    try {
        const response = await fetch(`http://${deviceIp}/pump`, {
            method: 'POST',
            body: JSON.stringify({ state: manualStatus }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Device responded with an error: ${errorText}`);
        }
        
        // Optimistically update UI. The next poll will confirm the state.
        setPumpStatus(manualStatus);
        addHistoryEntry({
            action: source === 'ai' ? `Pump Automatically Turned ${manualStatus} by AI` : `Pump Manually Turned ${manualStatus}`,
            details: source === 'ai' ? `AI mode executed action based on latest decision.` : `User override command sent to device.`,
        });
    } catch (error) {
        console.error("Error toggling pump:", error);
        setDeviceError('Failed to send command. Check connection.');
        setToast({ message: 'Failed to send command. Check connection.', kind: 'error' });
        setIsDeviceConnected(false);
    }
  }, [addHistoryEntry, isDeviceConnected, deviceIp]);

  const fetchAIResponse = useCallback(async (currentSensorData: SensorData, location: string, opts?: { useCachedWeather?: boolean }) => {
    // Prevent overlapping AI computations
    if (aiInFlightRef.current) return;
    aiInFlightRef.current = true;
    if (!location) {
        setAiDecision({ decision: 'Hold', reason: 'Please select a location.' });
        setWeather(null);
        setIsLoading(false);
        aiInFlightRef.current = false;
        return;
    }

    const useCached = opts?.useCachedWeather === true;

    if (useCached) {
      // Fast path: only recompute using cached weather and latest soil moisture.
      if (!weather || weather.error || (weather.forecast ?? []).length === 0) {
        // Without weather, skip heavy calls in auto mode.
        aiInFlightRef.current = false;
        return;
      }
      try {
        const aiSensorData: SensorData = {
          soilMoisture: currentSensorData.soilMoisture,
          temperature: weather.current?.temperature ?? currentSensorData.temperature,
          humidity: weather.current?.humidity ?? currentSensorData.humidity,
        };
        const decisionData = await getIrrigationDecision(aiSensorData, weather, cropType);
        setAiDecision(decisionData);
      } catch (error) {
        console.error('Error computing AI decision with cached weather:', error);
      }
      aiInFlightRef.current = false;
      return;
    }

    setIsLoading(true);
    try {
      const weatherData = await getRealWeatherForecast(location);
      setWeather(weatherData);

      if (weatherData && weatherData.forecast.length > 0 && !weatherData.error) {
        const aiSensorData: SensorData = {
          soilMoisture: currentSensorData.soilMoisture,
          temperature: weatherData.current?.temperature ?? currentSensorData.temperature,
          humidity: weatherData.current?.humidity ?? currentSensorData.humidity,
        };

        const decisionData = await getIrrigationDecision(aiSensorData, weatherData, cropType);
        setAiDecision(decisionData);

        // If AI mode is off, only log recommendation.
        if (!aiModeEnabled) {
          if (decisionData.decision === 'Irrigate' && pumpStatus === 'OFF') {
            const cropMsg = cropType?.trim() ? ` for crop "${cropType.trim()}"` : '';
            const short = decisionData.short_message?.trim();
            addHistoryEntry({
              action: 'AI Recommended Irrigation',
              details: short
                ? `${short}`
                : `Irrigate${cropMsg}. Reason: ${decisionData.reason}`,
            });
          }
        }
      } else {
        const reason = weatherData?.error || 'Could not fetch weather data. Please check location.';
        console.error(reason);
        setAiDecision({ decision: 'Error', reason: reason });
      }

    } catch (error) {
      console.error("Error fetching AI response:", error);
      setAiDecision({ decision: 'Error', reason: 'Could not fetch AI decision.' });
    } finally {
      setIsLoading(false);
      aiInFlightRef.current = false;
    }
  }, [addHistoryEntry, pumpStatus, isDeviceConnected, aiModeEnabled, weather]);

  // Auto-control pump with hysteresis and minimum run/off durations
  useEffect(() => {
    if (!aiModeEnabled || !isDeviceConnected) return;
    const now = Date.now();
    const sinceChange = now - lastPumpChangeRef.current;
    const MIN_ON_MS = 20000; // 20s minimum ON time
    const MIN_OFF_MS = 10000; // 10s minimum OFF time
    const ON_THRESHOLD = 30; // Moisture below this can turn pump ON
    const OFF_THRESHOLD = 55; // Moisture above this can turn pump OFF

    const stableOptimalWet = (moistureCategory === 'Optimal' || moistureCategory === 'Wet')
      && (now - stableSinceRef.current >= 5000);

    const canTurnOn = pumpStatus === 'OFF'
      && aiDecision.decision === 'Irrigate'
      && sensorData.soilMoisture <= ON_THRESHOLD
      && sinceChange >= MIN_OFF_MS;

    const canTurnOff = pumpStatus === 'ON'
      && (aiDecision.decision === 'Hold' || sensorData.soilMoisture >= OFF_THRESHOLD || stableOptimalWet)
      && sinceChange >= MIN_ON_MS;

    if (canTurnOn) {
      handlePumpToggle('ON', 'ai');
    } else if (canTurnOff) {
      handlePumpToggle('OFF', 'ai');
    }
  }, [aiModeEnabled, isDeviceConnected, aiDecision.decision, pumpStatus, sensorData.soilMoisture, moistureCategory, handlePumpToggle]);
  
  

  // Initial weather and AI fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchAIResponse(memoizedSensorData, currentLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentLocation]);

  // Sensor data simulation (ONLY if not connected to a device)
  useEffect(() => {
    if (!isAuthenticated || isDeviceConnected) return;
    
    const interval = setInterval(() => {
      setSensorData(prev => {
        const newMoisture = pumpStatus === 'ON'
          ? Math.min(100, prev.soilMoisture + 2)
          : Math.max(0, prev.soilMoisture - 0.5 * (prev.temperature / 20));

        const newTemperature = prev.temperature + (Math.random() - 0.5);
        const newHumidity = prev.humidity + (Math.random() - 0.5);

        const newSensorData = {
          soilMoisture: parseFloat(newMoisture.toFixed(1)),
          temperature: parseFloat(newTemperature.toFixed(1)),
          humidity: parseFloat(newHumidity.toFixed(1)),
        };

        setSensorHistory(prevHistory => [...prevHistory, newSensorData].slice(-50));
        return newSensorData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [pumpStatus, isAuthenticated, isDeviceConnected]);

  // AI decision polling loop (fallback to 60s when auto refresh is off)
  useEffect(() => {
    if (!isAuthenticated || aiAutoRefreshEnabled) return;
    
    const decisionInterval = setInterval(() => {
        fetchAIResponse(sensorData, currentLocation);
    }, 60000); // Re-evaluate every 60 seconds
    return () => clearInterval(decisionInterval);
  }, [sensorData, fetchAIResponse, isAuthenticated, currentLocation, aiAutoRefreshEnabled]);

  // Auto-refresh heartbeat: keep recommendation fresh every 30s with cached weather
  useEffect(() => {
    if (!isAuthenticated || !aiAutoRefreshEnabled) return;
    const id = setInterval(() => {
      fetchAIResponse(sensorDataRef.current, locationRef.current, { useCachedWeather: true });
    }, 30000);
    return () => clearInterval(id);
  }, [aiAutoRefreshEnabled, isAuthenticated, fetchAIResponse]);

  // Periodic full refresh of weather + AI every 10 minutes (no skeleton in auto mode)
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(() => {
      fetchAIResponse(sensorDataRef.current, locationRef.current);
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [isAuthenticated, fetchAIResponse]);

  

  

  // Track stable moisture category and since when
  useEffect(() => {
    if (stableCategoryRef.current !== moistureCategory) {
      stableCategoryRef.current = moistureCategory;
      stableSinceRef.current = Date.now();
    }
  }, [moistureCategory]);

  // Track last pump state change time
  useEffect(() => {
    lastPumpChangeRef.current = Date.now();
  }, [pumpStatus]);

  // Auto refresh when condition changes between Dry and Optimal and persists 5s
  useEffect(() => {
    // If auto refresh is disabled or user not authenticated, clear any pending countdown
    if (!isAuthenticated || !aiAutoRefreshEnabled) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setTransitionTarget(null);
      setTransitionCountdown(null);
      lastMoistureCategoryRef.current = moistureCategory;
      return;
    }

    const prev = lastMoistureCategoryRef.current;
    lastMoistureCategoryRef.current = moistureCategory;

    const isTransitionRelevant = (from: typeof prev, to: typeof moistureCategory) => {
      return (from === 'Dry' && to === 'Optimal') || (from === 'Optimal' && to === 'Dry');
    };

    // If category changed to a relevant target, start 5s countdown
    if (prev && isTransitionRelevant(prev, moistureCategory)) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setTransitionTarget(moistureCategory === 'Dry' ? 'Dry' : 'Optimal');
      setTransitionCountdown(5);
      const startedFor = moistureCategory; // capture target at start
      countdownIntervalRef.current = setInterval(() => {
        setTransitionCountdown((prevCount) => {
          // If category deviated, cancel countdown
          if (lastMoistureCategoryRef.current !== startedFor) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setTransitionTarget(null);
            return null;
          }
          const next = (prevCount ?? 0) - 1;
          if (next <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setTransitionTarget(null);
            setTransitionCountdown(null);
            // Trigger AI recompute using cached weather
            fetchAIResponse(sensorDataRef.current, locationRef.current, { useCachedWeather: true });
            return null;
          }
          return next;
        });
      }, 1000);
    } else if (prev && prev !== moistureCategory) {
      // Changed to irrelevant category (e.g., Wet) — clear any pending countdown
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setTransitionTarget(null);
      setTransitionCountdown(null);
    }

    // Cleanup on dependency change
    return () => {
      // Do not clear here unconditionally; only clear when dependencies change (e.g., toggles), the next run will reset appropriately.
      // Keeping explicit clears above where needed.
    };
  }, [isAuthenticated, aiAutoRefreshEnabled, moistureCategory, fetchAIResponse]);

  // Real device data polling
  useEffect(() => {
    if (!isDeviceConnected || !deviceIp) return;

    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`http://${deviceIp}/status`);
            if (!response.ok) throw new Error('Device not responding');
            
            const data = await response.json();
            
            const newSensorData: SensorData = {
                soilMoisture: data.moisture,
                temperature: sensorData.temperature, // Keep simulated temp/humidity for now
                humidity: sensorData.humidity,
            };

            setSensorData(newSensorData);
            setSensorHistory(prev => [...prev, newSensorData].slice(-50));
            
            const newPumpStatus = data.pumpStatus === 'ON' ? 'ON' : 'OFF';
            if (pumpStatus !== newPumpStatus) {
                setPumpStatus(newPumpStatus);
                addHistoryEntry({
                    action: `Pump Automatically Turned ${newPumpStatus} by Device` ,
                    details: `Device reported new status.`,
                });
            }

            setDeviceError(null); // Clear error on successful poll
        } catch (error) {
            console.error("Device poll error:", error);
            setDeviceError('Connection lost. Please check device IP and network.');
            setIsDeviceConnected(false);
        }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isDeviceConnected, deviceIp, sensorData.temperature, sensorData.humidity, pumpStatus, addHistoryEntry]);


  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    const ok = window.confirm('Are you sure you want to logout?');
    if (!ok) return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setIsAuthenticated(false);
    setToast({ message: 'Logged out', kind: 'info' });
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all activity logs?')) return;
    const token = localStorage.getItem('auth_token');
    if (token) {
      try { await ActivityApi.clearMine(token); } catch {}
    }
    setHistory([]);
    localStorage.removeItem('irrigation_history');
    setToast({ message: 'Activity log cleared', kind: 'success' });
  };
  
  // Cascading dropdown logic
  const countryData = regions.find(c => c.name === selectedCountry);
  const divisionData = countryData?.divisions.find(d => d.name === selectedDivision);
  const zillaData = divisionData?.zillas.find(z => z.name === selectedZilla);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedDivision('');
    setSelectedZilla('');
    setSelectedUpazila('');
  };
  const handleDivisionChange = (division: string) => {
    setSelectedDivision(division);
    setSelectedZilla('');
    setSelectedUpazila('');
  };
  const handleZillaChange = (zilla: string) => {
    setSelectedZilla(zilla);
    setSelectedUpazila('');
  };

  const handleConnect = async () => {
    if (!window.confirm('Connect to the device using the provided IP?')) return;
    if (!deviceIp) {
      setDeviceError("Please enter an IP address.");
      setToast({ message: 'Please enter an IP address.', kind: 'error' });
      return;
    }
    setDeviceError(null);
    setIsConnecting(true);
    try {
      const response = await fetch(`http://${deviceIp}/status`);
      if (!response.ok) throw new Error('Device not found or not responding.');
      const data = await response.json();
      if (typeof data.moisture === 'undefined' || typeof data.pumpStatus === 'undefined') {
        throw new Error('Invalid response from device.');
      }
      setIsDeviceConnected(true);
      localStorage.setItem('irrigation_deviceIp', deviceIp);
      setToast({ message: 'Device connected', kind: 'success' });
    } catch (err) {
      let errorMessage = 'Failed to connect. Please try again.';
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = 'Connection failed. Check: 1) Device is on the same WiFi. 2) IP address is correct. 3) No firewall is blocking the connection.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setDeviceError(errorMessage);
      setIsDeviceConnected(false);
      setToast({ message: errorMessage, kind: 'error' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (!window.confirm('Disconnect the device?')) return;
    setIsDeviceConnected(false);
    setDeviceError(null);
    setToast({ message: 'Device disconnected', kind: 'info' });
  };

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-base p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Header onLogout={handleLogout} userName={(JSON.parse(localStorage.getItem('auth_user') || '{}')?.name) || (JSON.parse(localStorage.getItem('auth_user') || '{}')?.email) || ''} />
        
        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          <button
            className={`px-4 py-2 rounded ${!showSettings ? 'bg-primary text-black' : 'bg-surface border border-border'}`}
            onClick={() => setShowSettings(false)}
          >Dashboard</button>
          <button
            className={`px-4 py-2 rounded ${showSettings ? 'bg-primary text-black' : 'bg-surface border border-border'}`}
            onClick={() => setShowSettings(true)}
          >Settings</button>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {showSettings && (
            <div className="md:col-span-2">
              <UserSettings token={localStorage.getItem('auth_token') || ''} />
            </div>
          )}

          {!showSettings && (
          <>
          {/* Device Connection Panel */}
          <div className="md:col-span-2 bg-panel rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-text-primary mb-4">Device Connection</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input 
                type="text" 
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                placeholder="Enter NodeMCU IP Address (e.g., 192.168.1.123)"
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex-grow"
                disabled={isDeviceConnected || isConnecting}
              />
              <div className="flex w-full sm:w-auto items-center gap-4">
                <button
                  onClick={isDeviceConnected ? handleDisconnect : handleConnect}
                  className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors w-full sm:w-auto flex justify-center items-center ${isDeviceConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/80'} disabled:bg-gray-500`}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : (isDeviceConnected ? 'Disconnect' : 'Connect')}
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`h-3 w-3 rounded-full transition-colors ${isDeviceConnected ? 'bg-primary animate-pulse' : 'bg-text-secondary'}`}></span>
                  <span className="text-text-secondary">{isDeviceConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
            </div>
             {deviceError && <p className="text-sm text-red-400 mt-3">{deviceError}</p>}
             {!isDeviceConnected && <p className="text-sm text-text-secondary mt-3">Enter IP from Serial Monitor. You can test connectivity by visiting the IP address in your browser.</p>}
          </div>

          {/* Location Settings */}
          <div className="md:col-span-2 bg-panel rounded-xl p-6 shadow-lg">
             <h2 className="text-xl font-bold text-text-primary mb-2">Location Settings</h2>
             <p className="text-sm text-text-secondary mb-2">
               {hasDefaultRegion ? 'Default Region applied from your profile.' : 'No Default Region set. Fields are blank.'}
             </p>
             <RegionSelector
                regions={regions}
                selectedCountry={selectedCountry}
                onCountryChange={handleCountryChange}
                selectedDivision={selectedDivision}
                onDivisionChange={handleDivisionChange}
                divisions={countryData?.divisions.map(d => d.name) || []}
                selectedZilla={selectedZilla}
                onZillaChange={handleZillaChange}
                zillas={divisionData?.zillas.map(z => z.name) || []}
                selectedUpazila={selectedUpazila}
                onUpazilaChange={setSelectedUpazila}
                upazilas={zillaData?.upazilas || []}
             />
             <div className="mt-4 grid grid-cols-1">
               <label htmlFor="crop-type" className="block text-sm font-medium text-text-secondary mb-2">Crop Type</label>
               <input
                 id="crop-type"
                 type="text"
                 placeholder="e.g., Rice, Wheat, Maize, Tomato"
                 value={cropType}
                 onChange={(e) => setCropType(e.target.value)}
                 className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
               />
               <p className="text-xs text-text-secondary mt-2">AI will tailor irrigation decisions based on this crop.</p>
             </div>
          </div>

          {/* Sensor Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6 content-start">
            <SensorDisplay
              soilMoisture={sensorData.soilMoisture}
              temperature={sensorData.temperature}
              humidity={sensorData.humidity}
              weather={weather}
              isDeviceConnected={isDeviceConnected}
              onDemoMoistureChange={(value) => {
                if (isDeviceConnected) return;
                setSensorData(prev => {
                  const newSensorData = { ...prev, soilMoisture: value };
                  setSensorHistory(prevHistory => [...prevHistory, newSensorData].slice(-50));
                  return newSensorData;
                });
              }}
            />
          </div>
          
          {/* Weather Forecast */}
          <div className="bg-panel rounded-xl p-6 shadow-lg">
             <h2 className="text-xl font-bold text-text-primary mb-4">Weather Forecast</h2>
            <WeatherDisplay weather={weather} isLoading={isLoading} />
          </div>
          
          {/* AI Agronomist Insights */}
          <div className="md:col-span-2">
            <AIInsights
              aiDecision={aiDecision}
              isLoading={isLoading}
              currentSoilMoisture={sensorData.soilMoisture}
              onRefresh={() => fetchAIResponse(sensorData, currentLocation)}
              autoRefreshEnabled={aiAutoRefreshEnabled}
              onToggleAutoRefresh={(v)=>{ if (window.confirm(v ? 'Enable auto refresh?' : 'Disable auto refresh?')) setAiAutoRefreshEnabled(v); }}
              transitionCountdown={transitionCountdown ?? undefined}
              transitionTarget={transitionTarget ?? undefined}
              cropType={cropType}
            />
          </div>

          {/* Control Panel */}
          <div className="bg-panel rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-text-primary mb-4">Control Panel</h2>
              <ControlPanel
                pumpStatus={pumpStatus}
                onToggle={(s) => {
                  if (window.confirm(`Are you sure you want to turn ${s === 'ON' ? 'ON' : 'OFF'} the pump?`)) {
                    handlePumpToggle(s, 'manual');
                    setToast({ message: `Pump ${s} command sent`, kind: 'info' });
                  }
                }}
                aiModeEnabled={aiModeEnabled}
                onAiModeToggle={(v)=>{
                  if (window.confirm(v ? 'Enable AI mode?' : 'Disable AI mode?')) {
                    setAiModeEnabled(v);
                    setToast({ message: v ? 'AI mode enabled' : 'AI mode disabled', kind: 'info' });
                  }
                }}
              />
          </div>

          {/* Sensor Data History */}
           <div className="bg-panel rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-text-primary mb-4">Sensor Data History</h2>
            <DataChart data={sensorHistory} />
          </div>

          {/* Activity Log */}
          <div className="md:col-span-2 bg-panel rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Activity Log</h2>
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface"
              >
                Clear Activity Log
              </button>
            </div>
            <HistoryLog history={history} />
          </div>
          </>
          )}

        </main>
      </div>
      {toast && (
        <Toast message={toast.message} kind={toast.kind} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default App;
