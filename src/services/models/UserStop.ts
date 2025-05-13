
// This is a TypeScript interface for the MongoDB model
// In an actual backend implementation, this would be used with Mongoose

export interface UserStop {
  userId: string;
  stopName: string;
  busRoute: string;
  notifyBeforeStops: number;
  enablePushNotifications: boolean;
  enableSmsNotifications: boolean;
  phoneNumber?: string;
}

export interface Bus {
  id: string;
  number: string;
  route: string;
  status: string;
  position: string;
  driver: string;
  capacity: string;
  nextStop: string;
  eta: string;
  stops: string[];
  currentStopIndex: number;
}
