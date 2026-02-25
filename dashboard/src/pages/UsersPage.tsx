import { useState, useEffect } from 'react';
import { Plus, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { UserDetailModal } from '@/components/UserDetailModal';
import { SkeletonTable, EmptyState } from '@/components/Skeleton';
import type { Profile, ActivationCode, Branch } from '@/types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

type UserWithCode = Profile & { activation_code?: ActivationCode | null };

export function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Profile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithCode | null>(null);

  // Form state
  const [nickname, setNickname] = useState('');
  const [branchId, setBranchId] = useState('');
  const [tag, setTag] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  async function fetchUsers() {
    try {
      const data = await apiGet<Profile[]>('/users');
      setUsers(data.filter((u) => u.role === 'collector'));
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBranches() {
    try {
      const data = await apiGet<Branch[]>('/branches');
      setBranches(data);
    } catch {
      // Non-critical, branches may not exist yet
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchBranches();

    // Poll for status updates every 15 seconds
    const interval = setInterval(() => {
      fetchUsers();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleCreateUser() {
    if (!nickname.trim()) {
      setFormError('Nickname is required');
      return;
    }
    if (!branchId) {
      setFormError('A branch is required. Please select or create one first.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      await apiPost('/users', {
        nickname: nickname.trim(),
        branch_id: branchId,
        tag: tag.trim() || undefined,
      });
      toast.success('Collector created');
      setShowCreateModal(false);
      resetForm();
      await fetchUsers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create collector');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    try {
      await apiPatch(`/users/${deactivateTarget.id}/activate?is_active=false`, {});
      toast.success('User deactivated');
      await fetchUsers();
    } catch {
      toast.error('Failed to deactivate user');
    }
    setDeactivateTarget(null);
  }

  async function handleActivate(user: Profile) {
    try {
      await apiPatch(`/users/${user.id}/activate?is_active=true`, {});
      toast.success('User activated');
      await fetchUsers();
    } catch {
      toast.error('Failed to activate user');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const expectedName = deleteTarget.nickname || deleteTarget.full_name;
    if (deleteConfirmName !== expectedName) {
      toast.error('Name does not match. Please type the exact collector name.');
      return;
    }
    try {
      await apiDelete(`/users/${deleteTarget.id}`);
      toast.success('Collector deleted');
      await fetchUsers();
    } catch {
      toast.error('Failed to delete collector');
    }
    setDeleteTarget(null);
    setDeleteConfirmName('');
  }

  async function handleRowClick(user: Profile) {
    if (user.role !== 'collector') return;
    try {
      const detail = await apiGet<UserWithCode>(`/users/${user.id}`);
      setSelectedUser(detail);
    } catch {
      toast.error('Failed to load user details');
    }
  }

  function resetForm() {
    setNickname('');
    setBranchId('');
    setTag('');
    setFormError('');
  }

  function isOnline(user: Profile) {
    if (!user.last_seen_at) return false;
    return new Date().getTime() - new Date(user.last_seen_at).getTime() < 5 * 60 * 1000;
  }

  function getBranchName(id: string | null) {
    if (!id) return null;
    return branches.find((b) => b.id === id)?.name || null;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">Collectors</h1>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Collector
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : users.length === 0 ? (
          <EmptyState
            icon="users"
            title="No collectors found"
            description="Add collectors to manage your team."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Nickname</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Connected</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(user)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {user.display_id || user.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {user.nickname || user.full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getBranchName(user.branch_id) || (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {user.device_connected_at ? (
                        <>
                          {isOnline(user) ? (
                            <Wifi size={14} className="text-green-500" />
                          ) : (
                            <WifiOff size={14} className="text-gray-400" />
                          )}
                          <span className={clsx(
                            'text-xs',
                            isOnline(user) ? 'text-green-600' : 'text-gray-400'
                          )}>
                            {isOnline(user) ? 'Online' : 'Offline'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Not connected</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {user.is_active ? (
                        <button
                          onClick={() => setDeactivateTarget(user)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleActivate(user)}
                            className="text-sm text-blue-500 hover:text-blue-700"
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(user); setDeleteConfirmName(''); }}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Collector Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">New Collector</h3>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-600 text-sm">
                {formError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter nickname"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">Select branch...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {branches.length === 0 && (
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); navigate('/branches'); }}
                    className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                  >
                    No branches yet - create one first
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag (optional)</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Enter tag"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={formLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              >
                {formLoading ? 'Creating...' : 'Create Collector'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate confirmation */}
      {deactivateTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Deactivate User</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to deactivate "{deactivateTarget.nickname || deactivateTarget.full_name}"?
              They will be logged out of the mobile app and unable to sign in.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeactivateTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation with name entry */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Collector</h3>
            <p className="text-sm text-gray-500 mb-4">
              This action is permanent and cannot be undone. To confirm, type the
              collector's name: <strong>{deleteTarget.nickname || deleteTarget.full_name}</strong>
            </p>
            <input
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Type collector name to confirm"
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
                disabled={deleteConfirmName !== (deleteTarget.nickname || deleteTarget.full_name)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          branches={branches}
          onClose={() => setSelectedUser(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
}
