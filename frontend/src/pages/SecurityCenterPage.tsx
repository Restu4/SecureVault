import { useQuery } from '@tanstack/react-query';
import { Users, Activity, AlertTriangle, Lock, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function SecurityCenterPage() {
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/security/dashboard').then(r => r.data.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/security/analytics').then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Security Center</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Account Lockout Protection
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Failed Attempts Threshold</span>
              <span className="font-semibold">5 attempts</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Lock Window</span>
              <span className="font-semibold">10 minutes</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Lock Duration</span>
              <span className="font-semibold">15 minutes</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Locked Accounts</span>
              <span className="font-semibold text-red-600">{dashboard?.lockedAccounts || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" /> Suspicious Login Detection
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">New IP Detection</span>
              <span className="font-semibold text-green-600">Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Location Anomaly</span>
              <span className="font-semibold text-green-600">Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Multiple Failed Logins</span>
              <span className="font-semibold text-green-600">Active</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Failed Logins Today</span>
              <span className="font-semibold text-yellow-600">{dashboard?.failedLoginsToday || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-500" /> Password Security Policy
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Min Length', value: '8 chars', met: true },
            { label: 'Uppercase', value: 'Required', met: true },
            { label: 'Lowercase', value: 'Required', met: true },
            { label: 'Numbers', value: 'Required', met: true },
            { label: 'Symbols', value: 'Required (!@#$%^&*)', met: true },
          ].map((policy) => (
            <div key={policy.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl mb-1 ${policy.met ? 'text-green-500' : 'text-red-500'}`}>
                {policy.met ? '✓' : '✗'}
              </div>
              <p className="text-sm font-medium text-gray-700">{policy.label}</p>
              <p className="text-xs text-gray-500">{policy.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Security Features</h3>
          <div className="space-y-3">
            {[
              { name: 'JWT Authentication', status: 'enabled', desc: 'Access & Refresh Tokens' },
              { name: 'Password Hashing', status: 'enabled', desc: 'bcrypt (12 rounds)' },
              { name: 'Rate Limiting', status: 'enabled', desc: '100 requests/min' },
              { name: 'Helmet Headers', status: 'enabled', desc: 'Security HTTP headers' },
              { name: 'CORS Protection', status: 'enabled', desc: 'Restricted origins' },
              { name: 'Input Validation', status: 'enabled', desc: 'class-validator' },
              { name: 'SQL Injection Protection', status: 'enabled', desc: 'TypeORM parameterized queries' },
            ].map((feature) => (
              <div key={feature.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{feature.name}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium uppercase">{feature.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Top Login Countries</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.topCountries || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="country" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
