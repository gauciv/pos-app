import { NavLink } from 'react-router-dom';
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
import { clsx } from 'clsx';
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

const modeOptions: { mode: SidebarMode; icon: React.ElementType; label: string }[] = [
  { mode: 'hover', icon: MousePointerClick, label: 'Hover' },
  { mode: 'expanded', icon: PanelLeft, label: 'Pinned' },
  { mode: 'collapsed', icon: PanelLeftClose, label: 'Mini' },
];

export function Sidebar() {
  const { isOpen, mode, isExpanded, close, setMode, setHovered, isMobile } = useSidebar();
  const showExpanded = isMobile || isExpanded;
  const isCollapsed = !isMobile && !isExpanded;
  const isOverlay = mode === 'hover' && isExpanded && !isMobile;

  const sidebarContent = (
    <>
      {/* Logo / Brand */}
      <div
        className={clsx(
          'flex items-center mb-6',
          isCollapsed ? 'justify-center px-0' : 'justify-between px-1'
        )}
      >
        {showExpanded && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#1a56db] flex items-center justify-center flex-shrink-0">
              <ShoppingCart size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white leading-tight tracking-wide">POS Admin</h1>
              <p className="text-[10px] text-[#5b7da8] leading-tight">Order Management</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-7 h-7 rounded-lg bg-[#1a56db] flex items-center justify-center">
            <ShoppingCart size={14} className="text-white" />
          </div>
        )}
        {isMobile && (
          <button onClick={close} className="p-1.5 text-[#5b7da8] hover:text-white rounded-md hover:bg-[#132848] transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {showExpanded ? (
              <p className="text-[10px] font-semibold text-[#3d5a7a] uppercase tracking-widest mb-2 px-2">
                {group.label}
              </p>
            ) : (
              <div className="h-px bg-[#1a2d4a] mx-1 mb-2" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => isMobile && close()}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
                      isCollapsed ? 'justify-center' : '',
                      isActive
                        ? 'bg-[#132848] text-white border-l-2 border-[#1a56db]'
                        : 'text-[#a8bdd4] hover:bg-[#132848] hover:text-white'
                    )
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  {showExpanded && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Mode toggle (desktop only) */}
      {!isMobile && (
        <div className="mt-4 pt-3 border-t border-[#1a2d4a]">
          {showExpanded ? (
            <div className="flex items-center gap-1 bg-[#081425] rounded-lg p-1">
              {modeOptions.map(({ mode: m, icon: Icon, label }) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-medium transition-colors',
                    mode === m
                      ? 'bg-[#1a56db] text-white'
                      : 'text-[#5b7da8] hover:text-white'
                  )}
                  title={label}
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              {modeOptions.map(({ mode: m, icon: Icon, label }) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={clsx(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                    mode === m
                      ? 'bg-[#1a56db] text-white'
                      : 'text-[#5b7da8] hover:text-white hover:bg-[#132848]'
                  )}
                  title={label}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  // Mobile: overlay drawer
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={close} />
        )}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-50 w-60 bg-[#0c1c35] text-white p-4 flex flex-col transition-transform duration-200',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: sticky sidebar
  // In hover mode: collapsed by default, expands as overlay on hover
  // In expanded mode: always expanded, pushes content
  // In collapsed mode: always collapsed
  return (
    <>
      {/* Spacer — reserves space in the flex layout so content doesn't jump */}
      <div
        className={clsx(
          'flex-shrink-0 transition-all duration-200',
          mode === 'expanded' ? 'w-[200px]' : 'w-[52px]'
        )}
      />
      <aside
        onMouseEnter={() => mode === 'hover' && setHovered(true)}
        onMouseLeave={() => mode === 'hover' && setHovered(false)}
        className={clsx(
          'fixed inset-y-0 left-0 bg-[#0c1c35] text-white p-3 flex flex-col transition-all duration-200 flex-shrink-0',
          isOverlay ? 'z-40 shadow-2xl shadow-black/40' : 'z-30',
          isExpanded ? 'w-[200px]' : 'w-[52px]'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
