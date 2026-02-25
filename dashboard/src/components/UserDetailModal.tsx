import { useState } from 'react';
import { X, Copy, RefreshCw, Check, Wifi, WifiOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiPost, apiGet } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import type { Profile, ActivationCode } from '@/types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface UserDetailModalProps {
  user: Profile & { activation_code?: ActivationCode | null };
  onClose: () => void;
  onUpdated: () => void;
}

export function UserDetailModal({ user, onClose, onUpdated }: UserDetailModalProps) {
  const [activationCode, setActivationCode] = useState<ActivationCode | null>(
    user.activation_code || null
  );
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOnline = user.last_seen_at
    ? new Date().getTime() - new Date(user.last_seen_at).getTime() < 5 * 60 * 1000
    : false;

  const isConnected = !!user.device_connected_at;

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const result = await apiPost<{ code: string }>(`/users/${user.id}/regenerate-code`, {});
      // Refetch user detail to get the full activation code object
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Collector Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="text-sm font-medium text-gray-800">{user.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-800">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm text-gray-800">{user.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Account Status</p>
              <span
                className={clsx(
                  'inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5',
                  user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                )}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
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
                  {/* Code display */}
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

                  {/* QR Code */}
                  <div className="flex justify-center mb-3">
                    <div className="bg-white p-3 border rounded-lg">
                      <QRCodeSVG value={activationCode.code} size={160} />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-center mb-3">
                    Expires {formatDistanceToNow(new Date(activationCode.expires_at), { addSuffix: true })}
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
