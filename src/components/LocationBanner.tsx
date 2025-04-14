
import React from 'react';
import { Location, locationDescriptions } from '@/data/cards';
import { Calendar, MapPin } from 'lucide-react';

interface LocationBannerProps {
  location: Location;
  day: number;
  daysRemaining: number;
}

const LocationBanner: React.FC<LocationBannerProps> = ({ location, day, daysRemaining }) => {
  // Capitalize the first letter of the location
  const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1);
  
  // Find out which location day we're on (1-3)
  const locationDay = ((day - 1) % 3) + 1;
  
  return (
    <div className="bg-gradient-to-r from-black to-black/40 p-4 rounded-lg mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-bold">{formattedLocation}</h2>
          <span className="text-sm bg-black/50 px-2 py-0.5 rounded-full">
            Day {locationDay} of 3
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          <div className="text-sm">
            Game Day: <span className="font-bold">{day}</span> / 18
          </div>
          <div className="text-sm text-red-400">
            {daysRemaining <= 5 && `${daysRemaining} days remaining!`}
          </div>
        </div>
      </div>
      
      <p className="mt-2 text-sm text-gray-300">{locationDescriptions[location]}</p>
    </div>
  );
};

export default LocationBanner;
