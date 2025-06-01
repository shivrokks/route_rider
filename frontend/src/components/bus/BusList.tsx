import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BusCard from './BusCard';

const buses = [
  { 
    id: 1,
    name: "Bus 11",
    number: "KA-01-1234",
    route: "Ramaiah Institute of Technology",
    driver: {
      name: "John Smith",
      image: "/drivers/driver1.jpg"
    },
    stops: [
      { stopName: "Majestic", time: "8:00 AM" },
      { stopName: "Yeshwanthpur", time: "8:30 AM" },
      { stopName: "Mathikere", time: "9:00 AM" },
      { stopName: "RIT", time: "9:30 AM" }
    ]
  },
  { 
    id: 2,
    name: "Bus 12",
    number: "KA-01-5678",
    route: "Ramaiah Institute of Technology",
    driver: {
      name: "Jane Doe",
      image: "/drivers/driver2.jpg"
    },
    stops: [
      { stopName: "Whitefield", time: "7:30 AM" },
      { stopName: "KR Puram", time: "8:00 AM" },
      { stopName: "Hennur", time: "8:30 AM" },
      { stopName: "RIT", time: "9:00 AM" }
    ]
  },
  { 
    id: 3,
    name: "Bus 13",
    number: "KA-01-9012",
    route: "Ramaiah Institute of Technology",
    driver: {
      name: "Mike Johnson",
      image: "/drivers/driver3.jpg"
    },
    stops: [
      { stopName: "Electronic City", time: "7:00 AM" },
      { stopName: "Silk Board", time: "7:45 AM" },
      { stopName: "HSR Layout", time: "8:15 AM" },
      { stopName: "RIT", time: "9:00 AM" }
    ]
  }
];

const BusList = () => {
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full max-w-[180px]">
            <SelectValue placeholder="Filter buses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buses</SelectItem>
            <SelectItem value="11">Bus 11</SelectItem>
            <SelectItem value="12">Bus 12</SelectItem>
            <SelectItem value="13">Bus 13</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="whitespace-nowrap">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {buses
          .filter(bus => filter === "all" || bus.name.includes(filter))
          .map(bus => (
            <BusCard key={bus.id} bus={bus} />
          ))
        }
      </div>
    </div>
  );
};

export default BusList;