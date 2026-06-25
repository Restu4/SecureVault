import { useQuery } from '@tanstack/react-query';
import { Users, Activity, AlertTriangle, Lock, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/security/dashboard').then(r => r.data.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/security/analytics').then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Users', value: dashboard?.totalUsers || 0, icon: Users, change: '+12%', up: true, gradient: 'from-cyan-500 to-blue-500' },
    { label: 'Active Sessions', value: dashboard?.activeSessions || 0, icon: Activity, change: '+3%', up: true, gradient: 'from-emerald-400 to-teal-500' },
    { label: 'Failed Logins Today', value: dashboard?.failedLoginsToday || 0, icon: AlertTriangle, change: dashboard?.failedLoginsToday > 0 ? `+${dashboard.failedLoginsToday}` : '0', up: false, gradient: 'from-rose-400 to-red-500' },
    { label: 'Locked Accounts', value: dashboard?.lockedAccounts || 0, icon: Lock, change: '0', up: true, gradient: 'from-amber-400 to-orange-500' },
  ];

  const score = dashboard?.securityScore || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time overview of your security posture</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
            <Shield className="w-5 h-5 text-cyan-500" />
            <div>
              <span className="font-semibold text-slate-900">{score}/100</span>
              <span className="text-slate-400 text-sm ml-1.5">Security Score</span>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${score >= 80 ? 'bg-emerald-400' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <span className={`flex items-center text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stat.up ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Failed Login Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Last 7 days</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics?.failedLoginTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: '#f43f5e', strokeWidth: 0, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Role Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">User breakdown by role</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={analytics?.roleDistribution || []} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3}>
                {(analytics?.roleDistribution || []).map((_: any, idx: number) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {(analytics?.roleDistribution || []).map((item: any, idx: number) => (
              <div key={item.role} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                {item.role}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Active Users</h3>
          <p className="text-xs text-slate-400 mb-4">Daily active users (7 days)</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.activeUsersByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Security Events</h3>
          <p className="text-xs text-slate-400 mb-4">Security-related events (7 days)</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics?.securityEvents || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Security Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Target</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentEvents?.map((event: any, idx: number) => (
                <tr key={event.id} className={`${idx !== dashboard.recentEvents.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors`}>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{event.action}</td>
                  <td className="px-5 py-3.5 text-slate-600">{event.user?.fullname || event.userId || '-'}</td>
                  <td className="px-5 py-3.5 text-slate-500">{event.target || '-'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      event.status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                      event.status === 'warning' ? 'bg-amber-50 text-amber-700' :
                      event.status === 'failed' ? 'bg-rose-50 text-rose-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        event.status === 'success' ? 'bg-emerald-400' :
                        event.status === 'warning' ? 'bg-amber-400' :
                        event.status === 'failed' ? 'bg-rose-400' :
                        'bg-slate-400'
                      }`} />
                      {event.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(event.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {(!dashboard?.recentEvents || dashboard.recentEvents.length === 0) && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No recent events</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
