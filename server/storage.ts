import {
  users,
  hotels,
  rooms,
  roomTypes,
  bookings,
  payments,
  reviews,
  type User,
  type UpsertUser,
  type Hotel,
  type InsertHotel,
  type Room,
  type InsertRoom,
  type RoomType,
  type InsertRoomType,
  type Booking,
  type InsertBooking,
  type Payment,
  type InsertPayment,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, or, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Hotel operations
  getHotels(filters?: { city?: string; status?: string }): Promise<Hotel[]>;
  getHotelById(id: string): Promise<Hotel | undefined>;
  getHotelsByMerchant(merchantId: string): Promise<Hotel[]>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: string, updates: Partial<InsertHotel>): Promise<Hotel>;

  // Room operations
  getRoomsByHotel(hotelId: string): Promise<Room[]>;
  getRoomById(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, updates: Partial<InsertRoom>): Promise<Room>;
  getAvailableRooms(hotelId: string, checkIn: Date, checkOut: Date): Promise<Room[]>;

  // Room type operations
  getRoomTypesByHotel(hotelId: string): Promise<RoomType[]>;
  createRoomType(roomType: InsertRoomType): Promise<RoomType>;
  updateRoomType(id: string, updates: Partial<InsertRoomType>): Promise<RoomType>;

  // Booking operations
  getBookings(filters?: { userId?: string; hotelId?: string; status?: string }): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByHotel(hotelId: string): Promise<Booking[]>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment>;
  getPaymentsByBooking(bookingId: string): Promise<Payment[]>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByHotel(hotelId: string): Promise<Review[]>;

  // Analytics
  getHotelStats(hotelId: string): Promise<{
    totalRooms: number;
    occupiedRooms: number;
    todayCheckIns: number;
    todayRevenue: number;
  }>;

  getPlatformStats(): Promise<{
    totalMerchants: number;
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Hotel operations
  async getHotels(filters?: { city?: string; status?: string }): Promise<Hotel[]> {
    let query = db.select().from(hotels);
    
    if (filters?.city) {
      query = query.where(eq(hotels.city, filters.city));
    }
    
    if (filters?.status) {
      query = query.where(eq(hotels.status, filters.status as any));
    }

    return await query.orderBy(desc(hotels.createdAt));
  }

  async getHotelById(id: string): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
    return hotel;
  }

  async getHotelsByMerchant(merchantId: string): Promise<Hotel[]> {
    return await db.select().from(hotels).where(eq(hotels.merchantId, merchantId));
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const [newHotel] = await db.insert(hotels).values(hotel).returning();
    return newHotel;
  }

  async updateHotel(id: string, updates: Partial<InsertHotel>): Promise<Hotel> {
    const [hotel] = await db
      .update(hotels)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(hotels.id, id))
      .returning();
    return hotel;
  }

  // Room operations
  async getRoomsByHotel(hotelId: string): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.hotelId, hotelId));
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async updateRoom(id: string, updates: Partial<InsertRoom>): Promise<Room> {
    const [room] = await db
      .update(rooms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }

  async getAvailableRooms(hotelId: string, checkIn: Date, checkOut: Date): Promise<Room[]> {
    const conflictingBookings = db
      .select({ roomId: bookings.roomId })
      .from(bookings)
      .where(
        and(
          eq(bookings.hotelId, hotelId),
          or(
            and(gte(bookings.checkInDate, checkIn), lte(bookings.checkInDate, checkOut)),
            and(gte(bookings.checkOutDate, checkIn), lte(bookings.checkOutDate, checkOut)),
            and(lte(bookings.checkInDate, checkIn), gte(bookings.checkOutDate, checkOut))
          ),
          eq(bookings.status, 'confirmed')
        )
      );

    return await db
      .select()
      .from(rooms)
      .where(
        and(
          eq(rooms.hotelId, hotelId),
          eq(rooms.status, 'available'),
          eq(rooms.isActive, true),
          sql`${rooms.id} NOT IN ${conflictingBookings}`
        )
      );
  }

  // Room type operations
  async getRoomTypesByHotel(hotelId: string): Promise<RoomType[]> {
    return await db.select().from(roomTypes).where(eq(roomTypes.hotelId, hotelId));
  }

  async createRoomType(roomType: InsertRoomType): Promise<RoomType> {
    const [newRoomType] = await db.insert(roomTypes).values(roomType).returning();
    return newRoomType;
  }

  async updateRoomType(id: string, updates: Partial<InsertRoomType>): Promise<RoomType> {
    const [roomType] = await db
      .update(roomTypes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(roomTypes.id, id))
      .returning();
    return roomType;
  }

  // Booking operations
  async getBookings(filters?: { userId?: string; hotelId?: string; status?: string }): Promise<Booking[]> {
    let query = db.select().from(bookings);
    
    const conditions = [];
    if (filters?.userId) conditions.push(eq(bookings.userId, filters.userId));
    if (filters?.hotelId) conditions.push(eq(bookings.hotelId, filters.hotelId));
    if (filters?.status) conditions.push(eq(bookings.status, filters.status as any));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByHotel(hotelId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.hotelId, hotelId));
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByHotel(hotelId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.hotelId, hotelId));
  }

  // Analytics
  async getHotelStats(hotelId: string): Promise<{
    totalRooms: number;
    occupiedRooms: number;
    todayCheckIns: number;
    todayRevenue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalRoomsResult] = await db
      .select({ count: count() })
      .from(rooms)
      .where(and(eq(rooms.hotelId, hotelId), eq(rooms.isActive, true)));

    const [occupiedRoomsResult] = await db
      .select({ count: count() })
      .from(rooms)
      .where(and(eq(rooms.hotelId, hotelId), eq(rooms.status, 'occupied')));

    const [todayCheckInsResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.hotelId, hotelId),
          gte(bookings.checkInDate, today),
          lte(bookings.checkInDate, tomorrow)
        )
      );

    const [todayRevenueResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.hotelId, hotelId),
          gte(bookings.createdAt, today),
          lte(bookings.createdAt, tomorrow),
          eq(bookings.status, 'confirmed')
        )
      );

    return {
      totalRooms: totalRoomsResult?.count || 0,
      occupiedRooms: occupiedRoomsResult?.count || 0,
      todayCheckIns: todayCheckInsResult?.count || 0,
      todayRevenue: Number(todayRevenueResult?.total) || 0,
    };
  }

  async getPlatformStats(): Promise<{
    totalMerchants: number;
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
  }> {
    const [merchantsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'merchant'));

    const [usersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'customer'));

    const [bookingsResult] = await db
      .select({ count: count() })
      .from(bookings);

    const [revenueResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)` })
      .from(bookings)
      .where(eq(bookings.status, 'confirmed'));

    return {
      totalMerchants: merchantsResult?.count || 0,
      totalUsers: usersResult?.count || 0,
      totalBookings: bookingsResult?.count || 0,
      totalRevenue: Number(revenueResult?.total) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
