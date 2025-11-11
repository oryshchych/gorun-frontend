# Implementation Plan

## Frontend-Only Architecture
This is a frontend Next.js application that consumes a separate backend API (MongoDB-based). The backend will be shared with Telegram bot and mobile applications.

- [x] 1. Initialize Next.js project and install dependencies
  - Create Next.js 15 app with TypeScript and Tailwind CSS using `npx create-next-app@latest`
  - Install core dependencies: next-intl, axios, zod, react-hook-form, framer-motion, lucide-react, next-themes
  - Install shadcn/ui CLI and initialize with default configuration
  - Configure TypeScript with strict mode in tsconfig.json
  - _Requirements: 1.1, 1.4, 4.2, 5.2, 6.4, 8.2_

- [x] 2. Set up project structure and configuration files
  - Create folder structure: app/[locale], components, lib, hooks, types, messages
  - Configure Tailwind CSS with custom theme colors and shadcn/ui integration
  - Create next.config.js with next-intl plugin configuration
  - Set up environment variables template (.env.example) with NEXT_PUBLIC_API_URL
  - Create i18n.ts configuration file for Ukrainian and English locales
  - _Requirements: 4.1, 4.2, 6.1_

- [x] 3. Implement internationalization foundation
  - Create messages/uk.json with Ukrainian translations for common UI elements
  - Create messages/en.json with English translations
  - Implement middleware.ts with next-intl locale detection and routing
  - Create app/[locale]/layout.tsx as root layout with locale provider
  - Implement LanguageSwitcher component with locale persistence
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 4. Install and configure shadcn/ui components
  - Install shadcn/ui components: button, card, input, label, form, select, dialog, dropdown-menu, badge, sonner
  - Create components/ui directory with installed components
  - Customize component styles in components.json configuration
  - Create shared LoadingSpinner component using lucide-react icons
  - _Requirements: 6.4, 6.5_

- [x] 5. Implement theme switching (dark/light mode)
  - Install and configure next-themes for theme management
  - Create components/layout/ThemeToggle.tsx with sun/moon icons
  - Integrate ThemeProvider in root layout
  - Add theme toggle to header/navigation
  - Test theme persistence across page navigation
  - _Requirements: 6.1, 6.2_

- [x] 6. Set up API client and authentication
- [x] 6.1 Create axios API client
  - Implement lib/api/client.ts with configured axios instance
  - Add request interceptor to attach JWT tokens from localStorage
  - Add response interceptor for error handling and token refresh
  - Configure base URL from environment variables
  - Implement error response formatting
  - _Requirements: 1.4, 7.3, 7.4_

- [x] 6.2 Implement authentication service
  - Create lib/api/auth.ts with login, register, logout functions
  - Implement token storage in localStorage/cookies
  - Create hooks/useAuth.ts for authentication state management
  - Add automatic token refresh logic
  - Implement session persistence across page reloads
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 6.3 Create authentication UI components
  - Implement components/auth/LoginForm.tsx with email/password fields
  - Implement components/auth/RegisterForm.tsx with name, email, password fields
  - Create lib/validations/auth.ts with zod schemas for login and registration
  - Integrate react-hook-form with zod resolver in auth forms
  - Add form validation error display with inline messages
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.4_

- [x] 6.4 Create authentication pages
  - Create app/[locale]/(auth)/login/page.tsx with LoginForm
  - Create app/[locale]/(auth)/register/page.tsx with RegisterForm
  - Implement authentication layout with centered form design
  - Add loading states during authentication
  - Implement logout functionality in header
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 7. Create type definitions and validation schemas
  - Create types/auth.ts with User, LoginRequest, RegisterRequest interfaces
  - Create types/event.ts with Event, CreateEventRequest, UpdateEventRequest interfaces
  - Create types/registration.ts with Registration, CreateRegistrationRequest interfaces
  - Create types/api.ts with ApiResponse, ApiError, PaginatedResponse interfaces
  - Create lib/validations/event.ts with event creation/edit zod schema
  - Create lib/validations/registration.ts with registration zod schema
  - _Requirements: 5.2, 7.1, 7.2_

- [x] 8. Implement event API service layer
- [x] 8.1 Create events API service
  - Implement lib/api/events.ts with functions to fetch, create, update, delete events
  - Create hooks/useEvents.ts with React Query integration for events data
  - Add optimistic updates for better UX
  - Implement error handling and loading states
  - Add pagination support for event lists
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 7.1, 7.4_

- [x] 8.2 Create registrations API service
  - Implement lib/api/registrations.ts with functions to fetch and create registrations
  - Create hooks/useRegistrations.ts with React Query integration
  - Add capacity check validation before registration
  - Implement error handling for full events and duplicate registrations
  - Add optimistic updates for registration actions
  - _Requirements: 3.3, 3.4, 7.2, 7.5_

