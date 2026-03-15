import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  Store,
  Search,
  MapPin,
  Phone,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import type { Order } from '@/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import toast from 'react-hot-toast';

interface StoreData {
  id: string;
  name: string;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-[#E5C07B]/10 text-[#E5C07B]',
  confirmed: 'bg-[#5B9BD5]/10 text-[#5B9BD5]',
  processing: 'bg-[#C678DD]/10 text-[#C678DD]',
  completed: 'bg-[#98C379]/10 text-[#98C379]',
  cancelled: 'bg-[#E06C75]/10 text-[#E06C75]',
};

export function StoresPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedStore, setExpandedStore] = useState<string | null>(null);
  const [storeOrders, setStoreOrders] = useState<Record<string, Order[]>>({});
  const [ordersLoading, setOrdersLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreData | null>(null);

  useEffect(() => {
    async function fetchStores() {
      const { data } = await supabase
        .from('stores')
        .select('*')
        .order('name');
      setStores((data as StoreData[]) || []);
      setLoading(false);
    }
    fetchStores();
  }, []);

  const filteredStores = useMemo(() => {
    if (!search.trim()) return stores;
    const q = search.toLowerCase();
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.contact_name?.toLowerCase().includes(q)
    );
  }, [stores, search]);

  async function toggleStoreOrders(storeId: string) {
    if (expandedStore === storeId) {
      setExpandedStore(null);
      return;
    }
    setExpandedStore(storeId);
    if (!storeOrders[storeId]) {
      setOrdersLoading(storeId);
      const { data } = await supabase
        .from('orders')
        .select('*, profiles:collector_id(full_name, nickname), order_items(*)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(10);
      setStoreOrders((prev) => ({ ...prev, [storeId]: (data as Order[]) || [] }));
      setOrdersLoading(null);
    }
  }

  async function handleDeleteStore() {
    if (!deleteTarget) return;
    try {
      const { error: err } = await supabase
        .from('stores')
        .delete()
        .eq('id', deleteTarget.id);
      if (err) throw err;
      setStores((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      if (expandedStore === deleteTarget.id) setExpandedStore(null);
      toast.success('Store deleted');
    } catch {
      toast.error('Failed to delete store. It may have associated orders.');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="p-6 bg-[#0D1F33] min-h-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-[#E8EDF2]">Stores</h1>
          <p className="text-xs text-[#8FAABE]/60 mt-0.5">
            {stores.length} stores registered
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FAABE]/40" />
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs bg-[#162F4D] border border-[#1E3F5E]/60 rounded-lg text-[#E8EDF2] placeholder-[#8FAABE]/40 w-64 focus:ring-2 focus:ring-[#5B9BD5] focus:outline-none"
          />
        </div>
      </div>

      {/* Store cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#162F4D] border border-[#1E3F5E]/60 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-[#1A3755] rounded w-32 mb-3" />
              <div className="h-3 bg-[#1A3755] rounded w-48 mb-2" />
              <div className="h-3 bg-[#1A3755] rounded w-24" />
            </div>
          ))}
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="bg-[#162F4D] border border-[#1E3F5E]/60 rounded-2xl p-12 text-center">
          <Store size={24} className="text-[#8FAABE]/30 mx-auto mb-3" />
          <p className="text-sm text-[#E8EDF2] font-medium mb-1">
            {search ? 'No stores match your search' : 'No stores yet'}
          </p>
          <p className="text-xs text-[#8FAABE]/50">
            Stores are added by collectors from the mobile app.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStores.map((store) => {
            const isExpanded = expandedStore === store.id;
            const orders = storeOrders[store.id];
            const isLoadingOrders = ordersLoading === store.id;

            return (
              <section
                key={store.id}
                className="bg-[#162F4D] border border-[#1E3F5E]/60 rounded-2xl overflow-hidden"
              >
                {/* Store header row */}
                <button
                  onClick={() => toggleStoreOrders(store.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#1A3755]/50 transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#5B9BD5] focus-visible:outline-none"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#5B9BD5]/15 flex items-center justify-center flex-shrink-0">
                    <Store size={16} className="text-[#5B9BD5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#E8EDF2] truncate">{store.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      {store.address && (
                        <span className="flex items-center gap-1 text-[11px] text-[#8FAABE]/60 truncate">
                          <MapPin size={10} className="flex-shrink-0" />
                          {store.address}
                        </span>
                      )}
                      {store.contact_phone && (
                        <span className="flex items-center gap-1 text-[11px] text-[#8FAABE]/60">
                          <Phone size={10} className="flex-shrink-0" />
                          {store.contact_phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!store.is_active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E06C75]/10 text-[#E06C75] font-medium">Inactive</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(store); }}
                      className="p-1.5 text-[#8FAABE]/30 hover:text-[#E06C75] transition-colors rounded-md hover:bg-[#E06C75]/10"
                      title="Delete store"
                    >
                      <Trash2 size={14} />
                    </button>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-[#8FAABE]/40" />
                    ) : (
                      <ChevronDown size={16} className="text-[#8FAABE]/40" />
                    )}
                  </div>
                </button>

                {/* Expanded orders section */}
                {isExpanded && (
                  <div className="border-t border-[#1E3F5E]/60 px-6 py-4">
                    {isLoadingOrders ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex gap-3 animate-pulse">
                            <div className="h-4 bg-[#1A3755] rounded w-20" />
                            <div className="h-4 bg-[#1A3755] rounded flex-1" />
                            <div className="h-4 bg-[#1A3755] rounded w-16" />
                          </div>
                        ))}
                      </div>
                    ) : !orders || orders.length === 0 ? (
                      <p className="text-xs text-[#8FAABE]/40 py-2 text-center">No orders from this store</p>
                    ) : (
                      <>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#1E3F5E]/40">
                              <th className="py-2 text-left text-[10px] font-medium text-[#8FAABE]/50 uppercase tracking-wide">Order</th>
                              <th className="py-2 text-left text-[10px] font-medium text-[#8FAABE]/50 uppercase tracking-wide hidden sm:table-cell">Collector</th>
                              <th className="py-2 text-left text-[10px] font-medium text-[#8FAABE]/50 uppercase tracking-wide">Status</th>
                              <th className="py-2 text-right text-[10px] font-medium text-[#8FAABE]/50 uppercase tracking-wide">Total</th>
                              <th className="py-2 text-right text-[10px] font-medium text-[#8FAABE]/50 uppercase tracking-wide hidden md:table-cell">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => (
                              <tr
                                key={order.id}
                                className="border-b border-[#1E3F5E]/20 hover:bg-[#1A3755]/30 cursor-pointer transition-colors"
                                onClick={() => navigate(`/orders/${order.id}`)}
                              >
                                <td className="py-2 text-xs font-mono text-[#E8EDF2] font-semibold">{order.order_number}</td>
                                <td className="py-2 text-xs text-[#8FAABE]/70 hidden sm:table-cell truncate max-w-[120px]">
                                  {order.profiles?.nickname || order.profiles?.full_name || '—'}
                                </td>
                                <td className="py-2">
                                  <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-semibold capitalize', STATUS_BADGE[order.status])}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-2 text-xs font-semibold text-[#E8EDF2] text-right tabular-nums">
                                  {formatCurrency(order.total_amount)}
                                </td>
                                <td className="py-2 text-[10px] text-[#8FAABE]/50 text-right hidden md:table-cell tabular-nums">
                                  {format(new Date(order.created_at), 'MMM d, HH:mm')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/orders?store=${store.id}`); }}
                            className="flex items-center gap-1 text-[11px] text-[#5B9BD5] hover:text-[#7EB8E0] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#5B9BD5] focus-visible:outline-none rounded px-1 py-0.5"
                          >
                            View all orders <ArrowRight size={10} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Store"
          message={`Delete "${deleteTarget.name}"? This cannot be undone. Stores with existing orders cannot be deleted.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteStore}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
