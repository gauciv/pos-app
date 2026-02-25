import { Pencil, Trash2, Package } from 'lucide-react';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { clsx } from 'clsx';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-gray-500">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium text-right">Price</th>
            <th className="px-4 py-3 font-medium text-right">Stock</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-400 truncate max-w-xs">{product.description}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">{product.sku || '—'}</td>
              <td className="px-4 py-3 text-gray-600">{product.categories?.name || '—'}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(product.price)}</td>
              <td className="px-4 py-3 text-right">
                <span
                  className={clsx(
                    'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                    product.stock_quantity <= 0
                      ? 'bg-red-100 text-red-700'
                      : product.stock_quantity < 10
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  )}
                >
                  {product.stock_quantity}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
