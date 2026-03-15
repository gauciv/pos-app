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
      ? 'bg-[#E06C75]/10 text-[#E06C75]'
      : qty <= 10
      ? 'bg-[#E5C07B]/10 text-[#E5C07B]'
      : 'bg-[#98C379]/10 text-[#98C379]';
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
    <div className="p-3 bg-[#0D1F33] min-h-full">
      <div className="flex items-center justify-end mb-3 gap-2 flex-wrap">
        <button
          onClick={() => navigate('/products/new')}
          className="bg-[#5B9BD5] text-white text-xs px-3 py-1.5 rounded-md hover:bg-[#4A8BC4] flex items-center gap-1.5 transition-colors"
        >
          <Plus size={13} />
          Add Product
        </button>
      </div>

      <div className="bg-[#162F4D] border border-[#1E3F5E]/60 rounded-lg p-2 mb-3 flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8FAABE]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-7 pr-3 border border-[#1E3F5E]/60 rounded-md py-1.5 text-xs bg-[#0D1F33] text-[#E8EDF2] placeholder-[#8FAABE]/40 focus:outline-none focus:ring-2 focus:ring-[#5B9BD5]"
          />
        </div>
      </div>

      <div className="bg-[#162F4D] border border-[#1E3F5E]/60 rounded-lg overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-xs text-[#E06C75] mb-2">{error}</p>
            <button onClick={() => fetchProducts({ page, search: search || undefined })} className="text-xs text-[#5B9BD5] hover:text-[#7EB8E0] font-medium">Retry</button>
          </div>
        ) : loading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse py-1">
                <div className="h-3 bg-[#1A3755] rounded flex-1" />
                <div className="h-3 bg-[#1A3755] rounded w-20" />
                <div className="h-3 bg-[#1A3755] rounded w-16" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={24} className="text-[#8FAABE]/30 mx-auto mb-2" />
            <p className="text-xs text-[#8FAABE]/50">No products found</p>
            <button onClick={() => navigate('/products/new')} className="mt-2 text-xs text-[#5B9BD5] hover:text-[#7EB8E0] font-medium">Add your first product</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#1E3F5E]/60 bg-[#1A3755]/50">
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-[#8FAABE]/60 uppercase tracking-wider">SKU</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-[#8FAABE]/60 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-[#8FAABE]/60 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-[#8FAABE]/60 uppercase tracking-wider">Stock</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-[#8FAABE]/60 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-[#8FAABE]/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => (
                    <tr
                      key={product.id}
                      className={cn(
                        'border-b border-[#1E3F5E]/30 transition-colors hover:bg-[#1A3755]/40',
                        i % 2 === 1 ? 'bg-[#0D1F33]/30' : ''
                      )}
                    >
                      <td className="px-3 py-2 text-[10px] font-mono text-[#8FAABE]/50">{product.sku || '—'}</td>
                      <td className="px-3 py-2"><p className="text-xs text-[#E8EDF2] font-medium">{product.name}</p></td>
                      <td className="px-3 py-2 text-xs font-semibold text-[#E8EDF2] text-right font-mono tabular-nums">{formatCurrency(product.price)}</td>
                      <td className="px-3 py-2 text-center"><StockBadge qty={product.stock_quantity} /></td>
                      <td className="px-3 py-2 text-center">
                        <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', product.is_active ? 'bg-[#98C379]/10 text-[#98C379]' : 'bg-[#8FAABE]/10 text-[#8FAABE]/50')}>
                          {product.is_active ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => navigate(`/products/${product.id}/edit`)} className="text-[#8FAABE]/40 hover:text-[#5B9BD5] transition-colors" title="Edit product"><Pencil size={13} /></button>
                          <button onClick={() => setDeleteTarget(product)} className="text-[#8FAABE]/40 hover:text-[#E06C75] transition-colors" title="Delete product"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-3 py-2 border-t border-[#1E3F5E]/60 text-xs text-[#8FAABE]/50">
              <span>{total} products</span>
              <div className="flex items-center gap-2">
                <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="px-2 py-1 rounded border border-[#1E3F5E]/60 text-[#8FAABE]/70 hover:bg-[#1A3755] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Prev</button>
                <span className="text-[#8FAABE]/70">Page {page} of {totalPages}</span>
                <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="px-2 py-1 rounded border border-[#1E3F5E]/60 text-[#8FAABE]/70 hover:bg-[#1A3755] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

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
