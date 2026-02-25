import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { OrderCard } from '@/components/OrderCard';
import { PrintableReceipt } from '@/components/PrintableReceipt';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/Skeleton';
import { clsx } from 'clsx';
import type { Order } from '@/types';

const statusFilters = ['all', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'];

export function OrdersPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoPrint, setAutoPrint] = useState(() =>
    localStorage.getItem('autoPrintOrders') === 'true'
  );
  const [autoPrintOrder, setAutoPrintOrder] = useState<Order | null>(null);
  const printTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleNewOrder = useCallback(
    (orderId: string) => {
      if (!autoPrint) return;
      // Find the order from the freshly refetched list
      // We need to defer slightly so the state has updated after refetch
      setTimeout(() => {
        setAutoPrintOrder((prev) => {
          // Will be set in the effect below via orders lookup
          return prev;
        });
      }, 0);
      // Store the order ID so we can look it up after orders state updates
      pendingPrintIdRef.current = orderId;
    },
    [autoPrint]
  );

  const pendingPrintIdRef = useRef<string | null>(null);

  const { orders, loading, error, refetch } = useRealtimeOrders({
    onNewOrder: handleNewOrder,
  });

  // When orders update and there's a pending print, find the order and set it for printing
  useEffect(() => {
    if (pendingPrintIdRef.current && autoPrint) {
      const order = orders.find((o) => o.id === pendingPrintIdRef.current);
      if (order) {
        pendingPrintIdRef.current = null;
        setAutoPrintOrder(order);
      }
    }
  }, [orders, autoPrint]);

  // Trigger print when autoPrintOrder is set
  useEffect(() => {
    if (!autoPrintOrder) return;
    // Small delay to allow the hidden receipt to render
    printTimeoutRef.current = setTimeout(() => {
      window.print();
      setAutoPrintOrder(null);
    }, 300);
    return () => {
      if (printTimeoutRef.current) clearTimeout(printTimeoutRef.current);
    };
  }, [autoPrintOrder]);

  function toggleAutoPrint() {
    const next = !autoPrint;
    setAutoPrint(next);
    localStorage.setItem('autoPrintOrders', String(next));
  }

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">Orders</h1>
        <button
          onClick={toggleAutoPrint}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            autoPrint
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Printer size={14} />
          Auto-Print {autoPrint ? 'On' : 'Off'}
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              statusFilter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-1.5 text-xs">
                ({orders.filter((o) => o.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : loading ? (
        <SkeletonCard />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No orders found"
          description="No orders match this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/orders/${order.id}`)}
            />
          ))}
        </div>
      )}

      {/* Hidden auto-print receipt */}
      {autoPrintOrder && (
        <div className="print-receipt-container hidden">
          <PrintableReceipt order={autoPrintOrder} />
        </div>
      )}
    </div>
  );
}
