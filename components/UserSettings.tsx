import React, { useEffect, useMemo, useState } from 'react';
import { UserApi, AuthUser } from '../services/api';
import { RegionSelector } from './RegionSelector';
import { regions as allRegions } from '../data/regions';
import { Toast } from './Toast';

interface Props {
  token: string;
}

export const UserSettings: React.FC<Props> = ({ token }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');
  const [toast, setToast] = useState<{ message: string; kind?: 'info' | 'success' | 'error' } | null>(null);
  const [country, setCountry] = useState('');
  const [division, setDivision] = useState('');
  const [zilla, setZilla] = useState('');
  const [upazila, setUpazila] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await UserApi.me(token);
        setUser(res.user);
        setName(res.user.name || '');
        setPhone(res.user.phone || '');
        const dr = res.user.defaultRegion || {} as any;
        setCountry(dr.country || '');
        setDivision(dr.division || '');
        setZilla(dr.zilla || '');
        setUpazila(dr.upazila || '');
      } catch (e: any) {
        setErr(e?.message || 'Failed to load profile');
      }
    })();
  }, [token]);

  const updateProfile = async () => {
    setErr(''); setStatus('');
    try {
      if (!window.confirm('Save profile changes?')) return;
      const res = await UserApi.updateMe(token, { name, phone });
      setUser(res.user);
      setStatus('Profile updated');
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      setToast({ message: 'Profile updated', kind: 'success' });
    } catch (e: any) {
      setErr(e?.message || 'Failed to update');
      setToast({ message: e?.message || 'Failed to update profile', kind: 'error' });
    }
  };

  const changePassword = async () => {
    setErr(''); setStatus('');
    try {
      if (!window.confirm('Change password now?')) return;
      await UserApi.changePassword(token, currentPassword, newPassword);
      setStatus('Password changed');
      setCurrentPassword(''); setNewPassword('');
      setToast({ message: 'Password changed', kind: 'success' });
    } catch (e: any) {
      setErr(e?.message || 'Failed to change password');
      setToast({ message: e?.message || 'Failed to change password', kind: 'error' });
    }
  };

  return (
    <div className="bg-panel p-4 rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-3">User Settings</h3>
      {err && <p className="text-sm text-red-500 mb-2">{err}</p>}
      {status && <p className="text-sm text-green-600 mb-2">{status}</p>}
      {user && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 text-text-secondary">Email</label>
              <input value={user.email} disabled className="w-full px-3 py-2 bg-surface border border-border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-text-secondary">Full Name</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-text-secondary">Phone</label>
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded" />
            </div>
          </div>
          <div className="mt-3">
            <button onClick={updateProfile} className="px-4 py-2 bg-primary text-white rounded">Save Profile</button>
          </div>
          <div className="mt-6">
            <h4 className="font-medium mb-2">Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="password" placeholder="Current password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded" />
              <input type="password" placeholder="New password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded" />
            </div>
            <button onClick={changePassword} className="mt-2 px-4 py-2 bg-surface border border-border rounded">Update Password</button>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-2">Default Region</h4>
            <RegionSelector
              regions={allRegions}
              selectedCountry={country}
              onCountryChange={(c)=>{ setCountry(c); setDivision(''); setZilla(''); setUpazila(''); }}
              selectedDivision={division}
              onDivisionChange={(d)=>{ setDivision(d); setZilla(''); setUpazila(''); }}
              divisions={(allRegions.find(r=>r.name===country)?.divisions||[]).map(d=>d.name)}
              selectedZilla={zilla}
              onZillaChange={(z)=>{ setZilla(z); setUpazila(''); }}
              zillas={(allRegions.find(r=>r.name===country)?.divisions.find(d=>d.name===division)?.zillas||[]).map(z=>z.name)}
              selectedUpazila={upazila}
              onUpazilaChange={setUpazila}
              upazilas={(allRegions.find(r=>r.name===country)?.divisions.find(d=>d.name===division)?.zillas.find(z=>z.name===zilla)?.upazilas)||[]}
            />
            <button
              onClick={async ()=>{
                setErr(''); setStatus('');
                try {
                  if (!window.confirm('Save default region?')) return;
                  const res = await UserApi.updateMe(token, { defaultRegion: { country, division, zilla, upazila } });
                  setUser(res.user);
                  setStatus('Default region saved');
                  localStorage.setItem('auth_user', JSON.stringify(res.user));
                  setToast({ message: 'Default region saved', kind: 'success' });
                } catch (e:any) {
                  setErr(e?.message || 'Failed to save default region');
                  setToast({ message: e?.message || 'Failed to save default region', kind: 'error' });
                }
              }}
              className="mt-3 px-4 py-2 bg-primary text-white rounded"
            >
              Save Default Region
            </button>
          {toast && (
            <Toast message={toast.message} kind={toast.kind} onClose={() => setToast(null)} />
          )}
          </div>
        </>
      )}
    </div>
  );
};
