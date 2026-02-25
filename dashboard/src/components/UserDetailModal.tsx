import { useState, useRef } from 'react';
import { X, Copy, RefreshCw, Check, Wifi, WifiOff, Pencil } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiPost, apiGet, apiPut } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import type { Profile, ActivationCode, Branch } from '@/types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface UserDetailModalProps {
  user: Profile & { activation_code?: ActivationCode | null };
  branches: Branch[];
  onClose: () => void;
  onUpdated: () => void;
}

export function UserDetailModal({ user, branches, onClose, onUpdated }: UserDetailModalProps) {
  const [activationCode, setActivationCode] = useState<ActivationCode | null>(
    user.activation_code || null
  );
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Inline editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOnline = user.last_seen_at
    ? new Date().getTime() - new Date(user.last_seen_at).getTime() < 5 * 60 * 1000
    : false;

  const isConnected = !!user.device_connected_at;

  const branchName = user.branch_id
    ? branches.find((b) => b.id === user.branch_id)?.name || 'Unknown'
    : 'Unassigned';

  const branchLocation = user.branch_id
    ? branches.find((b) => b.id === user.branch_id)?.location || null
    : null;

  function startEditing(field: string, value: string) {
    setEditingField(field);
    setEditValue(value);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function saveField(field: string) {
    if (!editValue.trim() && field === 'nickname') {
      toast.error('Nickname cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await apiPut(`/users/${user.id}`, { [field]: editValue.trim() || null });
      toast.success('Updated');
      setEditingField(null);
      onUpdated();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await apiPost<{ code: string }>(`/users/${user.id}/regenerate-code`, {});
      const updatedUser = await apiGet<Profile & { activation_code?: ActivationCode | null }>(
        `/users/${user.id}`
      );
      setActivationCode(updatedUser.activation_code || null);
      toast.success('Activation code regenerated');
      onUpdated();
    } catch {
      toast.error('Failed to regenerate code');
    } finally {
      setRegenerating(false);
    }
  }

  async function handleClose() {
    // Always invalidate any unused activation code when modal closes
    if (activationCode && !activationCode.is_used) {
      try {
        await apiPost(`/users/${user.id}/invalidate-code`, {});
      } catch {
        // Non-critical, don't block close
      }
    }
    onClose();
  }

  async function handleCopy() {
    if (!activationCode?.code) return;
    try {
      await navigator.clipboard.writeText(activationCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }

  function EditableField({ label, field, value }: { label: string; field: string; value: string }) {
    const isEditing = editingField === field;

    return (
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveField(field);
                if (e.key === 'Escape') setEditingField(null);
              }}
              className="border border-blue-300 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              disabled={saving}
            />
            <button
              onClick={() => saveField(field)}
              disabled={saving}
              className="p-1 text-blue-500 hover:text-blue-700"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => setEditingField(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group">
            <p className="text-sm font-medium text-gray-800">{value || 'Not set'}</p>
            <button
              onClick={() => startEditing(field, value || '')}
              className="p-0.5 text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Collector Details</h2>
            {user.display_id && (
              <p className="text-xs font-mono text-gray-400">{user.display_id}</p>
            )}
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Collector Info */}
          <div className="grid grid-cols-2 gap-3">
            <EditableField label="Nickname" field="nickname" value={user.nickname || user.full_name} />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Branch</p>
              <p className="text-sm font-medium text-gray-800">{branchName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Location</p>
              <p className="text-sm text-gray-800">{branchLocation || 'Not set'}</p>
            </div>
            <EditableField label="Tag" field="tag" value={user.tag || ''} />
          </div>

          {/* Status */}
          <div>
            <span
              className={clsx(
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              )}
            >
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Connection & Online Status */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Connection Status</span>
              <span
                className={clsx(
                  'text-xs font-medium',
                  isConnected ? 'text-green-600' : 'text-gray-400'
                )}
              >
                {isConnected ? 'Connected' : 'Not connected'}
              </span>
            </div>
            {isConnected && user.device_connected_at && (
              <p className="text-xs text-gray-400">
                Connected {formatDistanceToNow(new Date(user.device_connected_at), { addSuffix: true })}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Online Status</span>
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <>
                    <Wifi size={12} className="text-green-500" />
                    <span className="text-xs font-medium text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-400">
                      {user.last_seen_at
                        ? `Last seen ${formatDistanceToNow(new Date(user.last_seen_at), { addSuffix: true })}`
                        : 'Never'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Activation Code */}
          {user.role === 'collector' && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Activation Code</h3>

              {activationCode && !activationCode.is_used ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="bg-gray-100 px-4 py-2 rounded-lg text-2xl font-mono font-bold tracking-widest text-blue-600 flex-1 text-center">
                      {activationCode.code}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="p-2 text-gray-400 hover:text-gray-600 border rounded-lg"
                      title="Copy code"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <div className="flex justify-center mb-3">
                    <div className="bg-white p-3 border rounded-lg">
                      <QRCodeSVG value={activationCode.code} size={160} />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-center mb-3">
                    Expires {formatDistanceToNow(new Date(activationCode.expires_at), { addSuffix: true })}
                  </p>

                  <p className="text-xs text-amber-500 text-center mb-3">
                    This code will be invalidated the moment this modal is closed
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center mb-3">
                  {activationCode?.is_used ? 'Code has been used' : 'No active code'}
                </p>
              )}

              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
              >
                <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
                {regenerating ? 'Regenerating...' : 'Regenerate Code'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
