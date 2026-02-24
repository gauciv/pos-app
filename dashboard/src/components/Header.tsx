import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.full_name}</span>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
