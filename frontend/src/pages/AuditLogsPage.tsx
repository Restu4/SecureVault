import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', page, actionFilter],
    queryFn: () => api.get('/audit-logs', { params: { page, limit: 20, action: actionFilter || undefined } }).then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
          <p className="text-gray-500 text-sm">Track all sensitive activities across the platform.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          placeholder="Filter by action (e.g., Login, Password Changed)..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 font-medium">Target</th>
              <th className="px-6 py-3 font-medium">IP Address</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : data?.logs?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No audit logs found</td></tr>
            ) : data?.logs?.map((log: any) => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{log.user?.fullname || log.userId || 'System'}</td>
                <td className="px-6 py-4">{log.action}</td>
                <td className="px-6 py-4 text-gray-600">{log.target || '-'}</td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.ipAddress || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-700' :
                    log.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    log.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.total > 20 && (
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <span className="text-sm text-gray-500">Total: {data.total} logs</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
