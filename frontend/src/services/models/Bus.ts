export interface BusStop {
  name: string;
  position: [number, number]; // [latitude, longitude]
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
  routeStops: BusStop[]; // Array of stops with coordinates
  currentStopIndex: number;
}
