
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header setIsMenuOpen={setIsMenuOpen} />
      <main className="flex-1 container mx-auto px-4 pb-24 md:pb-8 pt-4">
        <Outlet />
      </main>
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Layout;
