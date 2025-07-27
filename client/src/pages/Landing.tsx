import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Users, Cog } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hotel className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">HotelSystem</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-blue-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Complete Hotel Management Platform
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Streamline your hotel operations with our comprehensive management system. 
            From guest bookings to merchant dashboards and platform administration.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Customer Platform */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Customer App</CardTitle>
                <CardDescription>
                  Browse and book hotels with our user-friendly mobile interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Search hotels by location and dates</li>
                  <li>• Real-time availability checking</li>
                  <li>• Secure booking and payment</li>
                  <li>• Booking history and management</li>
                </ul>
              </CardContent>
            </Card>

            {/* Merchant Platform */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hotel className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Merchant Dashboard</CardTitle>
                <CardDescription>
                  Manage your hotel operations with comprehensive tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Room status and inventory management</li>
                  <li>• Booking and guest management</li>
                  <li>• Revenue analytics and reporting</li>
                  <li>• Real-time dashboard overview</li>
                </ul>
              </CardContent>
            </Card>

            {/* Admin Platform */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cog className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Platform Admin</CardTitle>
                <CardDescription>
                  Comprehensive platform management and oversight
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Merchant application management</li>
                  <li>• Platform-wide analytics</li>
                  <li>• System monitoring and health</li>
                  <li>• User and merchant oversight</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-blue-700 text-lg px-8 py-4"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for the modern hospitality industry with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Platform</h3>
              <p className="text-gray-600 text-sm">Unified solution for customers, merchants, and administrators</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile-First</h3>
              <p className="text-gray-600 text-sm">Responsive design optimized for all devices</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time</h3>
              <p className="text-gray-600 text-sm">Live updates for bookings, availability, and analytics</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600 text-sm">Enterprise-grade security and data protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Hotel className="h-8 w-8" />
            <span className="text-2xl font-bold">HotelSystem</span>
          </div>
          <p className="text-gray-400 mb-6">
            Revolutionizing hotel management with modern technology
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/api/login'}
            className="border-white text-white hover:bg-white hover:text-gray-900"
          >
            Start Your Journey
          </Button>
        </div>
      </footer>
    </div>
  );
}
