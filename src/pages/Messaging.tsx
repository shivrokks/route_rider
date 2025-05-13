
import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample data
const conversations = [
  {
    id: 1,
    driver: "John Smith",
    busNumber: "42",
    lastMessage: "I'll be arriving in about 5 minutes.",
    time: "5m ago",
    unread: true,
  },
  {
    id: 2,
    driver: "Sarah Johnson",
    busNumber: "15",
    lastMessage: "There's heavy traffic on Main Street. Expect delays.",
    time: "30m ago",
    unread: false,
  },
  {
    id: 3,
    driver: "Michael Brown",
    busNumber: "7",
    lastMessage: "The bus is currently full. Next one in 10 minutes.",
    time: "1h ago",
    unread: false,
  },
];

const messages = [
  {
    id: 1,
    sender: "user",
    content: "Hi, when will you arrive at Downtown Transit Center?",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "driver",
    content: "Hello! I'm currently 3 stops away. Should be there in about 5 minutes.",
    time: "10:31 AM",
  },
  {
    id: 3,
    sender: "user",
    content: "Great! Is the bus crowded?",
    time: "10:31 AM",
  },
  {
    id: 4,
    sender: "driver",
    content: "Not too bad. There are several seats available.",
    time: "10:32 AM",
  },
  {
    id: 5,
    sender: "driver",
    content: "I'll be arriving in about 5 minutes.",
    time: "10:35 AM",
  },
];

const Messaging = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In a real app, this would send the message to an API
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Contact bus drivers and receive updates</p>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[60vh] md:h-[calc(100vh-220px)]">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={cn(
                        "flex items-start p-3 border-b last:border-0 cursor-pointer hover:bg-slate-50 transition-colors",
                        selectedConversation === conversation.id && "bg-slate-50"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-bus-primary flex items-center justify-center text-white mr-3">
                        <span className="font-medium">{conversation.busNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{conversation.driver}</h3>
                          <span className="text-xs text-muted-foreground">{conversation.time}</span>
                        </div>
                        <p className="text-sm truncate text-muted-foreground">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.unread && (
                        <Badge className="ml-2 bg-bus-primary">New</Badge>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              {selectedConversation ? (
                <>
                  <CardHeader className="py-3 border-b">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-bus-primary flex items-center justify-center text-white mr-3">
                        <span className="font-medium text-sm">
                          {conversations.find(c => c.id === selectedConversation)?.busNumber}
                        </span>
                      </div>
                      <CardTitle className="text-lg">
                        {conversations.find(c => c.id === selectedConversation)?.driver}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Bus #{conversations.find(c => c.id === selectedConversation)?.busNumber} Driver
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[40vh] md:h-[calc(100vh-320px)] p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              message.sender === "user" ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[80%] rounded-lg p-3",
                                message.sender === "user"
                                  ? "bg-bus-primary text-white rounded-br-none"
                                  : "bg-slate-100 text-slate-900 rounded-bl-none"
                              )}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={cn(
                                "text-xs mt-1",
                                message.sender === "user" ? "text-white/70" : "text-slate-500"
                              )}>
                                {message.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="border-t p-3">
                    <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                      <Input 
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardFooter>
                </>
              ) : (
                <div className="h-[60vh] flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium text-lg">No conversation selected</h3>
                    <p className="text-muted-foreground">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure your alert preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground py-8">
                No active notifications. Set alerts in the map view.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messaging;
