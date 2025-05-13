
import { UserStop } from './models/UserStop';

// Note: In a real implementation, these functions would interact with MongoDB
// using Mongoose. Since we're in a frontend-only environment without a real
// backend connection, these are stubbed functions.

// This would be replaced with actual MongoDB operations in a real backend
const mockUserStops: UserStop[] = [];

export const getUserStops = async (userId: string): Promise<UserStop[]> => {
  // In a real backend, this would query MongoDB
  // return await UserStopModel.find({ userId });
  return mockUserStops.filter(stop => stop.userId === userId);
};

export const addUserStop = async (userStop: UserStop): Promise<UserStop> => {
  // In a real backend, this would add to MongoDB
  // return await UserStopModel.create(userStop);
  mockUserStops.push(userStop);
  return userStop;
};

export const updateUserStop = async (userId: string, stopName: string, updates: Partial<UserStop>): Promise<UserStop | null> => {
  // In a real backend, this would update MongoDB
  // return await UserStopModel.findOneAndUpdate({ userId, stopName }, updates, { new: true });
  const stopIndex = mockUserStops.findIndex(stop => stop.userId === userId && stop.stopName === stopName);
  if (stopIndex === -1) return null;
  
  mockUserStops[stopIndex] = { ...mockUserStops[stopIndex], ...updates };
  return mockUserStops[stopIndex];
};

export const deleteUserStop = async (userId: string, stopName: string): Promise<boolean> => {
  // In a real backend, this would delete from MongoDB
  // const result = await UserStopModel.deleteOne({ userId, stopName });
  // return result.deletedCount > 0;
  const initialLength = mockUserStops.length;
  const newStops = mockUserStops.filter(
    stop => !(stop.userId === userId && stop.stopName === stopName)
  );
  mockUserStops.length = 0;
  mockUserStops.push(...newStops);
  return initialLength > mockUserStops.length;
};
