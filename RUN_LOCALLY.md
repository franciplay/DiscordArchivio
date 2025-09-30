# Running Discord Bot Dashboard Locally

This guide will help you set up and run the Discord Bot Dashboard application on your local computer.

## Prerequisites

### Required Software & Tools

#### 1. Node.js
- **Version**: 18 or higher
- Download from [nodejs.org](https://nodejs.org/)
- Includes npm package manager

#### 2. Package Manager
- npm (comes with Node.js)
- Alternatively: yarn or pnpm

#### 3. PostgreSQL Database (Optional)
- The app currently uses **in-memory storage** by default
- For persistent data storage, you'll need:
  - Local PostgreSQL installation, OR
  - Cloud PostgreSQL service (e.g., Neon, Supabase, Railway)
  - A `DATABASE_URL` connection string

## Environment Configuration

Create a `.env` file in the root directory of the project with the following variables:

```env
# Server Configuration
PORT=5000                    # Optional - defaults to 5000 if not set
NODE_ENV=development        # Set to 'development' or 'production'

# Database (REQUIRED - even for in-memory storage)
# Use a dummy value if not connecting to a real database:
DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
# Or use a real PostgreSQL connection string:
# DATABASE_URL=postgresql://username:password@host:port/database
```

### Important Notes:
- **DATABASE_URL**: Required by Drizzle configuration, even if using in-memory storage. You can use a dummy connection string (as shown above) if not connecting to a real database.
- **Discord Bot Token**: Currently **hardcoded** in `server/discord-bot.ts` and `server/index.ts`. To use your own bot:
  1. Get your token from the [Discord Developer Portal](https://discord.com/developers/applications)
  2. Replace the hardcoded token in the source files, OR
  3. Modify the code to read from an environment variable
- **Storage**: The app uses in-memory storage by default. Database connection is only needed if you modify the code to use PostgreSQL with Drizzle ORM

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`, including:
- React, TypeScript, Vite (frontend)
- Express.js (backend)
- Discord.js (bot integration)
- Drizzle ORM (database)
- Shadcn/ui, Radix UI, Tailwind CSS (UI components)

### 2. Database Setup (Only if using PostgreSQL)

**Skip this step if using in-memory storage** (which is the default).

If you're connecting to a real PostgreSQL database, push the database schema:

```bash
npm run db:push
```

This uses Drizzle Kit to synchronize your database schema. Note: This requires a valid PostgreSQL `DATABASE_URL` in your `.env` file.

### 3. Start Development Server

```bash
npm run dev
```

This command starts the Express.js backend server which serves both the API and frontend:
- Runs the backend via `tsx server/index.ts`
- In development mode, Vite runs as middleware within Express
- Both API and frontend are served on the same port (5000)
- Includes hot module replacement (HMR) for instant frontend updates

The application will be accessible at: **http://localhost:5000**

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Express with Vite middleware for HMR) |
| `npm run build` | Build for production (Vite frontend + ESBuild backend bundling) |
| `npm start` | Run the production build |
| `npm run check` | Run TypeScript type checking without building |
| `npm run db:push` | Push database schema changes using Drizzle Kit (requires valid DATABASE_URL) |

## Production Build

To create and run a production build:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

The build process:
1. Compiles the React frontend with Vite
2. Bundles the Express backend with ESBuild
3. Outputs to the `dist/` directory

## Application Architecture Overview

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript with ES modules
- **Database**: In-memory storage (or optional PostgreSQL with Drizzle ORM)
- **Discord Bot**: Discord.js v14 for slash commands
- **UI Framework**: Shadcn/ui components + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change the `PORT` environment variable in your `.env` file:
```env
PORT=3000
```

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running (if using local database)
- Check that the database exists and is accessible

### Discord Bot Not Connecting
- Verify your `DISCORD_BOT_TOKEN` is valid
- Check that the bot has the necessary intents enabled in Discord Developer Portal
- Ensure the bot is invited to your Discord server with proper permissions

### TypeScript Errors
Run type checking to see detailed errors:
```bash
npm run check
```

## Next Steps

Once the application is running:
1. Access the dashboard at `http://localhost:5000`
2. View stored reports about people
3. Simulate Discord commands through the web interface
4. Monitor bot status and activity

For more information about the application architecture and features, see `replit.md`.
