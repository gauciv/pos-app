import { useState } from 'react';
import { Pencil, Check, X, Building2, Loader2 } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import toast from 'react-hot-toast';

interface FieldDef {
  key: 'company_name' | 'address' | 'contact_phone' | 'contact_email' | 'receipt_footer';
  label: string;
  placeholder: string;
  multiline?: boolean;
}

const fields: FieldDef[] = [
  { key: 'company_name', label: 'Company Name', placeholder: 'Enter company name' },
  { key: 'address', label: 'Address', placeholder: 'Enter company address' },
  { key: 'contact_phone', label: 'Contact Phone', placeholder: 'Enter phone number' },
  { key: 'contact_email', label: 'Contact Email', placeholder: 'Enter email address' },
  { key: 'receipt_footer', label: 'Receipt Footer / Terms', placeholder: 'Enter receipt footer text or terms', multiline: true },
];

type FieldKey = FieldDef['key'];

export function CompanyProfilePage() {
  const { profile, loading, error, updateProfile } = useCompanyProfile();
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  function startEdit(key: FieldKey) {
    setEditingField(key);
    setEditValue((profile as any)?.[key] || '');
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValue('');
  }

  async function saveField(key: FieldKey) {
    setSaving(true);
    try {
      await updateProfile({ [key]: editValue || null });
      toast.success('Updated successfully');
      setEditingField(null);
      setEditValue('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="text-blue-500" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Company Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {fields.map((field, idx) => {
          const isEditing = editingField === field.key;
          const value = (profile as any)?.[field.key];

          return (
            <div
              key={field.key}
              className={`px-6 py-4 ${idx < fields.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">{field.label}</p>
                  {isEditing ? (
                    <div className="flex items-start gap-2">
                      {field.multiline ? (
                        <textarea
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder={field.placeholder}
                          autoFocus
                        />
                      ) : (
                        <input
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder={field.placeholder}
                          autoFocus
                        />
                      )}
                      <button
                        onClick={() => saveField(field.key)}
                        disabled={saving}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className={`text-sm ${value ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                      {value || 'Not set'}
                    </p>
                  )}
                </div>
                {!isEditing && (
                  <button
                    onClick={() => startEdit(field.key)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg mt-4"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {profile?.updated_at && (
        <p className="text-xs text-gray-400 mt-4 text-right">
          Last updated: {new Date(profile.updated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
