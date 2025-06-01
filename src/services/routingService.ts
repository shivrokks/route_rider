import { LatLngTuple } from 'leaflet';

interface RouteResponse {
  routes: {
    geometry: {
      coordinates: number[][];
    };
    distance: number;
  }[];
}

// Simple in-memory cache for routes
const routeCache = new Map<string, { data: LatLngTuple[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache TTL

// Queue for managing API requests
const requestQueue: { resolve: (value: LatLngTuple[]) => void; start: LatLngTuple; end: LatLngTuple }[] = [];
let isProcessingQueue = false;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

// Generate a cache key from coordinates
function getCacheKey(start: LatLngTuple, end: LatLngTuple): string {
  return `${start[0]},${start[1]};${end[0]},${end[1]}`;
}

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  const now = Date.now();
  
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (!request) break;
    
    const { resolve, start, end } = request;
    const cacheKey = getCacheKey(start, end);
    
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
        {
          headers: {
            'User-Agent': 'BusTrackerApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data: RouteResponse = await response.json();
      const coordinates = data.routes[0].geometry.coordinates.map(
        ([lng, lat]): LatLngTuple => [lat, lng]
      );

      routeCache.set(cacheKey, { data: coordinates, timestamp: now });
      resolve(coordinates);
    } catch (error) {
      console.error('Error fetching route:', error);
      resolve([start, end]); // Fallback to straight line
    }

    // Wait before processing next request
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL));
  }
  
  isProcessingQueue = false;
}

// Using OSRM (OpenStreetMap Routing Machine) for road routing
export async function getRouteCoordinates(
  startPos: string | LatLngTuple,
  endPos: string | LatLngTuple
): Promise<LatLngTuple[]> {
  // Convert string positions to tuples if needed
  const start = typeof startPos === 'string' ? startPos.split(',').map(Number) as LatLngTuple : startPos;
  const end = typeof endPos === 'string' ? endPos.split(',').map(Number) as LatLngTuple : endPos;

  const cacheKey = getCacheKey(start, end);
  const cached = routeCache.get(cacheKey);
  
  // Return cached result if available and not expired
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  // Remove expired cache entries
  routeCache.forEach((value, key) => {
    if (Date.now() - value.timestamp > CACHE_TTL) {
      routeCache.delete(key);
    }
  });

  // Queue the request
  return new Promise((resolve) => {
    requestQueue.push({ resolve, start, end });
    processQueue(); // Try to process queue
  });
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
