import { apiGet } from './api';
import type { Store } from '@/types';

export async function getStores(): Promise<Store[]> {
  return apiGet<Store[]>('/stores');
}

export async function getStore(storeId: string): Promise<Store> {
  return apiGet<Store>(`/stores/${storeId}`);
}
