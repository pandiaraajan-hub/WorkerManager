# replit.md

## Overview

WorkerPro is a comprehensive employee management system designed to track worker information, certifications, and training records. The application provides Excel import/export capabilities for bulk data operations and features a modern web interface for managing employee data, courses, and certification tracking with expiration monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with Tailwind CSS for styling and shadcn/ui component system
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with separate route handlers
- **File Processing**: Multer for file uploads and XLSX library for Excel file processing
- **Storage Layer**: Abstracted storage interface with in-memory implementation (IStorage pattern)

### Data Storage
- **Database**: PostgreSQL configured through Drizzle ORM
- **Connection**: Neon Database serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Models**: Three main entities - Workers, Courses, and Certifications with relational mapping

### Component Architecture
- **Design System**: Consistent component library with shadcn/ui
- **Layout**: Sidebar navigation with main content area
- **Modals**: Reusable modal components for detailed views and forms
- **Data Tables**: Custom table components with search and filtering capabilities

### Key Features
- **Employee Management**: Full CRUD operations for worker profiles
- **Certification Tracking**: Course enrollment and certification status monitoring
- **Excel Integration**: Import/export functionality for bulk data operations
- **Search & Filtering**: Real-time search across worker data
- **Expiration Alerts**: Automatic tracking of certification expiration dates
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## External Dependencies

### Database & ORM
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and schema management
- **Drizzle Kit**: Database migration and introspection tools

### UI & Styling
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Inter Font**: Google Fonts integration for typography

### Data Processing
- **XLSX**: Excel file reading and writing capabilities
- **Date-fns**: Date manipulation and formatting utilities
- **Zod**: Runtime type validation and schema validation

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and improved developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment integration and deployment