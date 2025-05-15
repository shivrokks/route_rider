
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Message {
  _id: string;
  content: string;
  sender: {
    name: string;
    email: string;
  };
  timestamp: string;
}

const Messaging = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn, user } = useUser();
  const { toast } = useToast();
  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages');
      const data = await response.json();
      console.log('Fetched messages:', data); // Debug log
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Could not load messages",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    // Set up polling to fetch new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);  const sendMessage = async () => {
    if (!isSignedIn || !user || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      // Get the full name in order of preference
      const senderName = user.fullName || // First try fullName
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : // Then try firstName + lastName
         user.firstName || user.lastName || // Then try either firstName or lastName
         'Unknown User'); // Fallback

      // Get the primary email address
      const senderEmail = user.emailAddresses[0]?.emailAddress;
      
      if (!senderEmail) {
        throw new Error('No email address available');
      }

      console.log('Sending message with sender:', { 
        name: senderName, 
        email: senderEmail
      }); // Debug log

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          sender: {
            name: senderName,
            email: user.emailAddresses[0]?.emailAddress
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Chat with other users</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full pr-4">            <div className="space-y-4">
              {messages && messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={cn(
                      "flex flex-col space-y-1 p-3 rounded-lg max-w-[80%]",
                      message.sender.email === user?.emailAddresses[0]?.emailAddress
                        ? "bg-primary/10 ml-auto"
                        : "bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <span className="font-semibold text-sm">{message.sender?.name || 'Unknown User'}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={!isSignedIn || isLoading}
          />
          <Button 
            onClick={sendMessage}
            disabled={!isSignedIn || isLoading || !newMessage.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Messaging;
