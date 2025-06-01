
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { UserStop } from '../services/models/UserStop';
import * as userStopService from '../services/userStopService';

export const useUserStops = () => {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [stops, setStops] = useState<UserStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user stops
  useEffect(() => {
    const loadUserStops = async () => {
      if (!isSignedIn || !user) {
        setStops([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userStops = await userStopService.getUserStops(user.id);
        setStops(userStops);
        setError(null);
      } catch (err) {
        console.error('Failed to load user stops:', err);
        setError('Failed to load your saved stops. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load your saved stops',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserStops();
  }, [isSignedIn, user, toast]);

  // Add a stop
  const addStop = async (stopName: string, busRoute: string, notifyBeforeStops: number) => {
    if (!isSignedIn || !user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to save stops',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const newStop: UserStop = {
        userId: user.id,
        stopName,
        busRoute,
        notifyBeforeStops,
        enablePushNotifications: true,
        enableSmsNotifications: false,
      };

      const addedStop = await userStopService.addUserStop(newStop);
      setStops((prev) => [...prev, addedStop]);
      toast({
        title: 'Stop Added',
        description: `${stopName} has been added to your stops`,
      });
      return addedStop;
    } catch (err) {
      console.error('Failed to add stop:', err);
      toast({
        title: 'Error',
        description: 'Failed to add the stop. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Remove a stop
  const removeStop = async (stopName: string) => {
    if (!isSignedIn || !user) return false;

    try {
      const success = await userStopService.deleteUserStop(user.id, stopName);
      if (success) {
        setStops((prev) => prev.filter(stop => stop.stopName !== stopName));
        toast({
          title: 'Stop Removed',
          description: `${stopName} has been removed from your stops`,
        });
      }
      return success;
    } catch (err) {
      console.error('Failed to remove stop:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove the stop. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Update stop notification preferences
  const updateStopPreferences = async (
    stopName: string,
    updates: Partial<UserStop>
  ) => {
    if (!isSignedIn || !user) return null;

    try {
      const updatedStop = await userStopService.updateUserStop(user.id, stopName, updates);
      if (updatedStop) {
        setStops((prev) =>
          prev.map((stop) =>
            stop.stopName === stopName ? { ...stop, ...updates } : stop
          )
        );
        toast({
          title: 'Preferences Updated',
          description: 'Your notification preferences have been updated',
        });
      }
      return updatedStop;
    } catch (err) {
      console.error('Failed to update stop preferences:', err);
      toast({
        title: 'Error',
        description: 'Failed to update your preferences. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    stops,
    loading,
    error,
    addStop,
    removeStop,
    updateStopPreferences,
  };
};