- [x] 11. Build event management components
- [x] 11.1 Create event display components
  - Implement components/events/EventCard.tsx with image, title, date, location, capacity badge
  - Implement components/events/EventList.tsx with grid layout and responsive design
  - Add framer-motion animations for card hover effects
  - Display event capacity status (available spots or full)
  - _Requirements: 3.1, 3.2, 6.1, 6.3, 8.2, 8.4_

- [x] 11.2 Create event form component
  - Implement components/events/EventForm.tsx with all event fields
  - Integrate react-hook-form with event zod schema
  - Add date picker using shadcn/ui calendar component
  - Implement real-time validation with error messages
  - Add image URL input with preview
  - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11.3 Create event details component
  - Implement components/events/EventDetails.tsx with full event information
  - Add registration button with capacity check
  - Display organizer information
  - Show list of registered attendees (for organizers)
  - Add edit and delete buttons for event owners
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 12. Create event management pages
  - Create app/[locale]/(dashboard)/events/page.tsx to display all events
  - Create app/[locale]/(dashboard)/events/create/page.tsx with EventForm
  - Create app/[locale]/(dashboard)/events/[id]/page.tsx with EventDetails
  - Create app/[locale]/(dashboard)/events/[id]/edit/page.tsx with EventForm (edit mode)
  - Create app/[locale]/(dashboard)/my-events/page.tsx for organizer's events
  - Create app/[locale]/(dashboard)/my-registrations/page.tsx for user's registrations
  - _Requirements: 2.1, 2.3, 2.4, 3.1, 3.5_

- [ ] 13. Implement layout components
  - Create components/layout/Header.tsx with navigation, auth status, ThemeToggle, and LanguageSwitcher
  - Create components/layout/Footer.tsx with basic information
  - Create app/[locale]/(dashboard)/layout.tsx with Header and protected route logic
  - Add responsive mobile navigation menu
  - Implement user dropdown menu with profile and logout options
  - _Requirements: 1.5, 4.2, 6.2, 6.3_

- [ ] 14. Add animations and transitions
  - Implement page transition animations using framer-motion in layout
  - Add card hover animations with scale and shadow effects
  - Create loading skeleton components for event cards
  - Add form validation shake animation on error
  - Implement modal/dialog animations for confirmations
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 15. Implement error handling and user feedback
  - Create components/shared/ErrorBoundary.tsx to catch React errors
  - Set up toast notifications using shadcn/ui toast component
  - Add error handling in API routes with consistent error response format
  - Display user-friendly error messages for common scenarios
  - Implement loading states for all async operations
  - _Requirements: 1.3, 2.2, 7.4, 8.3_

- [ ] 16. Add responsive design and accessibility
  - Ensure all pages are responsive using Tailwind breakpoints (sm, md, lg, xl)
  - Test mobile navigation and forms on small screens
  - Add proper ARIA labels to interactive elements
  - Ensure keyboard navigation works for all interactive components
  - Test color contrast for accessibility compliance
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 17. Implement home page and routing
  - Create app/[locale]/page.tsx as landing page with featured events
  - Add hero section with call-to-action buttons
  - Implement middleware for authentication redirects
  - Set up protected routes for dashboard pages
  - Add 404 page with navigation back to home
  - _Requirements: 3.1, 4.2_

- [ ] 18. Add translation content for all UI elements
  - Complete messages/uk.json with all Ukrainian translations
  - Complete messages/en.json with all English translations
  - Translate form labels, buttons, error messages, and navigation items
  - Add date/time formatting functions with locale support
  - Test language switching across all pages
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 19. Configure deployment for Vercel
  - Create vercel.json with build configuration
  - Set up environment variables in Vercel dashboard (NEXT_PUBLIC_API_URL)
  - Configure CORS settings with backend API
  - Test build process locally with `next build`
  - Set up preview deployments for pull requests
  - _Requirements: 7.3_

- [ ] 20. Testing and quality assurance
- [ ] 20.1 Write unit tests for validation schemas
  - Test auth validation schemas with valid and invalid inputs
  - Test event validation schemas with edge cases
  - Test registration validation schemas
  - _Requirements: 5.2, 5.4_

- [ ] 20.2 Write component tests
  - Test LoginForm and RegisterForm rendering and validation
  - Test EventCard and EventList rendering
  - Test EventForm with react-hook-form integration
  - Test LanguageSwitcher functionality
  - _Requirements: 1.1, 4.2, 5.1, 6.4_

- [ ] 20.3 Write API service tests
  - Test API client request/response interceptors
  - Test authentication service with token management
  - Test event service CRUD operations
  - Test registration service with error handling
  - Mock API responses for consistent testing
  - _Requirements: 1.1, 2.1, 3.3, 3.4, 7.4_
