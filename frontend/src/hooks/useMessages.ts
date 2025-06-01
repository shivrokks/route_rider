import { useState, useEffect } from 'react';

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
  
  // Get seen message IDs from localStorage
  const getSeenMessageIds = (): Set<string> => {
    const seenIds = localStorage.getItem(LAST_SEEN_KEY);
    return new Set(seenIds ? JSON.parse(seenIds) : []);
  };

  // Save seen message IDs to localStorage
  const saveSeenMessageIds = (ids: Set<string>) => {
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(Array.from(ids)));
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages');
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

  // Fetch messages initially and every 10 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    messages,
    unreadCount,
    markAllRead,
    markMessageRead,
    fetchMessages
  };
};
