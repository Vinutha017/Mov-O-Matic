# MOV O MATIC - AI-Powered Travel Planner

## Overview

MOV O MATIC is a comprehensive AI-driven travel planning web application that creates smart, customized itineraries for travelers. The application uses artificial intelligence to generate personalized travel recommendations, manage budgets, and provide real-time updates for optimal trip planning.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with Shadcn/ui component library
- **Build Tool**: Vite for development and bundling
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **AI Integration**: Google Gemini API for intelligent trip generation
- **Session Management**: PostgreSQL-based sessions
- **API Design**: RESTful endpoints with JSON responses

### Key Design Decisions
1. **Monorepo Structure**: Shared schema and types between client/server for type safety
2. **AI-First Approach**: Google Gemini API integration for intelligent trip planning
3. **Component-Driven UI**: Shadcn/ui for consistent, accessible components
4. **Type Safety**: End-to-end TypeScript for better developer experience

## Key Components

### Frontend Components
- **Trip Wizard Form**: Multi-step form for collecting travel preferences
- **Itinerary Builder**: Drag-and-drop interface for customizing trip plans
- **Budget Tracker**: Real-time expense tracking with visual charts
- **Hotel Recommendations**: AI-powered accommodation suggestions
- **Interactive Demo**: Showcase of app features

### Backend Services
- **AI Travel Planner**: Google Gemini API integration for generating personalized trip itineraries
- **Storage Layer**: Abstracted database operations with in-memory fallback
- **Route Handlers**: Express endpoints for trip CRUD operations
- **Vite Integration**: Development server with HMR support

### Database Schema
- **Users**: Authentication and profile management
- **Trips**: Core trip information and metadata
- **Itinerary Days**: Daily schedule structure
- **Activities**: Individual trip activities and events
- **Hotels/Destinations**: Travel recommendations
- **Expenses**: Budget tracking and financial data
- **Weather Alerts**: Real-time travel notifications

## Data Flow

1. **Trip Creation**: User describes trip → AI generates recommendations → User customizes itinerary
2. **Real-time Updates**: Weather/traffic data → Automatic itinerary adjustments → User notifications
3. **Budget Management**: Expense tracking → Visual analytics → Budget alerts
4. **Collaboration**: Trip sharing → Multi-user editing → PDF export

### API Endpoints
- `POST /api/trips/generate` - AI trip generation
- `GET/POST /api/trips` - Trip CRUD operations
- `POST /api/itinerary-days` - Day-by-day planning
- `POST /api/activities` - Activity management
- `GET/POST /api/expenses` - Budget tracking

## External Dependencies

### Core Dependencies
- **Google Gemini API**: AI-powered trip generation and recommendations
- **Neon Database**: PostgreSQL hosting (via @neondatabase/serverless)
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management
- **Drizzle ORM**: Type-safe database operations

### Development Tools
- **Vite**: Build tooling and development server
- **ESBuild**: Production bundling
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first styling

### Optional Integrations
- **Weather APIs**: Real-time weather updates
- **Maps APIs**: Location and routing services
- **Payment Processing**: Premium features (future)

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Module Replacement**: Real-time code updates
- **Environment Variables**: DATABASE_URL, GEMINI_API_KEY

### Production Build
- **Frontend**: Vite builds to `dist/public`
- **Backend**: ESBuild bundles server to `dist/index.js`
- **Static Assets**: Served via Express in production
- **Database**: PostgreSQL with connection pooling

### Database Migrations
- **Drizzle Kit**: Schema migrations and management
- **Push Command**: `npm run db:push` for schema updates
- **Migration Files**: Stored in `./migrations` directory

### Architecture Benefits
1. **Type Safety**: Shared schema prevents client/server mismatches
2. **AI Integration**: Seamless Google Gemini API integration for intelligent planning
3. **Scalable UI**: Component library allows rapid feature development
4. **Real-time Features**: Built-in support for live updates and notifications
5. **Database Flexibility**: Drizzle supports multiple database providers

The application is designed for rapid development and deployment while maintaining type safety and providing a rich user experience for travel planning.