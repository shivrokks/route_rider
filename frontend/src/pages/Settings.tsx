import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sun, Moon } from 'lucide-react';

interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyBeforeStops: number;
}

const Settings = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    notifyBeforeStops: 3
  });

  // Load user profile data
  useEffect(() => {
  const loadProfile = async () => {
    if (!user?.email) return;

setIsLoading(true);
try {
  const token = await getToken();
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile?email=${encodeURIComponent(user.email)}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });


      if (!response.ok) {
      // Instead of throwing an error, show the message
      toast({
        title: "Notice",
        description: "Save your profile by filling the details below.",
      });
      return;
    }

    const data = await response.json();
    if (data.success) {
      setProfileData(data.data);
      setNotificationSettings(data.data.settings?.notifications || notificationSettings);
    } else {
      // Handle the case where the server responds but indicates failure
      toast({
        title: "Notice",
        description: "Save your profile by filling the details below.",
      });
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    toast({
      title: "Notice",
      description: "Save your profile by filling the details below.",
    });
  } finally {
    setIsLoading(false);
  }
};


    loadProfile();
  }, [user?.email, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (id === 'phoneNumber') {
      // Only allow numbers and limit to 10 digits
      const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setProfileData(prev => ({
        ...prev,
        [id]: sanitizedValue
      }));
      return;
    }

    setProfileData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean | number) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!profileData.phoneNumber || !profileData.email) {
      toast({
        title: "Error",
        description: "Email and phone number are required",
        variant: "destructive"
      });
      return;
    }

setIsSaving(true);
try {
  const token = await getToken();
  console.log(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileData,
          settings: {
            notifications: notificationSettings
          }
        })
      });      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && data.errors) {
          throw new Error(`Validation error: ${data.errors.join(', ')}`);
        }
        throw new Error(data.message || 'Failed to save settings');
      }

      if (data.success) {
        toast({
          title: "Settings Saved",
          description: "Your profile has been updated successfully",
        });
        
        // Force a reload of the profile data across the app
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              value={profileData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={profileData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              type="tel" 
              value={profileData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              maxLength={10}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSaveProfile} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance Settings</CardTitle>
          <CardDescription>
            Customize your app appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <div className="flex items-center">
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      
    </div>
  );
};

export default Settings;