import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertHotelSchema, insertRoomSchema, insertRoomTypeSchema, insertBookingSchema, insertPaymentSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Hotel routes
  app.get('/api/hotels', async (req, res) => {
    try {
      const { city, status } = req.query;
      const hotels = await storage.getHotels({ 
        city: city as string, 
        status: status as string 
      });
      res.json(hotels);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  app.get('/api/hotels/:id', async (req, res) => {
    try {
      const hotel = await storage.getHotelById(req.params.id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.error("Error fetching hotel:", error);
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });

  app.post('/api/hotels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const hotelData = insertHotelSchema.parse({ 
        ...req.body, 
        merchantId: userId 
      });
      const hotel = await storage.createHotel(hotelData);
      res.status(201).json(hotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create hotel" });
    }
  });

  app.get('/api/merchant/hotels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotels = await storage.getHotelsByMerchant(userId);
      res.json(hotels);
    } catch (error) {
      console.error("Error fetching merchant hotels:", error);
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  // Room routes
  app.get('/api/hotels/:hotelId/rooms', async (req, res) => {
    try {
      const rooms = await storage.getRoomsByHotel(req.params.hotelId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.get('/api/hotels/:hotelId/available-rooms', async (req, res) => {
    try {
      const { checkIn, checkOut } = req.query;
      if (!checkIn || !checkOut) {
        return res.status(400).json({ message: "Check-in and check-out dates are required" });
      }

      const rooms = await storage.getAvailableRooms(
        req.params.hotelId,
        new Date(checkIn as string),
        new Date(checkOut as string)
      );
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      res.status(500).json({ message: "Failed to fetch available rooms" });
    }
  });

  app.post('/api/hotels/:hotelId/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const roomData = insertRoomSchema.parse({
        ...req.body,
        hotelId: req.params.hotelId
      });
      const room = await storage.createRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  app.put('/api/rooms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const room = await storage.updateRoom(req.params.id, req.body);
      res.json(room);
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ message: "Failed to update room" });
    }
  });

  // Room type routes
  app.get('/api/hotels/:hotelId/room-types', async (req, res) => {
    try {
      const roomTypes = await storage.getRoomTypesByHotel(req.params.hotelId);
      res.json(roomTypes);
    } catch (error) {
      console.error("Error fetching room types:", error);
      res.status(500).json({ message: "Failed to fetch room types" });
    }
  });

  app.post('/api/hotels/:hotelId/room-types', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const roomTypeData = insertRoomTypeSchema.parse({
        ...req.body,
        hotelId: req.params.hotelId
      });
      const roomType = await storage.createRoomType(roomTypeData);
      res.status(201).json(roomType);
    } catch (error) {
      console.error("Error creating room type:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create room type" });
    }
  });

  // Booking routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let bookings;
      if (user.role === 'customer') {
        bookings = await storage.getBookingsByUser(userId);
      } else if (user.role === 'merchant') {
        const { hotelId } = req.query;
        if (hotelId) {
          bookings = await storage.getBookingsByHotel(hotelId as string);
        } else {
          const hotels = await storage.getHotelsByMerchant(userId);
          const allBookings = await Promise.all(
            hotels.map(hotel => storage.getBookingsByHotel(hotel.id))
          );
          bookings = allBookings.flat();
        }
      } else {
        bookings = await storage.getBookings();
      }

      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId
      });
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, req.body);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Payment routes
  app.post('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      
      // Simulate payment processing
      setTimeout(async () => {
        await storage.updatePayment(payment.id, {
          status: 'completed',
          paidAt: new Date()
        });
      }, 2000);

      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId
      });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/hotels/:hotelId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviewsByHotel(req.params.hotelId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Analytics routes
  app.get('/api/hotels/:hotelId/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const stats = await storage.getHotelStats(req.params.hotelId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching hotel stats:", error);
      res.status(500).json({ message: "Failed to fetch hotel stats" });
    }
  });

  app.get('/api/platform/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  // Admin routes
  app.put('/api/admin/hotels/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      const hotel = await storage.updateHotel(req.params.id, { status });
      res.json(hotel);
    } catch (error) {
      console.error("Error updating hotel status:", error);
      res.status(500).json({ message: "Failed to update hotel status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
