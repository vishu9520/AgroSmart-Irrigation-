
import React from 'react';

const PowerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg>
);

interface ControlPanelProps {
  pumpStatus: 'ON' | 'OFF';
  onToggle: (status: 'ON' | 'OFF') => void;
  aiModeEnabled?: boolean;
  onAiModeToggle?: (enabled: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ pumpStatus, onToggle, aiModeEnabled = false, onAiModeToggle }) => {
  const isPumpOn = pumpStatus === 'ON';

  return (
    <div className="flex flex-col gap-6 p-4 bg-surface rounded-lg">
      <div>
        <h3 className="text-sm font-bold text-text-secondary mb-2">Manual Mode</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PowerIcon className={`h-6 w-6 ${isPumpOn ? 'text-primary' : 'text-text-secondary'}`} />
            <span className="font-bold text-text-primary">Water Pump</span>
          </div>
          <button
            onClick={() => onToggle(isPumpOn ? 'OFF' : 'ON')}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel focus:ring-primary ${isPumpOn ? 'bg-primary' : 'bg-surface'}`}
            aria-label={isPumpOn ? 'Turn pump off' : 'Turn pump on'}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isPumpOn ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-bold text-text-secondary mb-2">AI Mode</h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary">Follow AI Decisions</span>
            <span className="text-xs text-text-secondary">Pump turns on/off automatically based on AI</span>
          </div>
          <button
            onClick={() => onAiModeToggle?.(!aiModeEnabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel focus:ring-primary ${aiModeEnabled ? 'bg-primary' : 'bg-surface'}`}
            aria-label={aiModeEnabled ? 'Disable AI mode' : 'Enable AI mode'}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${aiModeEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
