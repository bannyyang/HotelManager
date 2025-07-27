import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Hotel } from "lucide-react";

export function Navigation() {
  const { user } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Hotel className="text-primary text-2xl h-8 w-8" />
            <span className="text-xl font-bold text-gray-900">HotelSystem</span>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-600">
                {user.firstName || user.email} ({user.role})
              </span>
            )}
            <div className="flex space-x-2">
              <Button 
                variant={user?.role === 'customer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => window.location.href = '/customer'}
                className={user?.role === 'customer' ? 'bg-primary text-white' : ''}
              >
                Customer App
              </Button>
              <Button 
                variant={user?.role === 'merchant' ? 'default' : 'outline'}
                size="sm"
                onClick={() => window.location.href = '/merchant'}
                className={user?.role === 'merchant' ? 'bg-primary text-white' : ''}
              >
                Merchant Dashboard
              </Button>
              <Button 
                variant={user?.role === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className={user?.role === 'admin' ? 'bg-primary text-white' : ''}
              >
                Platform Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
