# Design Document

## Overview

The events registration and management platform is a full-stack Next.js 15 application using the App Router architecture. The system provides a bilingual (Ukrainian/English) interface for event organizers to create and manage events, and for attendees to discover and register for events. The application leverages modern React patterns, TypeScript for type safety, and integrates with NextAuth.js for authentication.

## Architecture

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Animations**: framer-motion
- **Authentication**: NextAuth.js (credentials + Google OAuth)
- **HTTP Client**: axios
- **State Management**: React hooks (useState, useReducer, useQuery)
- **Form Management**: react-hook-form
- **Validation**: zod
- **Internationalization**: next-intl
- **Deployment**: Vercel

### Folder Structure

```
/
├── app/
│   ├── [locale]/                    # Internationalization wrapper
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/             # Protected route group
│   │   │   ├── events/
│   │   │   │   ├── page.tsx         # Events list
│   │   │   │   ├── create/
│   │   │   │   ├── [id]/            # Event details
│   │   │   │   └── [id]/edit/
│   │   │   ├── my-events/           # User's created events
│   │   │   ├── my-registrations/    # User's registrations
│   │   │   └── layout.tsx           # Dashboard layout
│   │   ├── layout.tsx               # Root locale layout
│   │   └── page.tsx                 # Home page
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts         # NextAuth configuration
│   │   ├── events/
│   │   │   ├── route.ts             # GET, POST events
│   │   │   └── [id]/
│   │   │       └── route.ts         # GET, PUT, DELETE event
│   │   └── registrations/
│   │       ├── route.ts             # GET, POST registrations
│   │       └── [id]/
│   │           └── route.ts         # DELETE registration
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthProvider.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventList.tsx
│   │   ├── EventForm.tsx
│   │   ├── EventDetails.tsx
│   │   └── EventFilters.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── LanguageSwitcher.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
├── lib/
│   ├── auth.ts                      # NextAuth configuration
│   ├── axios.ts                     # Axios instance
│   ├── db.ts                        # Database client
│   ├── utils.ts                     # Utility functions
│   └── validations/
│       ├── auth.ts                  # Auth schemas
│       ├── event.ts                 # Event schemas
│       └── registration.ts          # Registration schemas
├── hooks/
│   ├── useEvents.ts
│   ├── useRegistrations.ts
│   └── useAuth.ts
├── types/
│   ├── auth.ts
│   ├── event.ts
│   └── registration.ts
├── messages/
│   ├── en.json                      # English translations
│   └── uk.json                      # Ukrainian translations
├── middleware.ts                    # next-intl + auth middleware
├── i18n.ts                          # i18n configuration
└── next.config.js
```

## Components and Interfaces

### Authentication System

**NextAuth Configuration** (`lib/auth.ts`):

- Credentials provider for email/password authentication
- Google OAuth provider
- JWT strategy for session management
- Custom callbacks for session and JWT handling

**Auth Components**:

- `LoginForm`: Email/password login with Google OAuth button
- `RegisterForm`: User registration with validation
- `AuthProvider`: Client-side session provider wrapper

### Event Management

**Event Data Model**:

```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  registeredCount: number;
  organizerId: string;
  organizer: User;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Event Components**:

- `EventCard`: Displays event summary with image, title, date, location
- `EventList`: Grid/list view of events with filtering and pagination
- `EventForm`: Create/edit event form with validation
- `EventDetails`: Full event information with registration button
- `EventFilters`: Filter events by date, location, category

### Registration System

**Registration Data Model**:

```typescript
interface Registration {
  id: string;
  eventId: string;
  event: Event;
  userId: string;
  user: User;
  status: "confirmed" | "cancelled";
  registeredAt: Date;
}
```

**Registration Flow**:

1. User clicks "Register" on event details page
2. System checks event capacity
3. If available, creates registration record
4. Updates event's registeredCount
5. Displays confirmation message
6. Sends confirmation email (future enhancement)

### Internationalization

**Implementation with next-intl**:

- Middleware intercepts requests and determines locale from URL
- Messages loaded from JSON files (`messages/en.json`, `messages/uk.json`)
- `useTranslations` hook provides translations in components
- `Link` component from next-intl handles locale-aware navigation
- Date/time formatting uses locale-specific formats

**Language Switcher**:

- Dropdown in header to switch between Ukrainian and English
- Persists selection in cookie
- Reloads current page with new locale

### UI Components (shadcn/ui)

**Core Components to Install**:

- Button
- Card
- Input
- Label
- Form
- Select
- Dialog
- Dropdown Menu
- Tabs
- Badge
- Calendar
- Toast/Sonner

**Styling Approach**:

- Tailwind CSS utility classes for layout and spacing
- shadcn/ui components for consistent design system
- Custom theme configuration in `tailwind.config.ts`
- Dark mode support (optional enhancement)

### Animations (framer-motion)

**Animation Patterns**:

- Page transitions: Fade in with slide up
- Card hover: Scale and shadow effects
- Form validation: Shake animation on error
- Loading states: Skeleton loaders with pulse
- Modal/dialog: Fade in backdrop with scale content

**Performance Considerations**:

- Use `layout` animations sparingly
- Prefer `transform` and `opacity` for performance
- Limit animation duration to 300ms
- Use `will-change` CSS property for complex animations

## Data Models

### Database Schema

**Users Table**:

```typescript
{
  id: string (UUID, primary key)
  email: string (unique, not null)
  name: string (not null)
  password: string (hashed, nullable for OAuth users)
  provider: 'credentials' | 'google'
  providerId: string (nullable)
  image: string (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Events Table**:

```typescript
{
  id: string (UUID, primary key)
  title: string (not null)
  description: text (not null)
  date: timestamp (not null)
  location: string (not null)
  capacity: integer (not null)
  registeredCount: integer (default 0)
  organizerId: string (foreign key to Users)
  imageUrl: string (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Registrations Table**:

```typescript
{
  id: string (UUID, primary key)
  eventId: string (foreign key to Events)
  userId: string (foreign key to Users)
  status: enum ('confirmed', 'cancelled')
  registeredAt: timestamp
  unique constraint on (eventId, userId)
}
```

### Validation Schemas (Zod)

**Event Schema**:

```typescript
const eventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  date: z.date().min(new Date()),
  location: z.string().min(3).max(200),
  capacity: z.number().int().positive().max(10000),
  imageUrl: z.string().url().optional(),
});
```

**Registration Schema**:

```typescript
const registrationSchema = z.object({
  eventId: z.string().uuid(),
});
```

**Auth Schemas**:

```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z
  .object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

