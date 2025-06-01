import { Bus, BusStop } from './models/UserStop';
import { sendBusApproachingNotification, checkBusProximityForUser } from './notificationService';

// In a real implementation, this would connect to a real-time database like Firebase
// For now, we'll simulate bus locations

// Sample bus data
const buses: Bus[] = [
  {
    id: "bus-1",
    number: "42",
    route: "Route 42",
    status: "On Time",
    position: "12.9716,77.5946", // Bangalore coordinates
    driver: "John Smith",
    capacity: "45/50",
    nextStop: "Christ University",
    eta: "2 min",
    routeStops: [
      { name: "Ramaiah Institute of Technology", position: "12.8399,77.6770" },
      { name: "Electronic City Phase 1", position: "13.0307642,77.5548676" },
      { name: "Silk Board", position: "12.9177,77.6238" },
      { name: "HSR Layout", position: "12.9116,77.6474" },
      { name: "Christ University", position: "12.9344,77.6069" },
      { name: "Bangalore Central", position: "12.9700,77.6099" }
    ],
    currentStopIndex: 2
  },
  {
    id: "bus-2",
    number: "15",
    route: "Route 15",
    status: "On Time",
    position: "12.9736,77.5966",
    driver: "Sarah Johnson",
    capacity: "30/50",
    nextStop: "Koramangala",
    eta: "5 min",
    routeStops: [
      { name: "Ramaiah Institute of Technology", position: "12.8399,77.6770" },
      { name: "Whitefield", position: "12.9698,77.7500" },
      { name: "Marathahalli", position: "12.9591,77.6974" },
      { name: "Indiranagar", position: "12.9784,77.6408" },
      { name: "Koramangala", position: "12.9316,77.6246" },
      { name: "BTM Layout", position: "12.9166,77.6101" }
    ],
    currentStopIndex: 2
  }
];

// Simulate real-time bus location updates
export const getBusLocations = async (): Promise<Bus[]> => {
  // In a real implementation, this would fetch from a real-time database
  return buses.map(bus => ({
    ...bus,
    position: updateBusPosition(bus.position)
  }));
};

// Get a specific bus by ID
export const getBusById = async (busId: string): Promise<Bus | null> => {
  const bus = buses.find(b => b.id === busId);
  if (!bus) return null;
  
  return {
    ...bus,
    position: updateBusPosition(bus.position)
  };
};

// Get buses on a specific route
export const getBusesByRoute = async (route: string): Promise<Bus[]> => {
  return buses
    .filter(bus => bus.route === route)
    .map(bus => ({
      ...bus,
      position: updateBusPosition(bus.position)
    }));
};

// Simulate bus movement
const updateBusPosition = (position: string): string => {
  const [lat, lng] = position.split(',').map(Number);
  const newLat = lat + (Math.random() - 0.5) * 0.001;
  const newLng = lng + (Math.random() - 0.5) * 0.001;
  return `${newLat.toFixed(6)},${newLng.toFixed(6)}`;
};

// Move import to top of file
import { getUserStopByUserId } from './userStopService';

// Check if buses are approaching user stops and send notifications
export const checkBusesNearUserStops = async (userId: string): Promise<void> => {
  // In a real implementation, this would be called by a scheduled job
  // or triggered by real-time location updates

  const userStop = await getUserStopByUserId(userId); // Fetch the UserStop object for the user
  if (!userStop) return;

  const busLocations = await getBusLocations();
  for (const bus of busLocations) {
    await checkBusProximityForUser(userStop, bus);
  }
};

// For a real backend implementation with Firebase:
/*
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

export const getBusLocations = async (): Promise<Bus[]> => {
  const busesCollection = collection(db, 'buses');
  const busSnapshot = await getDocs(busesCollection);
  return busSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bus));
};

export const getBusById = async (busId: string): Promise<Bus | null> => {
  const busDoc = doc(db, 'buses', busId);
  const busSnapshot = await getDoc(busDoc);
  
  if (!busSnapshot.exists()) return null;
  return { id: busSnapshot.id, ...busSnapshot.data() } as Bus;
};

export const getBusesByRoute = async (route: string): Promise<Bus[]> => {
  const busesCollection = collection(db, 'buses');
  const busQuery = query(busesCollection, where('route', '==', route));
  const busSnapshot = await getDocs(busQuery);
  
  return busSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bus));
};
*/


