import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, X } from "lucide-react";
import { useUserStops } from "@/hooks/useUserStops";
import { useToast } from "@/components/ui/use-toast";

const StopsList = () => {
  const { stops, addStop, removeStop, updateStopPreferences } = useUserStops();
  const { toast } = useToast();
  const [newStop, setNewStop] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("Route 42");
  const [notifyBeforeStops, setNotifyBeforeStops] = useState(3);

  const availableRoutes = ["Route 42", "Route 15", "Route 7", "Route 23", "Route 56"];

  const handleAddStop = () => {
    if (newStop.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a stop name",
        variant: "destructive",
      });
      return;
    }

    addStop(newStop, selectedRoute, notifyBeforeStops);
    setNewStop("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Stop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stop-name">Stop Name</Label>
                <Input
                  id="stop-name"
                  placeholder="Enter stop name"
                  value={newStop}
                  onChange={(e) => setNewStop(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="route">Bus Route</Label>
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger id="route">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoutes.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notify">Notify Before</Label>
                <Select 
                  value={notifyBeforeStops.toString()} 
                  onValueChange={(value) => setNotifyBeforeStops(parseInt(value))}
                >
                  <SelectTrigger id="notify">
                    <SelectValue placeholder="Select stops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 stop before</SelectItem>
                    <SelectItem value="2">2 stops before</SelectItem>
                    <SelectItem value="3">3 stops before</SelectItem>
                    <SelectItem value="4">4 stops before</SelectItem>
                    <SelectItem value="5">5 stops before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={handleAddStop} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Saved Stops</CardTitle>
        </CardHeader>
        <CardContent>
          {stops.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No stops added yet</p>
          ) : (
            <div className="space-y-3">
              {stops.map((stop) => (
                <div key={stop.stopName} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-bus-primary mr-2" />
                    <div>
                      <p className="font-medium">{stop.stopName}</p>
                      <p className="text-sm text-muted-foreground">{stop.busRoute}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeStop(stop.stopName)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StopsList;