# Discord Bot Dashboard

## Overview

This is a Discord bot dashboard application that provides a web interface for managing a Discord bot designed to store and retrieve information about people through slash commands. The system consists of a React frontend with a modern Discord-inspired design, an Express.js backend API, and a Discord bot that handles slash commands like `/reporti` (to add facts about people) and `/info` (to retrieve stored information).

The application allows users to view stored reports about people, simulate Discord commands through a web interface, monitor bot status, and manage the data collected by the bot in Discord servers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom Discord-inspired dark theme
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Custom color palette and typography inspired by Discord's design language

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with endpoints for managing people and reports
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Discord Integration**: Discord.js library for bot functionality with slash command handling

### Data Storage Solutions
- **Current**: In-memory storage using Map structures for development/testing
- **Planned**: PostgreSQL database with Drizzle ORM integration
- **Schema**: Two main entities - People and Reports with a one-to-many relationship
- **Database Driver**: Neon serverless PostgreSQL driver configured

### Authentication and Authorization
- **Current**: No authentication implemented (development phase)
- **Session Management**: Basic session configuration using connect-pg-simple for future implementation

### External Dependencies
- **Discord.js**: Official Discord API library for bot functionality
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect
- **Neon Database**: Serverless PostgreSQL database service
- **Radix UI**: Accessible component primitives for React
- **TanStack Query**: Data fetching and caching library
- **Tailwind CSS**: Utility-first CSS framework
- **date-fns**: Date manipulation library for formatting timestamps

## External Dependencies

### Third-party Services
- **Discord API**: For bot authentication and slash command interactions
- **Neon Database**: Serverless PostgreSQL hosting for production data storage

### APIs and Integrations
- **Discord Bot API**: Handles `/reporti` and `/info` slash commands
- **REST API**: Internal API for frontend-backend communication with endpoints:
  - `GET /api/people` - Retrieve all people with their reports
  - `POST /api/reports` - Create new reports and people

### Development Tools
- **Vite**: Frontend build tool and development server
- **ESBuild**: Backend bundling for production builds
- **TypeScript**: Type safety across the entire stack
- **Drizzle Kit**: Database schema management and migrations

The architecture is designed to be scalable and maintainable, with clear separation between the Discord bot functionality, web dashboard, and data persistence layers. The system uses modern web development practices with type safety throughout and follows Discord's design principles for user experience.