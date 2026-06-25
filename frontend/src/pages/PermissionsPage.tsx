import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PermissionsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => api.get('/permissions').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/permissions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission created');
      setShowCreate(false);
      setForm({ name: '', description: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/permissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Permission Management</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> New Permission
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-800 mb-4">New Permission</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Permission Name (e.g., view_reports)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">Save</button>
            <button onClick={() => setShowCreate(false)} className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded-lg text-sm border transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : permissions?.map((perm: any) => (
              <tr key={perm.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4"><code className="px-2 py-1 bg-gray-100 rounded text-sm">{perm.name}</code></td>
                <td className="px-6 py-4 text-gray-600">{perm.description || '-'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => deleteMutation.mutate(perm.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
