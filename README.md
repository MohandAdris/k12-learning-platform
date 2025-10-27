# K-12 Learning Platform

A comprehensive, multilingual learning management system designed for K-12 education. Built with modern web technologies and supporting English, Arabic, and Hebrew with full RTL support.

## Features

### For Teachers
- **Course Management**: Create, edit, and organize courses with rich descriptions and cover images
- **Unit Organization**: Structure courses into logical units with ordering and duration tracking
- **Lecture Management**: Add video lectures with multilingual captions, summaries, and attachments
- **Analytics Dashboard**: Track student engagement, completion rates, and course performance
- **Student Management**: View enrolled students, track progress, and manage enrollments
- **Game Integration**: Add educational games to units for interactive learning

### For Students
- **Course Catalog**: Browse and enroll in available courses with search and filtering
- **Progress Tracking**: Monitor your learning journey with visual progress indicators
- **Video Learning**: Watch lectures with captions in multiple languages
- **Interactive Games**: Play educational games integrated into course units
- **Profile Management**: Track enrollments, certificates, and learning statistics

### For Administrators
- **School Management**: Create and manage schools and organizations
- **User Management**: Oversee teachers and students across the platform
- **System Analytics**: View platform-wide statistics and engagement metrics

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for efficient server state management
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** for accessible, customizable UI components
- **i18next** for internationalization (English, Arabic, Hebrew)
- **Lucide React** for consistent iconography

### Backend
- **Node.js** with Express for the server runtime
- **tRPC** for end-to-end type-safe APIs
- **PostgreSQL** for relational data storage
- **Drizzle ORM** for type-safe database queries
- **JWT** for authentication and authorization
- **S3-compatible storage** for file uploads

### Development Tools
- **TypeScript** for type safety across the stack
- **Vite** for fast development and optimized builds
- **pnpm** for efficient package management
- **tsx** for TypeScript execution

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- S3-compatible storage (optional, for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd k12-learning-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the project root with the following variables:
   
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/k12_learning
   
   # Authentication
   JWT_SECRET=your-secure-jwt-secret-here
   OAUTH_SERVER_URL=https://api.manus.im
   
   # Application
   VITE_APP_TITLE=K-12 Learning Platform
   VITE_APP_LOGO=/logo.png
   VITE_APP_ID=your-app-id
   
   # Storage (optional)
   S3_ENDPOINT=your-s3-endpoint
   S3_ACCESS_KEY=your-access-key
   S3_SECRET_KEY=your-secret-key
   S3_BUCKET=your-bucket-name
   S3_REGION=your-region
   ```

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   
   Open your browser to `http://localhost:3000`

## Project Structure

```
k12-learning-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   ├── teacher/   # Teacher-specific pages
│   │   │   └── student/   # Student-specific pages
│   │   ├── lib/           # Utilities and configurations
│   │   │   ├── i18n.ts   # Internationalization setup
│   │   │   └── trpc.ts   # tRPC client configuration
│   │   └── App.tsx        # Main application component
│   └── index.html         # HTML entry point
├── server/                # Backend Node.js application
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database queries and operations
│   ├── schema.ts          # Database schema definitions
│   └── _core/             # Core server setup
├── shared/                # Shared types and utilities
├── public/                # Static assets
└── package.json           # Project dependencies
```

## Database Schema

The platform uses the following main entities:

- **users**: User accounts (teachers, students, admins)
- **schools**: Educational institutions
- **courses**: Course definitions with metadata
- **units**: Course sections/modules
- **lectures**: Individual lessons with video content
- **games**: Educational games linked to units
- **enrollments**: Student course registrations
- **progress**: Student learning progress tracking
- **gameSessions**: Game play history and scores

## API Documentation

The platform uses tRPC for type-safe API communication. Main routers include:

### Authentication
- `auth.me` - Get current user information
- `auth.login` - User authentication

### Users
- `users.list` - List users (teachers only)
- `users.updateProfile` - Update user profile

### Courses
- `courses.list` - List courses with filtering
- `courses.get` - Get course details
- `courses.create` - Create new course (teachers only)
- `courses.update` - Update course (teachers only)
- `courses.delete` - Delete course (teachers only)

### Units
- `units.list` - List units in a course
- `units.get` - Get unit with lectures and games
- `units.create` - Create unit (teachers only)
- `units.update` - Update unit (teachers only)
- `units.delete` - Delete unit (teachers only)

### Lectures
- `lectures.list` - List lectures in a unit
- `lectures.get` - Get lecture details
- `lectures.create` - Create lecture (teachers only)
- `lectures.update` - Update lecture (teachers only)
- `lectures.delete` - Delete lecture (teachers only)

### Games
- `games.list` - List games in a unit
- `games.create` - Create game (teachers only)
- `games.update` - Update game (teachers only)
- `games.delete` - Delete game (teachers only)

### Enrollments
- `enrollments.enroll` - Enroll in a course
- `enrollments.list` - List user enrollments

### Progress
- `progress.update` - Update learning progress
- `progress.get` - Get progress for a lecture

### Analytics
- `analytics.overview` - Get analytics overview (teachers only)

### Schools
- `schools.list` - List schools
- `schools.create` - Create school (admins only)
- `schools.update` - Update school (admins only)

## Internationalization

The platform supports three languages with full UI translation:

- **English (en)** - Default language, LTR layout
- **Arabic (ar)** - Full RTL support with Arabic translations
- **Hebrew (he)** - Full RTL support with Hebrew translations

Users can switch languages using the language selector in the header. The platform automatically adjusts layout direction and text alignment based on the selected language.

## User Roles

### STUDENT
- Browse and enroll in public courses
- Watch lectures and play games
- Track personal progress
- View certificates

### TEACHER
- All student capabilities
- Create and manage courses
- Manage units and lectures
- View analytics and student progress
- Manage enrolled students

### ADMIN
- All teacher capabilities
- Manage schools and organizations
- View system-wide analytics
- Manage users across the platform

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open Drizzle Studio for database management

### Code Style

The project uses TypeScript with strict mode enabled. Follow these conventions:

- Use functional components with hooks
- Prefer named exports over default exports
- Use TypeScript types from tRPC for API calls
- Follow the existing component structure
- Use Tailwind CSS utilities for styling
- Implement proper error handling with try-catch
- Add loading states for async operations

### Adding New Features

1. Define database schema in `server/schema.ts`
2. Create database operations in `server/db.ts`
3. Add tRPC procedures in `server/routers.ts`
4. Create React components in `client/src/components/` or `client/src/pages/`
5. Add translations to `client/src/lib/i18n.ts`
6. Update routes in `client/src/App.tsx`

## Deployment

### Production Build

```bash
pnpm build
```

This creates optimized production builds in:
- `dist/client` - Frontend static files
- `dist/server` - Backend server code

### Environment Variables

Ensure all required environment variables are set in your production environment. See the Installation section for the complete list.

### Database Migrations

Run migrations before deploying:

```bash
pnpm db:push
```

### Hosting Recommendations

- **Frontend**: Deploy to Vercel, Netlify, or any static hosting
- **Backend**: Deploy to Railway, Render, or any Node.js hosting
- **Database**: Use managed PostgreSQL (Supabase, Railway, Neon)
- **Storage**: Use S3, Cloudflare R2, or similar object storage

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in the `/docs` folder

## Acknowledgments

- Built with [Manus](https://manus.im) platform
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Inspired by modern LMS platforms

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: Production Ready

