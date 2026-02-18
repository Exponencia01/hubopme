import { Bell, User, LogOut } from 'lucide-react';
import { useAuthStore, useNotificationStore } from '@/lib/store';
import { signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const handleLogout = async () => {
    await signOut();
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary">HUB OPME</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>

          <div className="flex items-center space-x-3 pl-4 border-l">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className="text-xs text-gray-500">
                {user?.organization_id || 'Organização'}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
