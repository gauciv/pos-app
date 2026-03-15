import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

function StockBadge({ qty }: { qty: number }) {
  const cls =
    qty <= 0
      ? 'bg-red-100 text-red-600'
      : qty <= 10
      ? 'bg-amber-100 text-amber-700'
      : 'bg-green-100 text-green-700';
  return (
    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', cls)}>
      {qty}
    </span>
  );
}

export function ProductsPage() {
  const {
    products,
    total,
    totalPages,
    loading,
    error,
    deleteProduct,
    fetchProducts,
  } = useProducts();

  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts({ page, search: search || undefined });
  }, [page, search, fetchProducts]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
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
    <div className="p-3 bg-background min-h-full">
      {/* Header row */}
      <div className="flex items-center justify-end mb-3 gap-2 flex-wrap">
        <button
          onClick={() => navigate('/products/new')}
          className="bg-primary text-white text-xs px-3 py-1.5 rounded-md hover:bg-primary/90 flex items-center gap-1.5 transition-colors"
        >
          <Plus size={13} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-2 mb-3 flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-7 pr-3 border border-input rounded-md py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-xs text-red-500 mb-2">{error}</p>
            <button
              onClick={() => fetchProducts({ page, search: search || undefined })}
              className="text-xs text-primary font-medium"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse py-1">
                <div className="h-3 bg-gray-200 rounded flex-1" />
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No products found</p>
            <button
              onClick={() => navigate('/products/new')}
              className="mt-2 text-xs text-primary hover:text-primary/80 font-medium"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border bg-secondary">
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => (
                    <tr
                      key={product.id}
                      className={cn(
                        'border-b border-border transition-colors hover:bg-primary/5',
                        i % 2 === 1 ? 'bg-muted/50' : 'bg-card'
                      )}
                    >
                      <td className="px-3 py-2 text-[10px] font-mono text-muted-foreground">
                        {product.sku || '—'}
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs text-foreground font-medium">{product.name}</p>
                      </td>
                      <td className="px-3 py-2 text-xs font-semibold text-foreground text-right font-mono tabular-nums">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StockBadge qty={product.stock_quantity} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] font-medium',
                            product.is_active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-500',
                          )}
                        >
                          {product.is_active ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="Edit product"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-border text-xs text-muted-foreground">
              <span>{total} products</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="px-2 py-1 rounded border border-input hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-2 py-1 rounded border border-input hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete single product confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to permanently delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
