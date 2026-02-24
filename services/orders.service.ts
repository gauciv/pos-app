import { apiGet, apiPost } from './api';
import type { Order, CreateOrderRequest, CreateOrderResponse, PaginatedResponse, OrderFilters } from '@/types';

export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  return apiPost<CreateOrderResponse>('/orders', data);
}

export async function getOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.page_size) params.set('page_size', String(filters.page_size));

  const query = params.toString();
  return apiGet<PaginatedResponse<Order>>(`/orders${query ? `?${query}` : ''}`);
}

export async function getOrder(orderId: string): Promise<Order> {
  return apiGet<Order>(`/orders/${orderId}`);
}
