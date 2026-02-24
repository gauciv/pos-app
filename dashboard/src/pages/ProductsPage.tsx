import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ProductTable } from '@/components/ProductTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/Skeleton';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export function ProductsPage() {
  const { products, loading, error, deleteProduct, fetchProducts } = useProducts();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    fetchProducts(value || undefined);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
    setDeleteTarget(null);
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">Products</h1>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {error ? (
          <ErrorState message={error} onRetry={() => fetchProducts()} />
        ) : loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No products yet"
            description="Add your first product to get started."
            action={
              <button
                onClick={() => navigate('/products/new')}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Add Product
              </button>
            }
          />
        ) : (
          <ProductTable
            products={products}
            onEdit={(product) => navigate(`/products/${product.id}/edit`)}
            onDelete={(product) => setDeleteTarget(product)}
          />
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will mark it as inactive.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
