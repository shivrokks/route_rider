import React, { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';

const DriverDashboard: React.FC = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = () => {
    signOut();
  };

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    try {      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,          sender: {
            name: `(Driver) ${user?.fullName || user?.name || 'Unknown'}`,
            email: user?.email || '',
          },
          isDriver: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast({
        title: "Message Sent",
        description: `Successfully sent message: ${content}`,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700"
          >
            Logout
          </Button>
        </div>
        <p>Welcome to the driver dashboard!</p>
        <div className="flex flex-col gap-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4"
              onClick={() => sendMessage("I'm coming!")}
              disabled={isLoading}
            >
              I'm Coming
            </Button>
            <Button
              variant="default"
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4"
              onClick={() => sendMessage("I'm not coming today.")}
              disabled={isLoading}
            >
              I'm Not Coming
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DriverDashboard;
