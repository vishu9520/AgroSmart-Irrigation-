import React, { useState, FormEvent } from 'react';
import { AuthApi } from '../services/api';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

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

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuthAction = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isLoginView) {
        if (!email || !password) return setError('Email and password are required.');
        const res = await AuthApi.login(email, password);
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        setSuccess('Login successful!');
        setTimeout(onLoginSuccess, 500);
      } else {
        if (!email || !password) return setError('Email and password are required.');
        if (password !== confirmPassword) return setError('Passwords do not match.');
        await AuthApi.register(email, password, name, phone);
        setSuccess('Registration successful! Please log in.');
        setIsLoginView(true);
        setEmail(''); setPassword(''); setConfirmPassword('');
      }
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setSuccess('');
    // Placeholder for OAuth
    setError('Google login not configured.');
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-full mb-4">
            <AppLogoIcon className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Smart Irrigation System</h1>
          <p className="text-md text-text-secondary mt-1">Please sign in to continue</p>
        </div>

        <div className="bg-panel p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-text-primary mb-6">
            {isLoginView ? 'Login' : 'Register'}
          </h2>
          <form onSubmit={handleAuthAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {!isLoginView && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="e.g., +8801XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLoginView ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {!isLoginView && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {success && <p className="text-sm text-green-500 text-center">{success}</p>}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel focus:ring-primary transition-colors"
              >
                {isLoginView ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-panel px-2 text-text-secondary">OR</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center py-2 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-text-primary bg-surface hover:bg-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel focus:ring-primary transition-colors"
            >
              <GoogleIcon className="h-5 w-5 mr-2" />
              Sign in with Google
            </button>
            {isLoginView && <ForgotPasswordSection />}
          </div>

          <p className="mt-6 text-center text-sm text-text-secondary">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError('');
                setSuccess('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setName('');
                setPhone('');
              }}
              className="font-medium text-primary hover:text-primary/80 focus:outline-none"
            >
              {isLoginView ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordSection: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [phase, setPhase] = useState<'request' | 'reset'>('request');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const requestCode = async () => {
    setErr(''); setMsg('');
    try {
      await AuthApi.requestReset(phone);
      setMsg('Reset code sent via SMS (check console in dev).');
      setPhase('reset');
    } catch (e: any) {
      setErr(e?.message || 'Failed to request code');
    }
  };
  const doReset = async () => {
    setErr(''); setMsg('');
    try {
      await AuthApi.resetPassword(phone, code, newPassword);
      setMsg('Password reset successful. You can login now.');
    } catch (e: any) {
      setErr(e?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="mt-4 p-3 border border-border rounded-lg">
      <p className="text-sm text-text-secondary mb-2">Forgot password?</p>
      <div className="flex flex-col gap-2">
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 bg-surface border border-border rounded"
        />
        {phase === 'reset' && (
          <>
            <input
              type="text"
              placeholder="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded"
            />
          </>
        )}
        {err && <p className="text-xs text-red-500">{err}</p>}
        {msg && <p className="text-xs text-green-600">{msg}</p>}
        {phase === 'request' ? (
          <button onClick={requestCode} className="text-sm text-primary hover:underline self-start">Send reset code</button>
        ) : (
          <button onClick={doReset} className="text-sm text-primary hover:underline self-start">Reset password</button>
        )}
      </div>
    </div>
  );
};

