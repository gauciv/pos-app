import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { StatsCard } from '@/components/StatsCard';
import { OrderCard } from '@/components/OrderCard';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';

export function DashboardPage() {
  const { orders, loading } = useRealtimeOrders();
  const navigate = useNavigate();

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const todayOrders = orders.filter((o) => {
    const today = new Date().toDateString();
    return new Date(o.created_at).toDateString() === today;
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Pending Orders" value={pendingOrders.length} color="yellow" />
        <StatsCard title="Today's Orders" value={todayOrders.length} color="blue" />
        <StatsCard title="Today's Revenue" value={formatCurrency(todayRevenue)} color="green" />
        <StatsCard title="Total Orders" value={orders.length} color="blue" />
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No orders yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.slice(0, 6).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/orders/${order.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
