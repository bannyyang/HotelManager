import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface RoomCardProps {
  hotel: any;
  onBook: () => void;
}

export function RoomCard({ hotel, onBook }: RoomCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={hotel.imageUrl || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200"} 
        alt={hotel.name}
        className="w-full h-40 object-cover"
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
          <div className="flex items-center">
            <Star className="text-yellow-500 h-4 w-4" />
            <span className="text-sm text-gray-600 ml-1">{hotel.rating || "4.5"}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">{hotel.address}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">¥299</span>
            <span className="text-sm text-gray-600">/night</span>
          </div>
          <Button 
            className="bg-primary hover:bg-blue-700"
            onClick={onBook}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
