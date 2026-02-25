import { X } from 'lucide-react';
import type { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { PrintableReceipt } from './PrintableReceipt';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
}

const statusFlow = ['pending', 'confirmed', 'processing', 'completed'];

export function OrderDetailModal({ order, onClose, onStatusChange }: OrderDetailModalProps) {
  const currentStatusIndex = statusFlow.indexOf(order.status);
  const nextStatus = currentStatusIndex < statusFlow.length - 1 ? statusFlow[currentStatusIndex + 1] : null;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Order {order.order_number}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Collector</p>
              <p className="font-medium">{order.profiles?.full_name}</p>
              <p className="text-sm text-gray-400">{order.profiles?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Store</p>
              <p className="font-medium">{order.stores?.name}</p>
              {order.stores?.address && (
                <p className="text-sm text-gray-400">{order.stores.address}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2">{item.product_name}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2 text-right">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={3} className="pt-3 text-right">Total</td>
                  <td className="pt-3 text-right text-blue-600">
                    {formatCurrency(order.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {nextStatus && order.status !== 'cancelled' && (
              <button
                onClick={() => onStatusChange(order.id, nextStatus)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
              >
                Mark as {nextStatus}
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button
                onClick={() => onStatusChange(order.id, 'cancelled')}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100"
              >
                Cancel Order
              </button>
            )}
            <button
              onClick={handlePrint}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 ml-auto"
            >
              Print Receipt
            </button>
          </div>
        </div>

        {/* Hidden printable receipt - visible only in print */}
        <div className="print-receipt-container hidden">
          <PrintableReceipt order={order} />
        </div>
      </div>
    </div>
  );
}
