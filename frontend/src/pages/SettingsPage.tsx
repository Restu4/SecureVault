import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Key } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [changing, setChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setChanging(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-500" /> Profile
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">{user?.fullname}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Role ID</span>
            <span className="font-medium">{user?.roleId || 'No role assigned'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary-500" /> Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            <p className="text-xs text-gray-500 mt-1">Min 8 chars, uppercase, lowercase, number & symbol</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <button type="submit" disabled={changing}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50">
            {changing ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
