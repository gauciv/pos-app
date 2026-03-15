import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, ChevronDown, User, Bell, ShoppingCart, PackageX, PackageMinus, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePageLabel } from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  data: Record<string, unknown>;
}

const NOTIF_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  new_order:             { icon: ShoppingCart, color: 'text-[#5B9BD5]' },
  order_status_changed:  { icon: ShoppingCart, color: 'text-[#7EB8E0]' },
  low_stock:             { icon: PackageMinus, color: 'text-[#E5C07B]' },
  out_of_stock:          { icon: PackageX,     color: 'text-[#E06C75]' },
  price_changed:         { icon: DollarSign,   color: 'text-[#C678DD]' },
  new_product:           { icon: Package,      color: 'text-[#98C379]' },
};

function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      setNow(new Date());
      const interval = setInterval(() => {
        setNow(new Date());
      }, 60000);
      cleanupRef.current = () => clearInterval(interval);
    }, msUntilNextMinute);

    const cleanupRef = { current: () => {} };
    return () => {
      clearTimeout(timeout);
      cleanupRef.current();
    };
  }, []);

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <span className="text-xs font-mono text-[#8FAABE]/70 tabular-nums">
      {date} &middot; {time}
    </span>
  );
}

export function Header() {
  const { signOut } = useAuth();
  const { toggle, isMobile } = useSidebar();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const pageLabel = usePageLabel();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, is_read, created_at, data')
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications((data as Notification[]) || []);
  }, []);

  // Initial fetch + polling fallback
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Realtime subscription for instant notifications
  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markOneRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  function handleNotifClick(n: Notification) {
    markOneRead(n.id);
    setNotifOpen(false);

    // Navigate based on notification type
    const data = n.data || {};
    if (n.type === 'new_order' || n.type === 'order_status_changed') {
      if (data.order_id) navigate(`/orders/${data.order_id}`);
      else navigate('/orders');
    } else if (n.type === 'low_stock' || n.type === 'out_of_stock' || n.type === 'price_changed' || n.type === 'new_product') {
      if (data.product_id) navigate(`/products/${data.product_id}/edit`);
      else navigate('/products');
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#152D4A] border-b border-[#1E3F5E]/60 px-3 h-10 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={toggle}
            className="p-1 text-[#8FAABE]/70 hover:text-[#E8EDF2] rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#5B9BD5] focus-visible:outline-none"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Gels" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-sm font-bold text-[#E8EDF2] tracking-tight hidden sm:inline">Gels Consumer Good Trading</span>
          <div className="h-4 w-px bg-[#1E3F5E]/60" />
          <span className="text-sm text-[#8FAABE]/70">{pageLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isDashboard && (
          <>
            <LiveClock />
            <div className="h-4 w-px bg-[#1E3F5E]/60" />
          </>
        )}

        {/* Notifications bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-1.5 text-[#8FAABE]/70 hover:text-[#E8EDF2] rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#5B9BD5] focus-visible:outline-none"
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E06C75] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-[#162F4D] border border-[#1E3F5E]/60 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E3F5E]/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#E8EDF2]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#E06C75]/15 text-[#E06C75] rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-[#5B9BD5] hover:text-[#7EB8E0] font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell size={16} className="text-[#8FAABE]/20 mx-auto mb-2" />
                    <p className="text-xs text-[#8FAABE]/40">No notifications yet</p>
                    <p className="text-[10px] text-[#8FAABE]/25 mt-0.5">You'll be notified about orders, stock alerts, and more</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const notifMeta = NOTIF_ICONS[n.type] || { icon: AlertTriangle, color: 'text-[#8FAABE]/40' };
                    const IconComp = notifMeta.icon;
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={cn(
                          'w-full flex items-start gap-2.5 px-4 py-2.5 border-b border-[#1E3F5E]/20 last:border-0 transition-colors text-left hover:bg-[#1A3755]/40',
                          !n.is_read && 'bg-[#1A3755]/30'
                        )}
                      >
                        <div className={cn('flex-shrink-0 mt-0.5 p-1 rounded', notifMeta.color.replace('text-', 'bg-').replace(']', ']/10]'))}>
                          <IconComp size={12} className={notifMeta.color} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-[11px] font-medium leading-snug', n.is_read ? 'text-[#8FAABE]/60' : 'text-[#E8EDF2]')}>
                            {n.title}
                          </p>
                          <p className={cn('text-[10px] leading-snug mt-0.5', n.is_read ? 'text-[#8FAABE]/30' : 'text-[#8FAABE]/50')}>
                            {n.body}
                          </p>
                          <p className="text-[9px] text-[#8FAABE]/30 mt-1">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.is_read && (
                          <div className="w-2 h-2 rounded-full bg-[#5B9BD5] flex-shrink-0 mt-1.5" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 text-xs text-[#8FAABE]/70 hover:text-[#E8EDF2] transition-colors focus-visible:ring-2 focus-visible:ring-[#5B9BD5] focus-visible:outline-none rounded"
            aria-label="User menu"
          >
            <div className="w-6 h-6 rounded-full bg-[#1A3755] flex items-center justify-center">
              <User size={12} className="text-[#8FAABE]" />
            </div>
            <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#162F4D] border border-[#1E3F5E]/60 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => { setDropdownOpen(false); signOut(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#E06C75] hover:bg-[#E06C75]/10 transition-colors"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
