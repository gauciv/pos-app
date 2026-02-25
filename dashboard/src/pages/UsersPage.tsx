import { useState, useEffect } from 'react';
import { Plus, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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
  const [showForm, setShowForm] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Profile | null>(null);
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
      setShowForm(false);
      resetForm();
      await fetchUsers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create collector');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleActive() {
    if (!toggleTarget) return;
    try {
      await apiPatch(`/users/${toggleTarget.id}/activate?is_active=${!toggleTarget.is_active}`, {});
      toast.success(toggleTarget.is_active ? 'User deactivated' : 'User activated');
      await fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
    setToggleTarget(null);
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

  function getBranchName(branchId: string | null) {
    if (!branchId) return null;
    return branches.find((b) => b.id === branchId)?.name || null;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">Collectors</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Collector
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold mb-3">New Collector</h3>
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-600 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nickname"
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <div>
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
                  onClick={() => navigate('/branches')}
                  className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                >
                  No branches yet - create one first
                </button>
              )}
            </div>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Tag (optional)"
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreateUser}
              disabled={formLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-blue-300"
            >
              {formLoading ? 'Creating...' : 'Create Collector'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : users.length === 0 ? (
          <EmptyState
            icon="👥"
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
                    <button
                      onClick={(e) => { e.stopPropagation(); setToggleTarget(user); }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toggleTarget && (
        <ConfirmDialog
          title={toggleTarget.is_active ? 'Deactivate User' : 'Activate User'}
          message={`Are you sure you want to ${toggleTarget.is_active ? 'deactivate' : 'activate'} "${toggleTarget.nickname || toggleTarget.full_name}"?`}
          confirmLabel={toggleTarget.is_active ? 'Deactivate' : 'Activate'}
          onConfirm={handleToggleActive}
          onCancel={() => setToggleTarget(null)}
        />
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
