import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  fullName: string;
  phoneNumber: string;
  email: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isSignedIn || !user?.phoneNumber) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.BACKEND_URL}/api/user/profile?phoneNumber=${user.phoneNumber}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Could not load profile",
          variant: "destructive",
        });
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isSignedIn, user?.phoneNumber, toast]);

  return { profile, isLoading };
};