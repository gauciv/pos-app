import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPatch } from '@/lib/api';
import { OrderDetailModal } from '@/components/OrderDetailModal';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await apiGet<Order>(`/orders/${id}`);
        setOrder(data);
      } catch {
        toast.error('Failed to load order');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, navigate]);

  async function handleStatusChange(orderId: string, status: string) {
    try {
      await apiPatch(`/orders/${orderId}/status`, { status });
      setOrder((prev) => prev ? { ...prev, status: status as Order['status'] } : null);
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <OrderDetailModal
      order={order}
      onClose={() => navigate('/orders')}
      onStatusChange={handleStatusChange}
    />
  );
}
