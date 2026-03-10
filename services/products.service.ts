import { supabase } from '@/lib/supabase';
import type { Product, PaginatedResponse, ProductFilters } from '@/types';

export async function getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
  let query = supabase
    .from('products')
    .select('*, categories(name)', { count: 'exact' })
    .eq('is_active', true)
    .order('name');

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  const page = filters?.page || 1;
  const pageSize = filters?.page_size || 200;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    data: data as Product[],
    total: count || 0,
    page,
    page_size: pageSize,
  };
}

export async function getProduct(productId: string): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', productId)
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}
