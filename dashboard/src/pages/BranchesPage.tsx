import { useState, useEffect } from 'react';
import { Plus, MapPin, Users, Clock } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { SkeletonTable, EmptyState } from '@/components/Skeleton';
import type { Branch } from '@/types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  async function fetchBranches() {
    try {
      const data = await apiGet<Branch[]>('/branches');
      setBranches(data);
    } catch {
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBranches();
  }, []);

  function resetForm() {
    setName('');
    setLocation('');
    setFormError('');
    setEditingId(null);
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setFormError('Branch name is required');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      if (editingId) {
        await apiPut(`/branches/${editingId}`, {
          name: name.trim(),
          location: location.trim() || null,
        });
        toast.success('Branch updated');
      } else {
        await apiPost('/branches', {
          name: name.trim(),
          location: location.trim() || null,
        });
        toast.success('Branch created');
      }
      setShowForm(false);
      resetForm();
      await fetchBranches();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save branch');
    } finally {
      setFormLoading(false);
    }
  }

  function handleEdit(branch: Branch) {
    setName(branch.name);
    setLocation(branch.location || '');
    setEditingId(branch.id);
    setShowForm(true);
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">Branches</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Branch
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold mb-3">{editingId ? 'Edit Branch' : 'New Branch'}</h3>
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-600 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Branch name"
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubmit}
              disabled={formLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-blue-300"
            >
              {formLoading ? 'Saving...' : editingId ? 'Update Branch' : 'Create Branch'}
            </button>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : branches.length === 0 ? (
          <EmptyState
            icon="🏢"
            title="No branches yet"
            description="Create a branch to organize your collectors."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Collectors</th>
                <th className="px-4 py-3 font-medium">Last Order</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{branch.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      {branch.location ? (
                        <>
                          <MapPin size={14} className="text-gray-400" />
                          <span>{branch.location}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      <span>{branch.collector_count ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" />
                      <span>
                        {branch.last_order_at
                          ? formatDistanceToNow(new Date(branch.last_order_at), { addSuffix: true })
                          : 'No orders'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
