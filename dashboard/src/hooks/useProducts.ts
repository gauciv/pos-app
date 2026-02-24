import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Product, Category, PaginatedResponse } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (search?: string, categoryId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryId) params.set('category_id', categoryId);
      params.set('is_active', 'true');
      params.set('page_size', '200');
      const query = params.toString();
      const result = await apiGet<PaginatedResponse<Product>>(`/products?${query}`);
      setProducts(result.data);
      setTotal(result.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiGet<Category[]>('/categories');
      setCategories(data);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  async function createProduct(data: Partial<Product>): Promise<Product> {
    const result = await apiPost<Product>('/products', data);
    await fetchProducts();
    return result;
  }

  async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const result = await apiPut<Product>(`/products/${id}`, data);
    await fetchProducts();
    return result;
  }

  async function deleteProduct(id: string): Promise<void> {
    await apiDelete(`/products/${id}`);
    await fetchProducts();
  }

  async function createCategory(data: { name: string; description?: string }): Promise<Category> {
    const result = await apiPost<Category>('/categories', data);
    await fetchCategories();
    return result;
  }

  async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const result = await apiPut<Category>(`/categories/${id}`, data);
    await fetchCategories();
    return result;
  }

  async function deleteCategory(id: string): Promise<void> {
    await apiDelete(`/categories/${id}`);
    await fetchCategories();
  }

  return {
    products,
    categories,
    total,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
