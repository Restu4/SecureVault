import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">SecureVault</h1>
        </div>
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Check Your Email</h2>
              <p className="text-gray-500 text-sm">If an account exists with that email, we've sent a reset link.</p>
              <Link to="/login" className="block text-primary-600 hover:text-primary-700 text-sm">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-800 text-center">Reset Password</h2>
              <p className="text-gray-500 text-sm text-center">Enter your email and we'll send you a reset link.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-primary-600 hover:text-primary-700">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
