
import React from 'react';
import type { HistoryEntry } from '../types';

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);
const ZapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);


interface HistoryLogProps {
  history: HistoryEntry[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  const getIcon = (action: string) => {
    if (action.toLowerCase().includes('pump')) {
      return <ZapIcon className={`h-5 w-5 ${action.includes('ON') ? 'text-primary' : 'text-red-500'}`} />;
    }
    return <InfoIcon className="h-5 w-5 text-secondary" />;
  };
  
  return (
    <div className="overflow-x-auto">
      {history.length === 0 ? (
        <p className="text-center text-text-secondary py-4">No recent activity.</p>
      ) : (
        <div className="max-h-72 overflow-y-auto" role="region" aria-label="Activity Log">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-panel border-b border-border text-sm text-text-secondary">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
                <th className="p-3 hidden md:table-cell">Details</th>
                <th className="p-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-0 text-sm">
                  <td className="p-3">
                    <div className="p-2 bg-surface rounded-full inline-block">
                      {getIcon(entry.action)}
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-text-primary">{entry.action}</td>
                  <td className="p-3 text-text-secondary hidden md:table-cell">{entry.details}</td>
                  <td className="p-3 text-text-secondary text-right">{entry.timestamp.toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
