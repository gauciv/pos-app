import { apiGet } from './api';
import type { Product, Category, PaginatedResponse, ProductFilters } from '@/types';

export async function getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.category_id) params.set('category_id', filters.category_id);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.page_size) params.set('page_size', String(filters.page_size));

  const query = params.toString();
  return apiGet<PaginatedResponse<Product>>(`/products${query ? `?${query}` : ''}`);
}

export async function getProduct(productId: string): Promise<Product> {
  return apiGet<Product>(`/products/${productId}`);
}

export async function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/categories');
}
