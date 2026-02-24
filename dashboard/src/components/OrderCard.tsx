import { clsx } from 'clsx';
import type { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800">{order.order_number}</span>
        <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', statusColors[order.status])}>
          {order.status}
        </span>
      </div>
      <div className="text-sm text-gray-500 space-y-1">
        <p>Collector: {order.profiles?.full_name || 'Unknown'}</p>
        <p>Store: {order.stores?.name || 'Unknown'}</p>
        <p>{formatDate(order.created_at)}</p>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-100">
        <span className="text-lg font-bold text-blue-600">
          {formatCurrency(order.total_amount)}
        </span>
      </div>
    </div>
  );
}
