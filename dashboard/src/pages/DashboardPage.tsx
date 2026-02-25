import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { StatsCard } from '@/components/StatsCard';
import { OrderCard } from '@/components/OrderCard';
import { SkeletonStats, SkeletonCard, EmptyState, ErrorState } from '@/components/Skeleton';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';
import { UserPlus, ClipboardList } from 'lucide-react';

export function DashboardPage() {
  const { orders, loading, error, refetch } = useRealtimeOrders();
  const navigate = useNavigate();

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const todayOrders = orders.filter((o) => {
    const today = new Date().toDateString();
    return new Date(o.created_at).toDateString() === today;
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const activeCollectors = new Set(todayOrders.map((o) => o.collector_id)).size;

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold text-gray-800 mb-4">Dashboard</h1>
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <UserPlus size={14} />
            Add Collector
          </button>
          {orders.length > 0 && (
            <button
              onClick={() => navigate(`/orders/${orders[0].id}`)}
              className="flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              <ClipboardList size={14} />
              Latest Order
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <>
          <SkeletonStats />
          <h2 className="text-base font-semibold text-gray-800 mb-3">Recent Orders</h2>
          <SkeletonCard />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatsCard title="Pending Orders" value={pendingOrders.length} color="yellow" />
            <StatsCard title="Today's Orders" value={todayOrders.length} color="blue" />
            <StatsCard title="Today's Revenue" value={formatCurrency(todayRevenue)} color="green" />
            <StatsCard title="Active Collectors" value={activeCollectors} color="blue" subtitle="today" />
          </div>

          <h2 className="text-base font-semibold text-gray-800 mb-3">Recent Orders</h2>
          {orders.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No orders yet"
              description="Orders will appear here when collectors submit them."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {orders.slice(0, 6).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => navigate(`/orders/${order.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
