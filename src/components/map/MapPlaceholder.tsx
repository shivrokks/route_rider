
import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapPlaceholderProps {
  isLoaded: boolean;
}

const MapPlaceholder = ({ isLoaded }: MapPlaceholderProps) => {
  return (
    <div className="absolute inset-0 bg-gray-100">
      {!isLoaded ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <Navigation className="h-10 w-10 text-bus-primary animate-pulse" />
            <p className="mt-2 text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : (
        <div className="relative h-full w-full">
          {/* Placeholder pattern for the map */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%231A73E8' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>

          {/* Bus markers */}
          <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
            <div className={cn(
              "w-6 h-6 bg-bus-primary rounded-full flex items-center justify-center text-white",
              "shadow-lg animate-pulse-location"
            )}>
              <span className="text-xs font-bold">42</span>
            </div>
          </div>
          
          <div className="absolute top-2/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
            <div className={cn(
              "w-6 h-6 bg-bus-accent rounded-full flex items-center justify-center text-white",
              "shadow-lg"
            )}>
              <span className="text-xs font-bold">15</span>
            </div>
          </div>

          <div className="absolute bottom-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className={cn(
              "w-6 h-6 bg-bus-warning rounded-full flex items-center justify-center text-white",
              "shadow-lg"
            )}>
              <span className="text-xs font-bold">7</span>
            </div>
          </div>

          {/* User location */}
          <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-600 rounded-full shadow-lg border-2 border-white"></div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPlaceholder;
