import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export function CategoriesPage() {
  const { categories, createCategory, updateCategory, deleteCategory } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  function openAdd() {
    setEditTarget(null);
    setName('');
    setDescription('');
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editTarget) {
        await updateCategory(editTarget.id, { name: name.trim(), description: description.trim() || undefined });
        toast.success('Category updated');
      } else {
        await createCategory({ name: name.trim(), description: description.trim() || undefined });
        toast.success('Category created');
      }
      setShowForm(false);
    } catch {
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
    setDeleteTarget(null);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold mb-3">{editTarget ? 'Edit Category' : 'New Category'}</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No categories yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.description || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-blue-500">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(cat)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
