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
import { 
  Crown, 
  BarChart3, 
  Store, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Plus,
  Hotel,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
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

  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/platform/stats'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: hotels = [], isLoading: hotelsLoading } = useQuery({
    queryKey: ['/api/hotels'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const updateHotelStatusMutation = useMutation({
    mutationFn: async ({ hotelId, status }: { hotelId: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/admin/hotels/${hotelId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
      toast({
        title: "Success",
        description: "Hotel status updated successfully",
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
        description: "Failed to update hotel status",
        variant: "destructive",
      });
    },
  });

  const pendingHotels = hotels.filter((hotel: any) => hotel.status === 'pending');
  const approvedHotels = hotels.filter((hotel: any) => hotel.status === 'approved');

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
      
      <div className="flex h-screen pt-16">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Platform Admin</h3>
                <p className="text-sm text-gray-600">System Management</p>
              </div>
            </div>
          </div>
          
          <nav className="px-4 pb-4">
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start bg-purple-600 text-white hover:bg-purple-700">
                  <BarChart3 className="mr-3 h-4 w-4" />
                  Overview
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <Store className="mr-3 h-4 w-4" />
                  Merchants
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-3 h-4 w-4" />
                  Users
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="mr-3 h-4 w-4" />
                  Payments
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <TrendingUp className="mr-3 h-4 w-4" />
                  Analytics
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-3 h-4 w-4" />
                  System Settings
                </Button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Admin Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Admin Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
              <div className="flex items-center space-x-4">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Merchant
                </Button>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <StatsCard
                title="Total Merchants"
                value={platformStats?.totalMerchants || 0}
                icon={Store}
                color="purple"
                loading={statsLoading}
                subtitle="+12% this month"
              />
              <StatsCard
                title="Active Users"
                value={platformStats?.totalUsers || 0}
                icon={Users}
                color="blue"
                loading={statsLoading}
                subtitle="+8% this month"
              />
              <StatsCard
                title="Total Bookings"
                value={platformStats?.totalBookings || 0}
                icon={BarChart3}
                color="green"
                loading={statsLoading}
                subtitle="+15% this month"
              />
              <StatsCard
                title="Platform Revenue"
                value={`¥${(platformStats?.totalRevenue || 0).toLocaleString()}`}
                icon={TrendingUp}
                color="yellow"
                loading={statsLoading}
                subtitle="+22% this month"
              />
            </div>

            {/* Merchant Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Recent Merchant Applications */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Pending Merchant Applications</CardTitle>
                  <Button variant="outline">View All</Button>
                </CardHeader>
                <CardContent>
                  {pendingHotels.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No pending applications</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingHotels.slice(0, 3).map((hotel: any) => (
                        <div key={hotel.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                              <Hotel className="text-gray-600 h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{hotel.name}</p>
                              <p className="text-sm text-gray-600">
                                Applied {new Date(hotel.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => updateHotelStatusMutation.mutate({ 
                                hotelId: hotel.id, 
                                status: 'approved' 
                              })}
                              disabled={updateHotelStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => updateHotelStatusMutation.mutate({ 
                                hotelId: hotel.id, 
                                status: 'rejected' 
                              })}
                              disabled={updateHotelStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">API Services</span>
                      </div>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Database</span>
                      </div>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Payment Gateway</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-500 text-white">Degraded</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Notifications</span>
                      </div>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="text-primary h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Booking Trends</h3>
                    <p className="text-sm text-gray-600">Track reservation patterns and seasonal trends</p>
                  </div>
                  
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="text-green-600 h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Revenue Distribution</h3>
                    <p className="text-sm text-gray-600">Analyze income sources and merchant performance</p>
                  </div>
                  
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="text-purple-600 h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Growth Metrics</h3>
                    <p className="text-sm text-gray-600">Monitor platform expansion and user acquisition</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Hotels Table */}
            {approvedHotels.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Approved Hotels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Hotel</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-600">City</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Approved Date</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedHotels.slice(0, 5).map((hotel: any) => (
                          <tr key={hotel.id} className="border-b border-gray-100">
                            <td className="py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <Hotel className="text-gray-600 h-4 w-4" />
                                </div>
                                <span className="font-medium">{hotel.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-gray-600">{hotel.city}</td>
                            <td className="py-3">
                              <Badge className="bg-green-500">Approved</Badge>
                            </td>
                            <td className="py-3 text-gray-600">
                              {new Date(hotel.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateHotelStatusMutation.mutate({ 
                                  hotelId: hotel.id, 
                                  status: 'suspended' 
                                })}
                              >
                                Suspend
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
