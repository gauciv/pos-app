import { useState, useRef } from 'react';
import { X, Copy, RefreshCw, Check, Wifi, WifiOff, Pencil } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import type { Profile, ActivationCode } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserDetailModalProps {
  user: Profile & { activation_code?: ActivationCode | null };
  onClose: () => void;
  onUpdated: () => void;
}

const CODE_CHARSET = '23456789ACDEFGHJKMNPQRSTUVWXYZ';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARSET[Math.floor(Math.random() * CODE_CHARSET.length)];
  }
  return code;
}

export function UserDetailModal({ user, onClose, onUpdated }: UserDetailModalProps) {
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
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: editValue.trim() || null })
        .eq('id', user.id);
      if (error) throw error;
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
      // Invalidate old codes
      await supabase
        .from('activation_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_used', false);

      // Insert new code
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from('activation_codes')
        .insert({ user_id: user.id, code, expires_at: expiresAt })
        .select()
        .single();
      if (error) throw error;
      setActivationCode(data as ActivationCode);
      toast.success('Activation code regenerated');
      onUpdated();
    } catch {
      toast.error('Failed to regenerate code');
    } finally {
      setRegenerating(false);
    }
  }

  async function handleClose() {
    // Invalidate any unused activation code when modal closes
    if (activationCode && !activationCode.is_used) {
      try {
        await supabase
          .from('activation_codes')
          .update({ is_used: true, used_at: new Date().toISOString() })
          .eq('id', activationCode.id)
          .eq('is_used', false);
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
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
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
              className="border border-input rounded-md px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={saving}
            />
            <button
              onClick={() => saveField(field)}
              disabled={saving}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => setEditingField(null)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group">
            <p className="text-xs font-medium text-foreground">{value || 'Not set'}</p>
            <button
              onClick={() => startEditing(field, value || '')}
              className="p-0.5 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil size={11} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Collector Details</h2>
            {user.display_id && (
              <p className="text-[10px] font-mono text-muted-foreground">{user.display_id}</p>
            )}
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Collector Info */}
          <div className="grid grid-cols-2 gap-3">
            <EditableField label="Nickname" field="nickname" value={user.nickname || user.full_name} />
            <EditableField label="Tag" field="tag" value={user.tag || ''} />
          </div>

          {/* Status */}
          <div>
            <Badge variant={user.is_active ? 'success' : 'secondary'}>
              {user.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Connection & Online Status */}
          <div className="bg-secondary rounded-lg p-3 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Connection Status</span>
              <span
                className={cn(
                  'text-xs font-medium',
                  isConnected ? 'text-green-600' : 'text-muted-foreground'
                )}
              >
                {isConnected ? 'Connected' : 'Not connected'}
              </span>
            </div>
            {isConnected && user.device_connected_at && (
              <p className="text-[10px] text-muted-foreground">
                Connected {formatDistanceToNow(new Date(user.device_connected_at), { addSuffix: true })}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Online Status</span>
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <>
                    <Wifi size={12} className="text-green-500" />
                    <span className="text-xs font-medium text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
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
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3">Activation Code</h3>

              {activationCode && !activationCode.is_used ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="bg-muted px-4 py-2 rounded-lg text-2xl font-mono font-bold tracking-widest text-primary flex-1 text-center">
                      {activationCode.code}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="p-2 text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                      title="Copy code"
                    >
                      {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                  </div>

                  <div className="flex justify-center mb-3">
                    <div className="bg-card p-3 border border-border rounded-lg">
                      <QRCodeSVG value={activationCode.code} size={160} />
                    </div>
                  </div>

                  <p className="text-[10px] text-amber-600 text-center mb-3">
                    This code will be invalidated when this modal is closed
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center mb-3">
                  {activationCode?.is_used ? 'Code has been used' : 'No active code'}
                </p>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                <RefreshCw size={13} className={regenerating ? 'animate-spin' : ''} />
                {regenerating ? 'Regenerating...' : 'Regenerate Code'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
