import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

export function Header() {
  const { user, signOut } = useAuth();
  const { toggle, isMobile } = useSidebar();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button onClick={toggle} className="p-1 text-gray-500 hover:text-gray-700">
            <Menu size={20} />
          </button>
        )}
        <h2 className="text-sm font-semibold text-gray-800">Admin Dashboard</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 hidden sm:inline">{user?.full_name}</span>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
