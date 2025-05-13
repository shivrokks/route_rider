import api from './api';
import { User } from './models/User';

// Get the current user's profile
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  updates: Partial<User>
): Promise<User> => {
  try {
    const response = await api.put('/users/profile', updates);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Register device token for push notifications
export const registerDeviceToken = async (token: string): Promise<boolean> => {
  try {
    await api.post('/users/device-token', { token });
    return true;
  } catch (error) {
    console.error('Error registering device token:', error);
    return false;
  }
};