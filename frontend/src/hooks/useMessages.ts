import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface Message {
  _id: string;
  content: string;
  sender: {
    name: string;
    email: string;
  };
  timestamp: string;
  isDriver?: boolean;
}

const LAST_SEEN_KEY = 'last-seen-messages';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { getToken } = useAuth();
  
  // Get seen message IDs from localStorage
  const getSeenMessageIds = (): Set<string> => {
    const seenIds = localStorage.getItem(LAST_SEEN_KEY);
    return new Set(seenIds ? JSON.parse(seenIds) : []);
  };

  // Save seen message IDs to localStorage
  const saveSeenMessageIds = (ids: Set<string>) => {
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(Array.from(ids)));
  };  const fetchMessages = async () => {
    try {
console.log(`${import.meta.env.VITE_BACKEND_URL}/api/messages`);

const token = await getToken();
const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages`, {
  cache: 'no-store',  // Disable caching to always get fresh messages
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        
        // Get currently seen message IDs
        const seenMessageIds = getSeenMessageIds();
        
        // Calculate unread count (messages not in seenMessageIds)
        const newUnreadCount = data.data.filter(
          (msg: Message) => !seenMessageIds.has(msg._id)
        ).length;
        
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAllRead = () => {
    const seenMessageIds = getSeenMessageIds();
    messages.forEach(msg => {
      seenMessageIds.add(msg._id);
    });
    saveSeenMessageIds(seenMessageIds);
    setUnreadCount(0);
  };

  const markMessageRead = (messageId: string) => {
    const seenMessageIds = getSeenMessageIds();
    seenMessageIds.add(messageId);
    saveSeenMessageIds(seenMessageIds);
    setUnreadCount(Math.max(0, unreadCount - 1));
  };
  // Fetch messages initially and every 3 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);
  // Function to add a message locally before server response
  const addMessageLocally = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  return {
    messages,
    unreadCount,
    markAllRead,
    markMessageRead,
    fetchMessages,
    addMessageLocally
  };
};
