
import React from 'react';
import type { AIDecision } from '../types';

const CpuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


interface AIInsightsProps {
  aiDecision: AIDecision;
  isLoading: boolean;
  currentSoilMoisture?: number;
  onRefresh?: () => void;
  autoRefreshEnabled?: boolean;
  onToggleAutoRefresh?: (enabled: boolean) => void;
  transitionCountdown?: number;
  transitionTarget?: 'Dry' | 'Optimal';
  cropType?: string;
}

const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
);

export const AIInsights: React.FC<AIInsightsProps> = ({ aiDecision, isLoading, currentSoilMoisture, onRefresh, autoRefreshEnabled = false, onToggleAutoRefresh, transitionCountdown, transitionTarget, cropType }) => {
    // In auto refresh mode, avoid showing the full-page loading skeleton
    if (isLoading && !autoRefreshEnabled) {
        return (
            <div className="bg-panel rounded-xl p-6 shadow-lg min-h-[240px] flex flex-col justify-center items-center">
                 <LoadingSpinner />
                 <p className="mt-4 text-text-secondary">AI Agronomist is analyzing the latest data...</p>
            </div>
        );
    }
    
    if (aiDecision.decision === 'Error') {
         return (
             <div className="bg-panel rounded-xl p-6 shadow-lg min-h-[240px] flex flex-col justify-center items-center text-center">
                <AlertTriangleIcon className="h-10 w-10 text-red-500 mb-3" />
                <h3 className="text-lg font-bold text-red-400">Analysis Failed</h3>
                <p className="text-text-secondary mt-1">{aiDecision.reason}</p>
             </div>
         );
    }

    const isIrrigate = aiDecision.decision === 'Irrigate';
    const confidence = aiDecision.confidence_score ? Math.round(aiDecision.confidence_score * 100) : 0;

    const moistureCategory = typeof currentSoilMoisture === 'number'
      ? (currentSoilMoisture < 35 ? 'Dry' : currentSoilMoisture > 65 ? 'Wet' : 'Optimal')
      : undefined;

    return (
        <div className="bg-panel rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
                  <CpuIcon className="h-6 w-6 text-primary"/>
                  AI Agronomist Insights
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Auto Refresh</span>
                  <button
                    onClick={() => onToggleAutoRefresh?.(!autoRefreshEnabled)}
                    className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel focus:ring-primary ${autoRefreshEnabled ? 'bg-primary' : 'bg-surface'}`}
                    aria-label={autoRefreshEnabled ? 'Disable auto refresh' : 'Enable auto refresh'}
                  >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${autoRefreshEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onRefresh}
                    disabled={isLoading && !autoRefreshEnabled}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm ${isLoading && !autoRefreshEnabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-surface'}`}
                    aria-label="Refresh AI analysis"
                  >
                    <RefreshIcon className={`h-4 w-4 ${isLoading && !autoRefreshEnabled ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  {autoRefreshEnabled && (
                    <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                      <RefreshIcon className="h-4 w-4 text-text-secondary animate-spin" aria-hidden="true" />
                      {typeof transitionCountdown === 'number' && (
                        <span>
                          {transitionCountdown}s{transitionTarget ? ` to ${transitionTarget}` : ''}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {typeof cropType === 'string' && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-surface border border-border text-text-secondary">
                  Crop: <span className="ml-1 text-text-primary font-medium">{cropType.trim() || 'Unspecified'}</span>
                </span>
              </div>
            )}

            {typeof currentSoilMoisture === 'number' && (
              <div className="mb-4 p-3 bg-surface rounded-lg flex items-center justify-between">
                <div className="w-full">
                  <p className="text-xs text-text-secondary">Current Soil Moisture (live)</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-text-primary">{currentSoilMoisture}%</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${moistureCategory === 'Dry' ? 'bg-red-500/20 text-red-400' : moistureCategory === 'Wet' ? 'bg-blue-500/20 text-blue-400' : 'bg-primary/20 text-primary'}`}>{moistureCategory}</span>
                  </div>
                  <div className="mt-2 w-full">
                    <div className="w-full bg-panel rounded-full h-2 overflow-hidden">
                      <div
                        className={`${moistureCategory === 'Dry' ? 'bg-red-500' : moistureCategory === 'Wet' ? 'bg-blue-500' : 'bg-primary'} h-2 rounded-full`}
                        style={{ width: `${Math.max(0, Math.min(100, currentSoilMoisture))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-secondary mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Side: Decision */}
                <div className="md:col-span-1 bg-surface rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <h3 className="text-text-secondary font-semibold mb-2">Recommendation</h3>
                    <p className={`text-4xl font-bold ${isIrrigate ? 'text-primary' : 'text-text-secondary'}`}>{aiDecision.decision}</p>
                    {aiDecision.short_message && (
                        <p className="text-sm text-text-primary mt-2 leading-tight">{aiDecision.short_message}</p>
                    )}
                    <p className="text-xs text-text-secondary mt-1 leading-tight">{aiDecision.reason}</p>
                    {aiDecision.confidence_score !== undefined && (
                        <div className="mt-4 w-full">
                            <p className="text-xs text-text-secondary mb-1">Confidence: {confidence}%</p>
                             <div className="w-full bg-panel rounded-full h-2.5">
                                <div className={`bg-primary h-2.5 rounded-full`} style={{ width: `${confidence}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Analysis */}
                <div className="md:col-span-2 bg-surface rounded-lg p-4">
                    <h3 className="text-text-secondary font-semibold mb-3">Key Factors</h3>
                    <ul className="space-y-3">
                        {aiDecision.analysis_points?.map((point, index) => (
                             <li key={index} className="flex items-start gap-3">
                                <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-text-primary">{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
