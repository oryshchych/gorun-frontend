# Events Platform

A modern, bilingual (Ukrainian/English) events registration and management platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🎫 **Event Management**: Create, edit, and manage events
- 👥 **User Registration**: Register for events with capacity tracking
- 🌍 **Bilingual Support**: Ukrainian and English interfaces
- 🔐 **Authentication**: Secure login with NextAuth.js
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 🌓 **Dark Mode**: Theme switching support
- 📱 **Responsive Design**: Works on all devices
- ✨ **Smooth Animations**: Powered by Framer Motion

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Internationalization**: next-intl
- **State Management**: TanStack Query
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Backend API running (see backend repository)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gorun-client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
- `NEXT_PUBLIC_API_URL`: Your backend API URL
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- Other variables as needed

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   │   ├── (auth)/        # Authentication pages
│   │   └── (dashboard)/   # Protected dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── events/           # Event-related components
│   ├── layout/           # Layout components
│   ├── shared/           # Shared components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API clients
│   ├── api/             # API service layer
│   └── validations/     # Zod schemas
├── messages/            # i18n translation files
├── types/               # TypeScript type definitions
└── middleware.ts        # Next.js middleware
```

## Deployment

### Deploy to Vercel (Recommended)

See [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md) for a quick 5-minute deployment guide.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

#### Quick Deploy

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

### Environment Variables for Production

Required variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Your app URL (auto-set by Vercel)

Optional variables:
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth

## Features in Detail

### Event Management
- Create events with title, description, date, location, and capacity
- Upload event images
- Edit and delete your events
- View all your created events

### Registration System
- Browse all available events
- Register for events with one click
- View your registered events
- Automatic capacity tracking

### Internationalization
- Switch between Ukrainian and English
- Persistent language preference
- Localized date and time formats
- Translated UI elements

### Authentication
- Email/password authentication
- Google OAuth (optional)
- Secure session management
- Protected routes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md) for quick deployment

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
