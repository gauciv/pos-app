import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Building2,
  TrendingUp,
  BarChart3,
  Settings,
  X,
  PanelLeftClose,
  PanelLeft,
  MousePointerClick,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar, SidebarMode } from '@/contexts/SidebarContext';

const navGroups = [
  {
    label: 'Operations',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/orders', label: 'Orders', icon: ShoppingCart },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/forecast', label: 'Forecast', icon: TrendingUp },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/company', label: 'Company', icon: Building2 },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const pageLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/orders': 'Orders',
  '/forecast': 'Forecast',
  '/analytics': 'Analytics',
  '/products': 'Products',
  '/users': 'Users',
  '/company': 'Company',
  '/settings': 'Settings',
};

const modeOptions: { mode: SidebarMode; icon: React.ElementType; label: string }[] = [
  { mode: 'hover', icon: MousePointerClick, label: 'Hover expand' },
  { mode: 'expanded', icon: PanelLeft, label: 'Expanded' },
  { mode: 'collapsed', icon: PanelLeftClose, label: 'Collapsed' },
];

export function Sidebar() {
  const { isOpen, mode, isExpanded, close, setMode, setHovered, isMobile } = useSidebar();
  const showExpanded = isMobile || isExpanded;
  const isCollapsed = !isMobile && !isExpanded;
  const isOverlay = mode === 'hover' && isExpanded && !isMobile;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        className={cn(
          'flex items-center mb-6',
          isCollapsed ? 'justify-center px-0' : 'justify-between px-1'
        )}
      >
        {showExpanded && (
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logo.png" alt="Gels" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white leading-tight tracking-tight truncate">Gels Consumer</h1>
              <p className="text-[10px] text-blue-200/50 leading-tight">Good Trading</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <img src="/logo.png" alt="Gels" className="w-8 h-8 rounded-full object-cover" />
        )}
        {isMobile && (
          <button onClick={close} className="p-1.5 text-blue-200/50 hover:text-white rounded-md hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {showExpanded ? (
              <p className="text-[10px] font-semibold text-blue-200/40 uppercase tracking-widest mb-2 px-2">
                {group.label}
              </p>
            ) : (
              <div className="h-px bg-white/10 mx-1 mb-2" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => isMobile && close()}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-all duration-150 relative',
                      isCollapsed ? 'justify-center' : '',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-blue-200/70 hover:bg-primary/20 hover:text-white'
                    )
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={16} className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-blue-300/60')} />
                      {showExpanded && <span>{item.label}</span>}
                      {isActive && showExpanded && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Mode toggle (desktop only) — icon-only with tooltips */}
      {!isMobile && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className={cn(
            'flex items-center gap-1 bg-white/5 rounded-md p-0.5',
            isCollapsed ? 'flex-col' : 'flex-row'
          )}>
            {modeOptions.map(({ mode: m, icon: Icon, label }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex items-center justify-center rounded-md transition-colors',
                  isCollapsed ? 'w-8 h-8' : 'flex-1 py-1.5',
                  mode === m
                    ? 'bg-white/15 text-white'
                    : 'text-blue-300/40 hover:text-white'
                )}
                title={label}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Mobile: overlay drawer
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={close} />
        )}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-52 bg-gradient-to-b from-[#0A2040] to-[#0D2B52] text-white p-4 flex flex-col transition-transform duration-200',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: sticky sidebar
  return (
    <>
      {/* Spacer — reserves space in the flex layout so content doesn't jump */}
      <div
        className={cn(
          'flex-shrink-0 transition-all duration-200',
          mode === 'expanded' ? 'w-52' : 'w-14'
        )}
      />
      <aside
        onMouseEnter={() => mode === 'hover' && setHovered(true)}
        onMouseLeave={() => mode === 'hover' && setHovered(false)}
        className={cn(
          'fixed inset-y-0 left-0 bg-gradient-to-b from-[#0A2040] to-[#0D2B52] text-white p-3 flex flex-col transition-all duration-200 flex-shrink-0',
          isOverlay ? 'z-40 shadow-2xl shadow-black/40' : 'z-30',
          isExpanded ? 'w-52' : 'w-14'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

/** Returns the page label for the current path */
export function usePageLabel() {
  const location = useLocation();
  const base = '/' + location.pathname.split('/')[1];
  return pageLabels[base] || 'Dashboard';
}
