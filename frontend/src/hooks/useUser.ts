import { useUser as useClerkUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AppUser {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  phoneNumber?: string | null;
  isDriver?: boolean;
  fullName?: string;
}

export const useUser = () => {
  const { user, isSignedIn, isLoaded } = useClerkUser();
  const [isDriver, setIsDriver] = useState(false);
  const [isCheckingDriver, setIsCheckingDriver] = useState(true);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkDriverStatus = async () => {
      if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) {
        setIsCheckingDriver(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile?email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (!mounted) return;
        
        if (response.ok) {
          const data = await response.json();
          const isDriverStatus = data.success && data.data?.isDriver;
          const profile = data.data;
          setIsDriver(isDriverStatus);
          
          // Update the user profile with backend data
          if (profile) {
            setUserProfile({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress ?? '',
              name: profile.fullName || `${user.firstName} ${user.lastName}`,
              imageUrl: user.imageUrl,
              phoneNumber: profile.phoneNumber || user.phoneNumbers?.[0]?.phoneNumber || null,
              isDriver: isDriverStatus,
              fullName: profile.fullName
            });
          }
          
          // Only redirect if we're on a non-driver page and user is a driver
          if (isDriverStatus && !window.location.pathname.startsWith('/driver')) {
            navigate('/driver', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking driver status:', error);
      } finally {
        if (mounted) {
          setIsCheckingDriver(false);
        }
      }
    };

    checkDriverStatus();

    return () => {
      mounted = false;
    };
  }, [isSignedIn, user?.primaryEmailAddress?.emailAddress, navigate, user]);

  return {
    user: userProfile || (user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? '',
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      phoneNumber: user.phoneNumbers?.[0]?.phoneNumber ?? '',
      isDriver,
    } : null),
    isSignedIn,
    isLoaded,
    isDriver,
    isCheckingDriver,
  } as const;
};