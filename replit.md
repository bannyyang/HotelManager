# Hotel Management System

## Overview

This is a comprehensive hotel management platform built with React, Express.js, and PostgreSQL. The system supports three distinct user roles: customers who can browse and book hotels, merchants who manage their hotel properties, and platform administrators who oversee the entire ecosystem.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication
- **UI Framework**: Shadcn/ui components with Radix UI primitives and Tailwind CSS

## Key Components

### Frontend Architecture
- **Component Library**: Uses Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **API Server**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with OpenID Connect for Replit Auth
- **Session Management**: Express sessions stored in PostgreSQL
- **Error Handling**: Centralized error handling middleware

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Users**: Customer, merchant, and admin accounts
- **Hotels**: Property information managed by merchants
- **Rooms**: Individual room units with status tracking
- **Room Types**: Categorization of rooms with pricing
- **Bookings**: Customer reservations with status management
- **Payments**: Transaction records linked to bookings
- **Reviews**: Customer feedback system

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, creating sessions stored in PostgreSQL
2. **Role-Based Access**: Different interfaces served based on user role (customer/merchant/admin)
3. **Hotel Management**: Merchants create and manage hotel properties, rooms, and pricing
4. **Booking Process**: Customers search hotels, make bookings, and process payments
5. **Real-time Updates**: Room status changes propagate through the system

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with TypeScript support
- **Express.js**: Backend web framework
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL provider

### Authentication & Security
- **Replit Auth**: OAuth integration using OpenID Connect
- **Passport.js**: Authentication middleware
- **Express Session**: Session management with PostgreSQL storage

### UI & Styling
- **Shadcn/ui**: Component library built on Radix UI
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build system with HMR
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Development Mode
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations managed by Drizzle Kit

### Production Mode
- Frontend built to static assets using Vite
- Backend bundled using ESBuild for Node.js
- Single server serves both API routes and static files
- PostgreSQL database provisioned through environment variables

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPLIT_DOMAINS**: Allowed domains for CORS
- **ISSUER_URL**: OpenID Connect issuer endpoint

The monorepo structure allows for efficient development with shared TypeScript types between client and server, while the build process creates optimized bundles for production deployment.