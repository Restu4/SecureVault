import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, UserX } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ fullname: '', email: '', password: '', roleId: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => api.get('/users', { params: { page, limit: 10, search } }).then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (userData: typeof form) => api.post('/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
      setShowCreate(false);
      setForm({ fullname: '', email: '', password: '', roleId: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create user'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated');
    },
    onError: (err: any) => toast.error('Failed to deactivate user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (err: any) => toast.error('Failed to delete user'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users by name or email..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Create New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            <input type="text" placeholder="Role ID (optional)" value={form.roleId} onChange={e => setForm({ ...form, roleId: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded-lg text-sm border transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Last Login</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : data?.users?.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No users found</td></tr>
            ) : data?.users?.map((user: any) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{user.fullname}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{user.status}</span>
                  {user.isLocked && <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Locked</span>}
                </td>
                <td className="px-6 py-4 text-gray-500">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deactivateMutation.mutate(user.id)} className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title="Deactivate">
                      <UserX className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.total > 10 && (
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <span className="text-sm text-gray-500">Total: {data.total} users</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= data.total}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
