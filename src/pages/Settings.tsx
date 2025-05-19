import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
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
      if (!user?.email) {
        console.log('No user email available');
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching profile for email:', user.email);
        const url = `http://localhost:5000/api/user/profile?email=${encodeURIComponent(user.email)}`;
        console.log('Request URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Profile data received:', data);
        
        if (data.success) {
          setProfileData(data.data);
          setNotificationSettings(data.data.settings?.notifications || notificationSettings);
        } else {
          console.error('API returned success:false with data:', data);
          toast({
            title: "Info",
            description: data.message || "No profile data available",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load profile settings",
          variant: "destructive",
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
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          settings: {
            notifications: notificationSettings
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Settings Saved",
          description: "Your profile has been updated",
        });
        
        // Force a reload of the profile data across the app
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
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
