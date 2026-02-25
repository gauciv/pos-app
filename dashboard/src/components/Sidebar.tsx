import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Tag, Users, GitBranch, Building2, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useSidebar } from '@/contexts/SidebarContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/branches', label: 'Branches', icon: GitBranch },
  { to: '/company', label: 'Company', icon: Building2 },
];

export function Sidebar() {
  const { isOpen, isCollapsed, close, toggleCollapse, isMobile } = useSidebar();

  const sidebarContent = (
    <>
      <div className={clsx('flex items-center mb-6', isCollapsed && !isMobile ? 'justify-center' : 'justify-between')}>
        {(!isCollapsed || isMobile) && (
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">POS Admin</h1>
            <p className="text-gray-400 text-xs">Order Management</p>
          </div>
        )}
        {isMobile ? (
          <button onClick={close} className="p-1 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        ) : (
          <button onClick={toggleCollapse} className="p-1 text-gray-400 hover:text-white">
            {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => isMobile && close()}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                isCollapsed && !isMobile ? 'justify-center' : '',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
            title={isCollapsed && !isMobile ? item.label : undefined}
          >
            <item.icon size={18} />
            {(!isCollapsed || isMobile) && item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={close} />
        )}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white p-4 flex flex-col transition-transform duration-200',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={clsx(
        'bg-gray-900 text-white min-h-screen p-3 flex flex-col transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {sidebarContent}
    </aside>
  );
}
