
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BusRegistration = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Registration Successful",
        description: "The bus has been registered successfully",
      });
      
      // Reset form (in a real app, you would use form state)
      const form = e.target as HTMLFormElement;
      form.reset();
    }, 1500);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Register a New Bus</h1>
        <p className="text-muted-foreground">Add a new bus to the tracking system</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Bus Information</CardTitle>
            <CardDescription>
              Enter the details of the bus you want to register
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="busNumber">Bus Number</Label>
              <Input 
                id="busNumber" 
                placeholder="e.g. 42" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="routeName">Route Name</Label>
              <Input 
                id="routeName" 
                placeholder="e.g. Downtown - City Center" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input 
                  id="driverName" 
                  placeholder="e.g. John Smith" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Select required defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (30 seats)</SelectItem>
                    <SelectItem value="medium">Medium (50 seats)</SelectItem>
                    <SelectItem value="high">High (80 seats)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Additional information about this bus route" 
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register Bus"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default BusRegistration;
