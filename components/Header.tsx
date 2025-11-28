
import React from 'react';

const AppLogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
    <rect x="9" y="11" width="6" height="6" rx="1"/>
    <path d="M12 11V9"/>
    <path d="M12 17v2"/>
    <path d="M15 14h2"/>
    <path d="M7 14h2"/>
  </svg>
);

const LogOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
);

interface HeaderProps {
  onLogout: () => void;
  userName?: string;
}

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ onLogout, userName }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-panel rounded-xl shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <AppLogoIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">Smart Irrigation System</h1>
          <p className="text-sm text-text-secondary">AI-Powered Water Management</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border">
          <UserIcon className="h-5 w-5" />
          <span className="text-sm text-text-secondary max-w-[180px] truncate">{userName || 'User'}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-surface hover:bg-border rounded-lg text-text-secondary hover:text-text-primary transition-colors duration-200"
          aria-label="Logout"
        >
          <LogOutIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
