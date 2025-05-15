import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for leaflet default icons
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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
}

const BusMap = ({ fullWidth = false }: BusMapProps) => {
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDummyBusLocation();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchDummyBusLocation = () => {
    const newLocation = {
      lat: 12.9716 + Math.random() * 0.01,
      lng: 77.5946 + Math.random() * 0.01,
    };
    setLocation(newLocation);
  };

  return (
    <div 
      ref={mapContainerRef}
      className={`relative h-[500px] w-full ${fullWidth ? 'border-x-0' : 'rounded-lg'} overflow-hidden border`}
      style={{ 
        position: 'relative',
        zIndex: 1 
      }}
    >
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        attributionControl={!fullWidth}
        zoomControl={!fullWidth}
        whenCreated={(map) => {
          // Force map to update its size
          setTimeout(() => {
            map.invalidateSize();
          }, 200);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[location.lat, location.lng]} icon={icon}>
          <Popup>📍 College Bus Location</Popup>
        </Marker>
        <MapResizer />
      </MapContainer>
    </div>
  );
};

export default BusMap;
