export interface User {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  phoneNumber: string | null;
  isDriver?: boolean;
  notificationPreferences: {
    sms: boolean;
    push: boolean;
    email: boolean;
  };
  deviceTokens: string[];
  createdAt: string;
  updatedAt: string;
}