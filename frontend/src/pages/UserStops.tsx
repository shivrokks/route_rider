
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Plus, Trash2, Bell } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

interface Stop {
  _id: string;
  name: string;
  busRoute: string;
  notifications: {
    enablePushNotifications: boolean;
    enableSmsNotifications: boolean;
  };
}

const UserStops = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newStopName, setNewStopName] = useState('');
  const [newBusRoute, setNewBusRoute] = useState('');
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  // Fetch user's stops
  const fetchStops = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/user/stops/${user?.phoneNumber}`);
      const data = await response.json();

      if (data.success) {
        setStops(data.data);
      }
    } catch (error) {
      console.error('Error fetching stops:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stops",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.phoneNumber) {
      fetchStops();
    }
  }, [user?.phoneNumber]);

  const handleAddStop = async () => {
    if (!newStopName || !newBusRoute) {
      toast({
        title: "Error",
        description: "Please enter both stop name and bus route",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingStop(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/user/stops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: user?.phoneNumber,
          stopName: newStopName,
          busRoute: newBusRoute
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Stop Added",
          description: `${newStopName} has been added to your stops`,
        });
        setNewStopName('');
        setNewBusRoute('');
        fetchStops(); // Refresh stops list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error adding stop:', error);
      toast({
        title: "Error",
        description: "Failed to add stop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingStop(false);
    }
  };

  const handleRemoveStop = async (stopName: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/stops/${user?.phoneNumber}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stopName })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Stop Removed",
          description: `${stopName} has been removed from your stops`,
        });
        fetchStops(); // Refresh stops list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error removing stop:', error);
      toast({
        title: "Error",
        description: "Failed to remove stop. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleNotification = async (stop: Stop, type: 'push' | 'sms', enabled: boolean) => {
    try {
      if (type === 'sms' && enabled && !user?.phoneNumber) {
        toast({
          title: "Phone Number Required",
          description: "Please add a phone number in Settings to enable SMS notifications",
          variant: "destructive",
        });
        return;
      }
      
      const response = await fetch(
        `http://localhost:5000/api/user/stops/${user?.phoneNumber}/${stop.name}/preferences`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enablePushNotifications: type === 'push' ? enabled : stop.notifications.enablePushNotifications,
            enableSmsNotifications: type === 'sms' ? enabled : stop.notifications.enableSmsNotifications
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Settings Updated",
          description: `${type === 'push' ? 'Push' : 'SMS'} notifications ${enabled ? 'enabled' : 'disabled'} for ${stop.name}`,
        });
        fetchStops(); // Refresh stops list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-bold">My Bus Stops</h1>
        <p className="text-muted-foreground">Manage your favorite stops and notification preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Stop</CardTitle>
          <CardDescription>Add stops to receive notifications before arrival</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stop-name">Stop Name</Label>
            <Input
              id="stop-name"
              placeholder="Enter stop name"
              value={newStopName}
              onChange={(e) => setNewStopName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="route">Bus Route</Label>
            <Input
              id="route"
              placeholder="Enter bus route"
              value={newBusRoute}
              onChange={(e) => setNewBusRoute(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddStop} className="w-full" disabled={isAddingStop}>
            {isAddingStop ? "Adding..." : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Stop
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Saved Stops</CardTitle>
          <CardDescription>Your saved stops for quick access</CardDescription>
        </CardHeader>
        <CardContent>
          {stops.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No stops added yet</p>
          ) : (
            <div className="space-y-3">
              {stops.map((stop) => (
                <div key={stop.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-bus-primary mr-2" />
                    <div>
                      <p className="font-medium">{stop.name}</p>
                      <p className="text-sm text-muted-foreground">{stop.busRoute}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveStop(stop.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>Configure how you receive bus stop alerts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {stops.map((stop) => (
              <div key={stop.name} className="space-y-2">
                <h3 className="font-medium">{stop.name}</h3>
                <div className="flex items-center space-x-2">
                  <Label>Push Notifications</Label>
                  <Switch
                    checked={stop.notifications.enablePushNotifications}
                    onCheckedChange={(enabled) => handleToggleNotification(stop, 'push', enabled)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label>SMS Notifications</Label>
                  <Switch
                    checked={stop.notifications.enableSmsNotifications}
                    onCheckedChange={(enabled) => handleToggleNotification(stop, 'sms', enabled)}
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserStops;
