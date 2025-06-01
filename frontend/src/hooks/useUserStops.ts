import { useState, useEffect } from 'react';
import { UserStop } from '@/services/models/UserStop';
import { 
  getUserStops, 
  addUserStop, 
  updateUserStop, 
  deleteUserStop 
} from '@/services/userStopService';
import { useUser } from '@/hooks/useUser';

export const useUserStops = () => {
  const { user, isSignedIn } = useUser();
  const [stops, setStops] = useState<UserStop[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user stops when user is signed in
  useEffect(() => {
    const loadStops = async () => {
      if (!isSignedIn || !user?.id) {
        setStops([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userStops = await getUserStops(user.id);
        setStops(userStops);
      } catch (error) {
        console.error('Error loading user stops:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStops();
  }, [isSignedIn, user?.id]);

  // Add a new stop
  const addStop = async (
    stopName: string, 
    busRoute: string, 
    notifyBeforeStops: number = 3
  ) => {
    if (!isSignedIn || !user?.id) return;

    const newStop: UserStop = {
      userId: user.id,
      stopName,
      busRoute,
      notifyBeforeStops,
      enablePushNotifications: true,
      enableSmsNotifications: false
    };

    try {
      const addedStop = await addUserStop(newStop);
      setStops(prev => [...prev, addedStop]);
      return addedStop;
    } catch (error) {
      console.error('Error adding stop:', error);
      return null;
    }
  };

  // Remove a stop
  const removeStop = async (stopName: string) => {
    if (!isSignedIn || !user?.id) return;

    try {
      const success = await deleteUserStop(user.id, stopName);
      if (success) {
        setStops(prev => prev.filter(stop => stop.stopName !== stopName));
      }
      return success;
    } catch (error) {
      console.error('Error removing stop:', error);
      return false;
    }
  };

  // Update stop preferences
  const updateStopPreferences = async (
    stopName: string, 
    preferences: Partial<UserStop>
  ) => {
    if (!isSignedIn || !user?.id) return;

    try {
      const updatedStop = await updateUserStop(user.id, stopName, preferences);
      if (updatedStop) {
        setStops(prev => 
          prev.map(stop => 
            stop.stopName === stopName ? { ...stop, ...preferences } : stop
          )
        );
      }
      return updatedStop;
    } catch (error) {
      console.error('Error updating stop preferences:', error);
      return null;
    }
  };

  return {
    stops,
    loading,
    addStop,
    removeStop,
    updateStopPreferences
  };
};