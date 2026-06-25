import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RolesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created');
      setShowCreate(false);
      setForm({ name: '', description: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted');
    },
    onError: (err: any) => toast.error('Failed to delete role'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-800 mb-4">New Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Role Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? <p className="text-gray-500">Loading...</p> : roles?.map((role: any) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{role.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{role.description || 'No description'}</p>
              </div>
              <button onClick={() => deleteMutation.mutate(role.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {role.rolePermissions?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role.rolePermissions.map((rp: any) => (
                  <span key={rp.id} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                    {rp.permission?.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
