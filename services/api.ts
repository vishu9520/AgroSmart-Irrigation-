const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
};

async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json();
}

export type DefaultRegion = { country?: string; division?: string; zilla?: string; upazila?: string };
export type AuthUser = { id: string; email: string; name?: string; phone?: string; roles: string[]; defaultRegion?: DefaultRegion };

export const AuthApi = {
  register: (email: string, password: string, name?: string, phone?: string) =>
    api<{ id: string; email: string }>(`/api/auth/register`, {
      method: 'POST',
      body: { email, password, name, phone },
    }),
  login: (email: string, password: string) =>
    api<{ token: string; user: AuthUser }>(`/api/auth/login`, {
      method: 'POST',
      body: { email, password },
    }),
  me: (token: string) => api<{ user: AuthUser }>(`/api/auth/me`, { token }),
  requestReset: (phone: string) =>
    api<{ ok: boolean }>(`/api/auth/request-reset`, { method: 'POST', body: { phone } }),
  resetPassword: (phone: string, code: string, newPassword: string) =>
    api<{ ok: boolean }>(`/api/auth/reset-password`, { method: 'POST', body: { phone, code, newPassword } }),
};

export type ActivityLog = {
  _id: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export const ActivityApi = {
  create: (token: string, action: string, metadata?: Record<string, unknown>) =>
    api<ActivityLog>(`/api/activity`, {
      method: 'POST',
      token,
      body: { action, metadata },
    }),
  listMine: (token: string) => api<ActivityLog[]>(`/api/activity`, { token }),
  clearMine: (token: string) => api<{ deleted: number }>(`/api/activity`, { method: 'DELETE', token }),
};

export const UserApi = {
  me: (token: string) => api<{ user: AuthUser }>(`/api/user/me`, { token }),
  updateMe: (token: string, payload: { name?: string; phone?: string; defaultRegion?: DefaultRegion }) =>
    api<{ user: AuthUser }>(`/api/user/me`, { method: 'PUT', token, body: payload }),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    api<{ ok: boolean }>(`/api/user/password`, { method: 'PUT', token, body: { currentPassword, newPassword } }),
};
