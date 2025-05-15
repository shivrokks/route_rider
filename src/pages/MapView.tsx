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
import { useIsMobile } from '@/hooks/use-mobile';
import { Mail, Phone } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Profile {
  fullName: string;
  email: string;
  phoneNumber?: string;
}

const MapView = () => {
  const [view, setView] = useState<'map' | 'list'>('map');
  const { isSignedIn, user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    fullName: 'Guest User',
    email: 'No email',
    phoneNumber: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn || !user) {
        setProfile({
          fullName: 'Guest User',
          email: '',
          phoneNumber: ''
        });
        setIsLoading(false);
        return;
      }

      try {
        // Get data from Clerk
        const clerkEmail = user.emailAddresses[0]?.emailAddress;
        const clerkName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const clerkPhone = user.phoneNumbers?.[0]?.phoneNumber || '';
        
        console.log('Clerk data:', { clerkName, clerkEmail, clerkPhone }); // Debug log
        
        // Initialize profile with Clerk data
        let currentProfile = {
          fullName: clerkName || 'Guest User',
          email: clerkEmail || 'No email',
          phoneNumber: clerkPhone || ''
        };

        // Only fetch from backend if we have an email
        if (clerkEmail) {
          try {
            const response = await fetch(
              `http://localhost:5000/api/user/profile?email=${encodeURIComponent(clerkEmail)}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              console.log('Backend response:', data); // Debug log
              if (data.success && data.data) {
                currentProfile = {
                  ...currentProfile,
                  ...data.data,
                  fullName: data.data.fullName || currentProfile.fullName, // Fallback to Clerk name
                  email: clerkEmail // Always keep Clerk email
                };
              }
            }
          } catch (backendError) {
            console.error('Backend profile fetch failed:', backendError);
            toast({
              title: "Warning",
              description: "Using profile information from authentication only.",
              variant: "default",
            });
          }
        }

        console.log('Setting profile to:', currentProfile); // Debug log
        setProfile(currentProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "An error occurred while fetching profile information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isSignedIn, user, isLoaded, toast]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-8 h-8" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  // Show sign-in message if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-4">Please sign in to view this page</h2>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return 'No phone number';
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Format the number if it's 10 digits (US/Canada format)
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
     // Format the number if it's 11 digits (US/Canada with country code 1)
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
       return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    // Return original if not 10 or 11 digits starting with 1
    return phoneNumber;
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
          {profile.fullName || 'Guest User'}
        </h3>
        <p className="text-sm text-muted-foreground flex items-center">
          <Phone className="h-3 w-3 mr-1" />
          {profile.phoneNumber ? formatPhoneNumber(profile.phoneNumber) : 'No phone number'}
        </p>
        <p className="text-xs text-muted-foreground flex items-center">
          <Mail className="h-3 w-3 mr-1" />
          {profile.email}
        </p>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'p-2' : 'p-4'}`}>
      {/* Only show profile card if signed in */}
      {isSignedIn && (
        <Card className="p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {isLoading ? (
                   <Spinner className="h-5 w-5 text-primary" /> // Show spinner while loading icon
                ) : (
                  <User className="h-5 w-5 text-primary" /> // Show user icon when loaded
                )}
              </div>
              {renderProfileContent()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
              disabled={isLoading} // Disable button while loading
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

      <div className={`${isMobile ? 'mx-0' : 'rounded-lg'} overflow-hidden border shadow-sm`}>
        {view === 'map' && <BusMap fullWidth={isMobile} />}
        {view === 'list' && <BusList />}
      </div>
    </div>
  );
};

export default MapView;