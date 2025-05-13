
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, LogIn, UserCircle } from 'lucide-react';
import { useUser, UserButton } from '@clerk/clerk-react';

interface HeaderProps {
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Header = ({ setIsMenuOpen }: HeaderProps) => {
  const { toast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications",
    });
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm dark:bg-gray-900 dark:border-b dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {!isSearchOpen ? (
          <>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-bus-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">BT</span>
              </div>
              <h1 className="font-bold text-lg text-bus-primary dark:text-white">BusTracker</h1>
            </Link>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearchOpen(true)}
                className="text-bus-primary dark:text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              {isSignedIn ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleNotificationClick}
                    className="text-bus-primary relative dark:text-white"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-bus-danger rounded-full"></span>
                  </Button>
                  <UserButton afterSignOutUrl="/login" />
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="w-full flex items-center space-x-2">
            <Input 
              placeholder="Search for buses, routes..." 
              className="flex-1"
              autoFocus
            />
            <Button 
              variant="ghost" 
              onClick={() => setIsSearchOpen(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
