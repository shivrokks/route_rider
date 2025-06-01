import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useMessages } from '@/hooks/useMessages';

const Messaging = () => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { messages, markMessageRead, markAllRead } = useMessages();
  const { isSignedIn, user: clerkUser } = useClerkUser();
  const { toast } = useToast();
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Mark all messages as read when component mounts
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  // Setup intersection observer to detect when messages are visible
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              markMessageRead(messageId);
            }
          }
        });
      }
    );

    // Observe all message elements
    document.querySelectorAll('[data-message-id]').forEach(element => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, markMessageRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          sender: {
            name: clerkUser?.fullName || clerkUser?.username || 'Anonymous',
            email: clerkUser?.primaryEmailAddress?.emailAddress || '',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <CardDescription>
            Chat with drivers and passengers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full pr-4">
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  data-message-id={message._id}
                  className={cn(
                    "flex flex-col gap-1 p-4 rounded-lg",
                    message.isDriver 
                      ? "bg-yellow-100 dark:bg-yellow-900" 
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {message.isDriver ? `(Driver) ${message.sender.name}` : message.sender.name}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newMessage.trim()) {
                handleSendMessage();
              }
            }}
            className="flex w-full gap-2"
          >
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isSignedIn || isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!isSignedIn || !newMessage.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Messaging;
