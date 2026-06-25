import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute top-20 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-between p-16 w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">SecureVault</span>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Enterprise-Grade<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Access Management
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Centralized authentication, role-based access control, and real-time security monitoring for your organization.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                SOC 2 Compliant
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                RBAC Enabled
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Audit Logged
              </div>
            </div>
          </div>
          <div className="text-slate-600 text-sm">
            &copy; 2026 SecureVault. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">SecureVault</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-1">Sign in to your enterprise account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition shadow-sm"
                  placeholder="admin@securevault.io" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition shadow-sm pr-10"
                  placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/20" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-600 hover:text-cyan-700 font-medium">Create one</Link>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock className="w-3 h-3" />
            Secured with end-to-end encryption
          </div>
        </div>
      </div>
    </div>
  );
}
