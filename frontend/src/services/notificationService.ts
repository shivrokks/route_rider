
import { UserStop, Bus } from './models/UserStop';

// This would be implemented in a real backend with proper notification services
export const sendBusApproachingNotification = async (
  userStop: UserStop,
  bus: Bus,
  stopsAway: number
): Promise<boolean> => {
  // In a real backend, this would use:
  // 1. Firebase Cloud Messaging for push notifications
  // 2. Twilio or similar for SMS
  // 3. Email services like SendGrid or AWS SES
  
  console.log(`
    Notification would be sent to user ${userStop.userId}:
    Bus ${bus.number} (${bus.route}) is ${stopsAway} stops away from ${userStop.stopName}.
    ETA: ${bus.eta}
  `);
  
  return true; // Indicates successful notification in a mock environment
};

export const checkBusProximityForUser = (userStop: UserStop, bus: Bus): number | null => {
  // Find the user's stop in the bus route
  const userStopIndex = bus.stops.findIndex(stop => stop === userStop.stopName);
  
  if (userStopIndex === -1) {
    return null; // User's stop is not on this bus route
  }
  
  // Calculate how many stops away the bus is
  const stopsAway = userStopIndex - bus.currentStopIndex;
  
  // If the bus is approaching (not passed) and within notification threshold
  if (stopsAway > 0 && stopsAway <= userStop.notifyBeforeStops) {
    return stopsAway;
  }
  
  return null; // Bus is not approaching the user's stop or is too far away
};