## Error Handling

### Client-Side Error Handling

**Form Validation Errors**:

- Display inline error messages below form fields
- Use react-hook-form's error state
- Show field-level errors immediately on blur
- Show form-level errors on submit attempt

**API Request Errors**:

- Catch axios errors in try-catch blocks
- Display toast notifications for user-facing errors
- Log detailed errors to console in development
- Show generic error messages in production

**Error Boundary**:

- Wrap app in ErrorBoundary component
- Catch React rendering errors
- Display fallback UI with retry option
- Log errors to error tracking service (future enhancement)

### Server-Side Error Handling

**API Route Error Responses**:

```typescript
// Standard error response format
{
  error: string,
  message: string,
  statusCode: number
}
```

**Error Status Codes**:

- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 409: Conflict (e.g., already registered)
- 500: Internal Server Error

**Database Error Handling**:

- Wrap database operations in try-catch
- Handle unique constraint violations
- Handle foreign key violations
- Return appropriate HTTP status codes

## Testing Strategy

### Unit Testing

**Test Framework**: Jest + React Testing Library

**Components to Test**:

- Form components (LoginForm, RegisterForm, EventForm)
- Event components (EventCard, EventList)
- Utility functions (validation, formatting)

**Test Coverage Goals**:

- Form validation logic: 100%
- Utility functions: 90%+
- Component rendering: 80%+

### Integration Testing

**API Route Testing**:

- Test authentication flows
- Test CRUD operations for events
- Test registration creation and validation
- Mock database calls

### End-to-End Testing

**Critical User Flows** (future enhancement):

- User registration and login
- Event creation and editing
- Event registration process
- Language switching

## Performance Optimization

### Next.js Optimizations

- Use Server Components by default
- Client Components only when needed (forms, interactive elements)
- Implement route-level code splitting
- Use Next.js Image component for optimized images
- Enable static generation for public pages

### Data Fetching

- Use React Server Components for initial data fetching
- Implement pagination for event lists
- Cache API responses with appropriate headers
- Use SWR or React Query for client-side data fetching

### Bundle Optimization

- Tree-shake unused dependencies
- Lazy load heavy components (e.g., event form)
- Minimize client-side JavaScript
- Use dynamic imports for route-specific code

## Security Considerations

### Authentication Security

- Hash passwords with bcrypt (minimum 10 rounds)
- Use secure session tokens (JWT with httpOnly cookies)
- Implement CSRF protection
- Rate limit authentication endpoints

### Authorization

- Verify user ownership before allowing event edits/deletes
- Protect API routes with authentication middleware
- Validate user permissions on server-side

### Input Validation

- Validate all inputs on both client and server
- Sanitize user-generated content
- Prevent SQL injection with parameterized queries
- Implement XSS protection

### Environment Variables

- Store sensitive data in environment variables
- Never commit secrets to version control
- Use different credentials for development and production
- Validate required environment variables on startup

## Deployment Configuration

### Vercel Deployment

**Environment Variables**:

- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: NextAuth secret key
- `NEXTAUTH_URL`: Application URL
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

**Build Configuration**:

- Output: Standalone
- Node version: 18.x or higher
- Build command: `next build`
- Install command: `npm install`

**Performance Settings**:

- Enable Edge Runtime for API routes where possible
- Configure caching headers
- Enable compression
- Set up CDN for static assets
