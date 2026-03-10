import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '@/services/products.service';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await getProducts({
        search: search || undefined,
        category_id: categoryFilter || undefined,
        page_size: 200,
      });
      setProducts(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [search, categoryFilter]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts(true);
    setRefreshing(false);
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Subscribe to realtime stock updates
  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === payload.new.id
                ? { ...p, stock_quantity: payload.new.stock_quantity }
                : p
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    products,
    loading,
    error,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    refetch: fetchProducts,
    refreshing,
    refresh,
  };
}
