import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, XCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SessionsPage() {
  const queryClient = useQueryClient();

  const { data: mySessions, isLoading: myLoading } = useQuery({
    queryKey: ['mySessions'],
    queryFn: () => api.get('/sessions/my').then(r => r.data.data),
  });

  const { data: allSessions, isLoading: allLoading } = useQuery({
    queryKey: ['allSessions'],
    queryFn: () => api.get('/sessions/all').then(r => r.data.data),
  });

  const terminateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/sessions/${id}/terminate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySessions'] });
      queryClient.invalidateQueries({ queryKey: ['allSessions'] });
      toast.success('Session terminated');
    },
  });

  const forceLogoutMutation = useMutation({
    mutationFn: (id: string) => api.post(`/sessions/${id}/force-logout`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSessions'] });
      toast.success('Session force logged out');
    },
  });

  const renderSessionRow = (session: any, showForceLogout = false) => (
    <tr key={session.id} className="border-b last:border-0 hover:bg-gray-50">
      <td className="px-6 py-4 text-gray-800">{session.device || 'Unknown'}</td>
      <td className="px-6 py-4 text-gray-600">{session.browser || 'Unknown'}</td>
      <td className="px-6 py-4 text-gray-600">{session.ipAddress}</td>
      <td className="px-6 py-4 text-gray-600">{session.country || 'Unknown'}</td>
      <td className="px-6 py-4 text-gray-500 text-xs">{new Date(session.loginTime).toLocaleString()}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>{session.status}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button onClick={() => terminateMutation.mutate(session.id)} className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title="Terminate">
            <LogOut className="w-4 h-4" />
          </button>
          {showForceLogout && (
            <button onClick={() => forceLogoutMutation.mutate(session.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Force Logout">
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Session Management</h1>
        <p className="text-gray-500 text-sm">Monitor and manage active sessions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <h3 className="px-6 py-4 font-semibold text-gray-800 border-b">My Sessions</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="px-6 py-3 font-medium">Device</th>
              <th className="px-6 py-3 font-medium">Browser</th>
              <th className="px-6 py-3 font-medium">IP Address</th>
              <th className="px-6 py-3 font-medium">Country</th>
              <th className="px-6 py-3 font-medium">Login Time</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myLoading ? <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td></tr>
            : mySessions?.map((s: any) => renderSessionRow(s))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <h3 className="px-6 py-4 font-semibold text-gray-800 border-b">All Active Sessions (Admin)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Device</th>
              <th className="px-6 py-3 font-medium">Browser</th>
              <th className="px-6 py-3 font-medium">IP Address</th>
              <th className="px-6 py-3 font-medium">Country</th>
              <th className="px-6 py-3 font-medium">Login Time</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allLoading ? <tr><td colSpan={8} className="text-center py-8 text-gray-500">Loading...</td></tr>
            : allSessions?.map((s: any) => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{s.user?.fullname || s.userId}</td>
                <td className="px-6 py-4 text-gray-600">{s.device || 'Unknown'}</td>
                <td className="px-6 py-4 text-gray-600">{s.browser || 'Unknown'}</td>
                <td className="px-6 py-4 text-gray-600">{s.ipAddress}</td>
                <td className="px-6 py-4 text-gray-600">{s.country || 'Unknown'}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(s.loginTime).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>{s.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => terminateMutation.mutate(s.id)} className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title="Terminate">
                      <LogOut className="w-4 h-4" />
                    </button>
                    <button onClick={() => forceLogoutMutation.mutate(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Force Logout">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
