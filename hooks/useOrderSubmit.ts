import { useState } from 'react';
import { createOrder } from '@/services/orders.service';
import { useCart } from '@/lib/cart';
import type { CreateOrderResponse } from '@/types';

export function useOrderSubmit() {
  const { items, storeId, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitOrder(notes?: string): Promise<CreateOrderResponse | null> {
    if (!storeId || items.length === 0) {
      setError('No store selected or cart is empty');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createOrder({
        store_id: storeId,
        notes,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });
      clearCart();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to submit order');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { submitOrder, loading, error };
}
