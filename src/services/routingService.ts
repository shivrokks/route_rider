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
const routeCache = new Map<string, LatLngTuple[]>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// Track last request time to implement rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

// Generate a cache key from coordinates
function getCacheKey(start: LatLngTuple, end: LatLngTuple): string {
  return `${start[0]},${start[1]};${end[0]},${end[1]}`;
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
  if (cached) {
    return cached;
  }

  // Rate limiting: ensure minimum time between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    // If we're making requests too quickly, return a straight line
    console.warn('Rate limiting active - using straight line path');
    return [start, end];
  }

  lastRequestTime = now;

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
      {
        headers: {
          'User-Agent': 'BusTrackerApp/1.0 (https://your-app-url.com; contact@example.com)'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limited by OSRM - using straight line path');
      } else {
        console.error('Route fetch failed:', response.statusText);
      }
      return [start, end]; // Fallback to straight line
    }

    const data: RouteResponse = await response.json();
    const result = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng] as LatLngTuple);
    
    // Cache the result
    routeCache.set(cacheKey, result);
    
    // Set a timeout to clear the cache entry
    setTimeout(() => {
      routeCache.delete(cacheKey);
    }, CACHE_TTL);
    
    return result;
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
