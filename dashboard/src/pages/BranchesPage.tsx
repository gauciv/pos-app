import { useState, useEffect } from 'react';
import { Plus, MapPin, Users, Clock, ChevronDown, ChevronUp, Wifi, WifiOff } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { SkeletonTable, EmptyState } from '@/components/Skeleton';
import type { Branch, Profile } from '@/types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [branchCollectors, setBranchCollectors] = useState<Record<string, Profile[]>>({});
  const [loadingCollectors, setLoadingCollectors] = useState<string | null>(null);

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

  async function handleDelete() {
    if (!deleteTarget) return;
    if (deleteConfirmName !== deleteTarget.name) {
      toast.error('Name does not match. Please type the exact branch name.');
      return;
    }
    try {
      await apiDelete(`/branches/${deleteTarget.id}`);
      toast.success('Branch deleted');
      await fetchBranches();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete branch');
    }
    setDeleteTarget(null);
    setDeleteConfirmName('');
  }

  async function toggleBranchExpand(branchId: string) {
    if (expandedBranch === branchId) {
      setExpandedBranch(null);
      return;
    }

    setExpandedBranch(branchId);

    if (!branchCollectors[branchId]) {
      setLoadingCollectors(branchId);
      try {
        const collectors = await apiGet<Profile[]>(`/branches/${branchId}/collectors`);
        setBranchCollectors((prev) => ({ ...prev, [branchId]: collectors }));
      } catch {
        toast.error('Failed to load collectors');
      } finally {
        setLoadingCollectors(null);
      }
    }
  }

  function isOnline(user: Profile) {
    if (!user.last_seen_at) return false;
    return new Date().getTime() - new Date(user.last_seen_at).getTime() < 5 * 60 * 1000;
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
          <SkeletonTable rows={5} cols={5} />
        ) : branches.length === 0 ? (
          <EmptyState
            icon="building"
            title="No branches yet"
            description="Create a branch to organize your collectors."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Collectors</th>
                <th className="px-4 py-3 font-medium">Last Order</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <>
                  <tr
                    key={branch.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleBranchExpand(branch.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {branch.display_id || branch.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-1.5">
                        {expandedBranch === branch.id ? (
                          <ChevronUp size={14} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={14} className="text-gray-400" />
                        )}
                        <span>{branch.name}</span>
                      </div>
                    </td>
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
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(branch)}
                          className="text-sm text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if ((branch.collector_count ?? 0) > 0) {
                              toast.error(`Cannot delete "${branch.name}" — it has ${branch.collector_count} collector(s). Remove them first.`);
                              return;
                            }
                            setDeleteTarget(branch);
                            setDeleteConfirmName('');
                          }}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedBranch === branch.id && (
                    <tr key={`${branch.id}-collectors`} className="border-b">
                      <td colSpan={6} className="px-4 py-3 bg-gray-50">
                        {loadingCollectors === branch.id ? (
                          <p className="text-sm text-gray-500 py-2">Loading collectors...</p>
                        ) : (branchCollectors[branch.id] || []).length === 0 ? (
                          <p className="text-sm text-gray-400 py-2">No collectors in this branch</p>
                        ) : (
                          <div className="space-y-2">
                            {(branchCollectors[branch.id] || []).map((c) => (
                              <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs text-gray-400">{c.display_id || c.id.slice(0, 8)}</span>
                                  <span className="text-sm font-medium text-gray-800">{c.nickname || c.full_name}</span>
                                  {c.tag && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{c.tag}</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    {c.device_connected_at ? (
                                      isOnline(c) ? (
                                        <><Wifi size={12} className="text-green-500" /><span className="text-xs text-green-600">Online</span></>
                                      ) : (
                                        <><WifiOff size={12} className="text-gray-400" /><span className="text-xs text-gray-400">Offline</span></>
                                      )
                                    ) : (
                                      <span className="text-xs text-gray-400">Not connected</span>
                                    )}
                                  </div>
                                  <span className={clsx(
                                    'px-2 py-0.5 rounded-full text-xs font-medium',
                                    c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  )}>
                                    {c.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation with name entry */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Branch</h3>
            <p className="text-sm text-gray-500 mb-4">
              This action is permanent. To confirm, type the branch name: <strong>{deleteTarget.name}</strong>
            </p>
            <input
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Type branch name to confirm"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteConfirmName(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmName !== deleteTarget.name}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
