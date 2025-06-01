import { useEffect, useState, useRef, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngTuple } from 'leaflet';
import { getBusLocations } from '@/services/busLocationService';
import { getRouteCoordinates, calculateDistance } from '@/services/routingService';
import type { Bus, BusStop } from '@/services/models/UserStop';

// Fix for leaflet default icons
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const stopIcon = L.icon({
  iconUrl: "/bus-stop-icon.jpg",
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [1, -34],
});

// Component to handle map resize events
function MapResizer() {
  const map = useMap();
  
  useEffect(() => {
    // Force a resize after the component mounts
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // Add resize listener
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
  
  return null;
}

interface BusMapProps {
  fullWidth?: boolean;
  'data-lov-id'?: string;
}

// Remove the spread operator from props to explicitly control what gets passed down
const BusMap = ({ fullWidth = false }: BusMapProps) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [center, setCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [routeCoordinates, setRouteCoordinates] = useState<{ [key: string]: LatLngTuple[] }>({});
  const [routeDistances, setRouteDistances] = useState<{ [key: string]: number[] }>({});
  const [lastRouteUpdate, setLastRouteUpdate] = useState<{ [key: string]: number }>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const convertToLatLng = (pos: string | [number, number]): LatLngTuple => {
    if (typeof pos === 'string') {
      return pos.split(',').map(Number) as LatLngTuple;
    }
    return pos;
  };

  // Cache validation interval (10 seconds)
  const ROUTE_UPDATE_INTERVAL = 10000;

  // Fetch route coordinates between stops
  const fetchRouteCoordinates = async (bus: Bus) => {
    const now = Date.now();
    // Only update routes every ROUTE_UPDATE_INTERVAL unless it's the first time
    if (lastRouteUpdate[bus.id] && now - lastRouteUpdate[bus.id] < ROUTE_UPDATE_INTERVAL) {
      return;
    }

    try {
      const coordinates: LatLngTuple[] = [];
      const distances: number[] = [];
      const stops = bus.routeStops;
      
      for (let i = 0; i < stops.length - 1; i++) {
        const start = convertToLatLng(stops[i].position);
        const end = convertToLatLng(stops[i + 1].position);
        const routeSegment = await getRouteCoordinates(start, end);
        coordinates.push(...routeSegment);
        
        // Calculate distance for this segment
        const segmentDistance = calculateDistance(routeSegment);
        distances.push(segmentDistance);
      }

      setRouteCoordinates(prev => ({
        ...prev,
        [bus.id]: coordinates
      }));

      setRouteDistances(prev => ({
        ...prev,
        [bus.id]: distances
      }));

      setLastRouteUpdate(prev => ({
        ...prev,
        [bus.id]: now
      }));
    } catch (error) {
      console.error('Error fetching route coordinates:', error);
      // Fallback to straight lines if route fetching fails
      const stops = bus.routeStops;
      const straightLineCoords = stops.map(stop => convertToLatLng(stop.position));
      
      setRouteCoordinates(prev => ({
        ...prev,
        [bus.id]: straightLineCoords
      }));

      // Calculate straight-line distances
      const straightLineDistances = stops.slice(0, -1).map((stop, i) => 
        calculateDistance([
          convertToLatLng(stop.position),
          convertToLatLng(stops[i + 1].position)
        ])
      );

      setRouteDistances(prev => ({
        ...prev,
        [bus.id]: straightLineDistances
      }));
    }
  };

  useEffect(() => {
    const fetchBuses = async () => {
      const busList = await getBusLocations();
      setBuses(busList);
      
      // Fetch route coordinates for each bus
      for (const bus of busList) {
        await fetchRouteCoordinates(bus);
      }
      
      if (busList.length > 0) {
        const [lat, lng] = convertToLatLng(busList[0].position);
        setCenter({ lat, lng });
      }
    };
    
    fetchBuses();
    const interval = setInterval(fetchBuses, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={mapContainerRef}
      className={`relative h-[500px] w-full ${fullWidth ? 'border-x-0' : 'rounded-lg'} overflow-hidden border`}
      style={{ position: 'relative', zIndex: 1 }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        attributionControl={!fullWidth}
        zoomControl={!fullWidth}
      >
        <div>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {buses.map((bus) => {
            const busPosition = convertToLatLng(bus.position);
            const routePath = routeCoordinates[bus.id] || 
              bus.routeStops.map(stop => convertToLatLng(stop.position));
            const distances = routeDistances[bus.id] || [];
            
            // Extract bus-related UI into its own component to isolate Fragment usage
            return (
              <BusMapMarker 
                key={bus.id}
                bus={bus}
                position={busPosition}
                routePath={routePath}
                distances={distances}
                routeStops={bus.routeStops}
                convertToLatLng={convertToLatLng}
                currentStopIndex={bus.currentStopIndex}
              />
            );
          })}
          <MapResizer />
        </div>
      </MapContainer>
    </div>
  );
};

interface BusMapMarkerProps {
  bus: Bus;
  position: LatLngTuple;
  routePath: LatLngTuple[];
  distances: number[];
  routeStops: BusStop[];
  convertToLatLng: (pos: string | [number, number]) => LatLngTuple;
  currentStopIndex: number;
}

const BusMapMarker = ({
  bus,
  position,
  routePath,
  distances,
  routeStops,
  convertToLatLng,
  currentStopIndex
}: BusMapMarkerProps) => (
  <>
    <Polyline
      positions={routePath}
      color={bus.number === "42" ? '#2563eb' : '#16a34a'}
      weight={3}
      opacity={0.8}
    />
    {routeStops.map((stop, stopIdx) => (
      <Marker
        key={`${bus.id}-stop-${stopIdx}`}
        position={convertToLatLng(stop.position)}
        icon={stopIcon}
      >
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">🚏 {stop.name}</p>
            {stopIdx === currentStopIndex && (
              <p className="text-blue-600">Current Stop</p>
            )}
            {stopIdx === currentStopIndex + 1 && (
              <p className="text-green-600">Next Stop</p>
            )}
            {stopIdx > 0 && (
              <p className="text-gray-600">
                Distance from previous: {distances[stopIdx - 1]?.toFixed(1) || '...'} km
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    ))}
    <Marker
      position={position}
      icon={icon}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-semibold">🚌 Bus {bus.number}</p>
          <p className="text-muted-foreground">{bus.route}</p>
          <hr className="my-1" />
          <p>🚘 Driver: {bus.driver}</p>
          <p>🎯 Next: {bus.nextStop}</p>
          <p>⏱️ ETA: {bus.eta}</p>
          <p className={bus.status === "On Time" ? "text-green-600" : "text-red-600"}>
            {bus.status}
          </p>
          {distances.length > 0 && (
            <p>📏 Total route: {distances.reduce((a, b) => a + b, 0).toFixed(1)} km</p>
          )}
        </div>
      </Popup>
    </Marker>
  </>
);

export default BusMap;
