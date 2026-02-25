import { useState, useEffect } from 'react';
import { Plus, Wifi, WifiOff } from 'lucide-react';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { UserDetailModal } from '@/components/UserDetailModal';
import { SkeletonTable, EmptyState } from '@/components/Skeleton';
import type { Profile, ActivationCode } from '@/types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

type UserWithCode = Profile & { activation_code?: ActivationCode | null };

export function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Profile | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithCode | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  async function fetchUsers() {
    try {
      const data = await apiGet<Profile[]>('/users');
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreateUser() {
    if (!email.trim() || !fullName.trim()) {
      setFormError('Email and name are required');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      await apiPost('/users', {
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
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
    setEmail('');
    setFullName('');
    setPhone('');
    setFormError('');
  }

  function isOnline(user: Profile) {
    if (!user.last_seen_at) return false;
    return new Date().getTime() - new Date(user.last_seen_at).getTime() < 5 * 60 * 1000;
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
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name" className="border border-gray-300 rounded-lg px-3 py-2" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" className="border border-gray-300 rounded-lg px-3 py-2" />
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)" className="border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreateUser} disabled={formLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-blue-300">
              {formLoading ? 'Creating...' : 'Create Collector'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
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
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Connected</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={clsx(
                    'border-b hover:bg-gray-50',
                    user.role === 'collector' && 'cursor-pointer'
                  )}
                  onClick={() => handleRowClick(user)}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{user.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === 'collector' ? (
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
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
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
          message={`Are you sure you want to ${toggleTarget.is_active ? 'deactivate' : 'activate'} "${toggleTarget.full_name}"?`}
          confirmLabel={toggleTarget.is_active ? 'Deactivate' : 'Activate'}
          onConfirm={handleToggleActive}
          onCancel={() => setToggleTarget(null)}
        />
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
}
