import { LatLngTuple } from 'leaflet';

interface RouteResponse {
  routes: {
    geometry: {
      coordinates: number[][];
    };
    distance: number;
  }[];
}

// Using OSRM (OpenStreetMap Routing Machine) for road routing
export async function getRouteCoordinates(
  startPos: string | LatLngTuple,
  endPos: string | LatLngTuple
): Promise<LatLngTuple[]> {
  // Convert string positions to tuples if needed
  const start = typeof startPos === 'string' ? startPos.split(',').map(Number) as LatLngTuple : startPos;
  const end = typeof endPos === 'string' ? endPos.split(',').map(Number) as LatLngTuple : endPos;

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      console.error('Route fetch failed:', response.statusText);
      return [start, end]; // Fallback to straight line
    }

    const data: RouteResponse = await response.json();
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng] as LatLngTuple);
  } catch (error) {
    console.error('Route calculation failed:', error);
    return [start, end]; // Fallback to straight line
  }
}

export function calculateDistance(coordinates: LatLngTuple[]): number {
  let totalDistance = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lng1] = coordinates[i];
    const [lat2, lng2] = coordinates[i + 1];
    
    const R = 6371; // Earth's radius in kilometers
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    totalDistance += R * c;
  }

  return totalDistance; // Distance in kilometers
}

export function formatDistance(kilometers: number): string {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  }
  return `${kilometers.toFixed(1)}km`;
}
