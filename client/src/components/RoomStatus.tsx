import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoomStatusProps {
  rooms: any[];
  onUpdateRoom: (roomId: string, updates: any) => void;
}

export function RoomStatus({ rooms, onUpdateRoom }: RoomStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-gray-400';
      case 'cleaning': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'occupied': return 'Occupied';
      case 'cleaning': return 'Cleaning';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  if (rooms.length === 0) {
    return <p className="text-gray-500 text-center py-8">No rooms configured</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-8 gap-3 mb-6">
        {rooms.slice(0, 24).map((room: any) => (
          <div key={room.id} className="relative">
            <Button
              variant="ghost"
              className={`w-16 h-16 ${getStatusColor(room.status)} text-white font-semibold hover:shadow-md transition-shadow p-0`}
              onClick={() => {
                const newStatus = room.status === 'available' ? 'occupied' : 'available';
                onUpdateRoom(room.id, { status: newStatus });
              }}
            >
              {room.roomNumber}
            </Button>
            <div className={`absolute -top-1 -right-1 w-4 h-4 ${getStatusColor(room.status)} rounded-full`}></div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-gray-600">Occupied</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Cleaning</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Maintenance</span>
        </div>
      </div>
    </div>
  );
}
