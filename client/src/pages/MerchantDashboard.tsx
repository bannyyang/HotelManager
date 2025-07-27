import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { StatsCard } from "@/components/StatsCard";
import { RoomStatus } from "@/components/RoomStatus";
import { 
  Hotel, 
  BarChart3, 
  Bed, 
  ClipboardList, 
  Users, 
  Settings, 
  Plus,
  UserCheck,
  LogIn,
  DollarSign,
} from "lucide-react";

export default function MerchantDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  // Redirect if not authenticated or not merchant
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'merchant'))) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: hotels = [], isLoading: hotelsLoading } = useQuery({
    queryKey: ['/api/merchant/hotels'],
    enabled: isAuthenticated && user?.role === 'merchant',
    retry: false,
  });

  const { data: hotelStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/hotels', selectedHotel?.id, 'stats'],
    enabled: isAuthenticated && !!selectedHotel?.id,
    retry: false,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/hotels', selectedHotel?.id, 'rooms'],
    enabled: isAuthenticated && !!selectedHotel?.id,
    retry: false,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: isAuthenticated && !!selectedHotel?.id,
    retry: false,
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ roomId, updates }: { roomId: string; updates: any }) => {
      const response = await apiRequest('PUT', `/api/rooms/${roomId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
      toast({
        title: "Success",
        description: "Room updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      });
    },
  });

  // Set first hotel as selected by default
  useEffect(() => {
    if (hotels.length > 0 && !selectedHotel) {
      setSelectedHotel(hotels[0]);
    }
  }, [hotels, selectedHotel]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hotelsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center">No Hotels Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                You don't have any hotels registered yet. Contact admin to register your hotel.
              </p>
              <Button onClick={() => window.location.href = '/api/logout'}>
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Hotel className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedHotel?.name || 'Select Hotel'}
                </h3>
                <p className="text-sm text-gray-600">Merchant Dashboard</p>
              </div>
            </div>
          </div>
          
          <nav className="px-4 pb-4">
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start bg-primary text-white hover:bg-blue-700">
                  <BarChart3 className="mr-3 h-4 w-4" />
                  Dashboard
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <Bed className="mr-3 h-4 w-4" />
                  Room Management
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <ClipboardList className="mr-3 h-4 w-4" />
                  Bookings
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-3 h-4 w-4" />
                  Guests
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="mr-3 h-4 w-4" />
                  Analytics
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <div className="flex items-center space-x-4">
                {hotels.length > 1 && (
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={selectedHotel?.id || ''}
                    onChange={(e) => {
                      const hotel = hotels.find(h => h.id === e.target.value);
                      setSelectedHotel(hotel);
                    }}
                  >
                    {hotels.map((hotel: any) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                )}
                <Button className="bg-primary hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Booking
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <StatsCard
                title="Total Rooms"
                value={hotelStats?.totalRooms || 0}
                icon={Bed}
                color="blue"
                loading={statsLoading}
              />
              <StatsCard
                title="Occupied"
                value={hotelStats?.occupiedRooms || 0}
                icon={UserCheck}
                color="green"
                loading={statsLoading}
              />
              <StatsCard
                title="Check-ins Today"
                value={hotelStats?.todayCheckIns || 0}
                icon={LogIn}
                color="yellow"
                loading={statsLoading}
              />
              <StatsCard
                title="Revenue Today"
                value={`¥${hotelStats?.todayRevenue || 0}`}
                icon={DollarSign}
                color="green"
                loading={statsLoading}
              />
            </div>

            {/* Room Status Grid */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Room Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {rooms.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No rooms found for this hotel.</p>
                ) : (
                  <RoomStatus 
                    rooms={rooms} 
                    onUpdateRoom={(roomId, updates) => updateRoomMutation.mutate({ roomId, updates })}
                  />
                )}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Button variant="outline">View All</Button>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookings found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Guest</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Room</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Check-in</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Check-out</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((booking: any) => (
                          <tr key={booking.id} className="border-b border-gray-100">
                            <td className="py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <Users className="text-gray-600 h-4 w-4" />
                                </div>
                                <span className="font-medium">Guest {booking.id.slice(-4)}</span>
                              </div>
                            </td>
                            <td className="py-3 text-gray-600">Room {booking.roomId.slice(-3)}</td>
                            <td className="py-3 text-gray-600">
                              {new Date(booking.checkInDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 text-gray-600">
                              {new Date(booking.checkOutDate).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <Badge 
                                variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                className={booking.status === 'confirmed' ? 'bg-green-500' : ''}
                              >
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="py-3 font-semibold">¥{booking.totalAmount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
