import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Bus, ChevronDown, ChevronUp, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusRoute {
  stopName: string;
  time: string;
}

interface BusCardProps {
  bus: {
    id: number;
    name: string;
    number: string;
    route: string;
    driver: {
      name: string;
      image: string;
    };
    stops: BusRoute[];
  };
}

const BusCard = ({ bus }: BusCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      isOpen ? "border-bus-primary/50" : ""
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-bus-primary flex items-center justify-center text-white">
              <Bus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{bus.name}</h3>
                <span className="text-sm text-muted-foreground">({bus.number})</span>
              </div>
              <p className="text-sm text-muted-foreground">{bus.route}</p>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <CardContent className="border-t pt-3">
            <div className="space-y-4">
              {/* Driver Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={bus.driver.image} 
                    alt={bus.driver.name} 
                  />
                  <AvatarFallback>
                    {bus.driver.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{bus.driver.name}</p>
                  <p className="text-sm text-muted-foreground">Driver</p>
                </div>
              </div>

              {/* Route Stops */}
              <div className="space-y-2">
                <p className="font-medium">Route Stops</p>
                <div className="space-y-2">
                  {bus.stops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-bus-primary" />
                      <span>{stop.stopName}</span>
                      <span className="text-muted-foreground ml-auto">{stop.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default BusCard;