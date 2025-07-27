import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { RoomCard } from "@/components/RoomCard";
import { BookingForm } from "@/components/BookingForm";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Home, 
  Bookmark, 
  CalendarDays, 
  User 
} from "lucide-react";

export default function CustomerApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: hotels = [], isLoading: hotelsLoading } = useQuery({
    queryKey: ['/api/hotels'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: userBookings = [] } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: isAuthenticated,
    retry: false,
  });

  const searchMutation = useMutation({
    mutationFn: async (filters: any) => {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      const response = await apiRequest('GET', `/api/hotels?${params.toString()}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/hotels'], data);
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
        description: "Failed to search hotels",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    searchMutation.mutate(searchParams);
  };

  const handleBookHotel = (hotel: any) => {
    setSelectedHotel(hotel);
    setShowBookingForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Mobile App Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white text-sm" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hello,</p>
                <p className="text-sm font-semibold">
                  {user?.firstName || user?.email || 'Guest'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-md mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Find Your Perfect Stay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="destination"
                  placeholder="Where are you going?"
                  className="pl-10"
                  value={searchParams.city}
                  onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="checkin">Check-in</Label>
                <Input
                  id="checkin"
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="checkout">Check-out</Label>
                <Input
                  id="checkout"
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="guests">Guests</Label>
              <Select 
                value={searchParams.guests.toString()} 
                onValueChange={(value) => setSearchParams({ ...searchParams, guests: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Guest</SelectItem>
                  <SelectItem value="2">2 Guests</SelectItem>
                  <SelectItem value="3">3 Guests</SelectItem>
                  <SelectItem value="4">4+ Guests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-blue-700" 
              onClick={handleSearch}
              disabled={searchMutation.isPending}
            >
              <Search className="mr-2 h-4 w-4" />
              {searchMutation.isPending ? 'Searching...' : 'Search Hotels'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Hotel Listings */}
      <div className="max-w-md mx-auto px-4 pb-20">
        <h3 className="text-lg font-semibold mb-4">
          {searchParams.city ? `Hotels in ${searchParams.city}` : 'Popular Hotels'}
        </h3>
        
        {hotelsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="w-full h-40 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-2 w-2/3"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No hotels found. Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {hotels.map((hotel: any) => (
              <RoomCard
                key={hotel.id}
                hotel={hotel}
                onBook={() => handleBookHotel(hotel)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
        <div className="flex items-center justify-around py-3">
          <Button variant="ghost" className="flex flex-col items-center space-y-1 text-primary">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400">
            <Bookmark className="h-5 w-5" />
            <span className="text-xs">Saved</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400">
            <CalendarDays className="h-5 w-5" />
            <span className="text-xs">Bookings</span>
            {userBookings.length > 0 && (
              <Badge variant="secondary" className="h-4 w-4 text-xs p-0 rounded-full">
                {userBookings.length}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400">
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedHotel && (
        <BookingForm
          hotel={selectedHotel}
          searchParams={searchParams}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedHotel(null);
          }}
        />
      )}
    </div>
  );
}
