import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@clerk/clerk-react';
import { User, MapPin, List } from 'lucide-react';
import BusMap from '@/components/map/BusMap';
import BusList from '@/components/bus/BusList';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  fullName: string;
  phoneNumber: string;
  email: string;
}

const MapView = () => {
  const [view, setView] = useState<'map' | 'list'>('map');
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

    useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isSignedIn) {
        setIsLoading(false);
        return;
      }

      try {
        // Get email from actual user data
        const email = user?.emailAddresses?.[0]?.emailAddress;
        
        if (!email) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/user/profile?email=${encodeURIComponent(email)}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
          console.log('Profile loaded:', data.data); // Debug log
        } else {
          throw new Error(data.message || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Could not load user profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isSignedIn, user?.emailAddresses, toast]);

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return 'No phone number';
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

    const renderProfileContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <h3 className="font-medium text-foreground">
          {profile?.fullName || 'Guest User'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {profile?.phoneNumber ? formatPhoneNumber(profile.phoneNumber) : 'No phone number'}
        </p>
        <p className="text-xs text-muted-foreground">
          {profile?.email || 'No email'}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
      {isSignedIn && (
        <Card className="p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              {renderProfileContent()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/settings')}
              disabled={isLoading}
            >
              Edit Profile
            </Button>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Buses</h1>
        <Tabs 
          value={view} 
          onValueChange={(v) => setView(v as 'map' | 'list')}
          className="w-auto"
        >
          <TabsList className="grid w-36 grid-cols-2">
            <TabsTrigger value="map">
              <MapPin className="h-4 w-4 mr-2" />
              Map
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === 'map' && <BusMap />}
      {view === 'list' && <BusList />}
    </div>
  );
};

export default MapView;
