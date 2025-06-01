import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';

interface DriverRouteProps {
  children: ReactNode;
}

export const DriverRoute = ({ children }: DriverRouteProps) => {
  const { isSignedIn, isLoaded, isDriver, isCheckingDriver } = useUser();

  if (!isLoaded || isCheckingDriver) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Only redirect if we're sure about driver status
  if (!isDriver) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
