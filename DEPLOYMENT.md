# Deployment Guide for Vercel

This guide covers deploying the Events Platform to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub/GitLab/Bitbucket repository connected to Vercel
- Backend API deployed and accessible

## Environment Variables

Configure the following environment variables in your Vercel project dashboard:

### Required Variables

1. **NEXT_PUBLIC_API_URL**
   - Description: Backend API base URL
   - Example: `https://api.yourdomain.com/api`
   - Note: Must be publicly accessible and include the `/api` path

2. **NEXTAUTH_SECRET**
   - Description: Secret key for NextAuth.js session encryption
   - Generate with: `openssl rand -base64 32`
   - Example: `your-generated-secret-key-here`

3. **NEXTAUTH_URL**
   - Description: Full URL of your deployed application
   - Example: `https://your-app.vercel.app`
   - Note: Vercel automatically sets this for production deployments

4. **DATABASE_URL** (if using database directly from frontend)
   - Description: PostgreSQL connection string
   - Example: `postgresql://user:password@host:5432/database`
   - Note: Only needed if frontend connects directly to database

### Optional Variables (OAuth)

5. **GOOGLE_CLIENT_ID**
   - Description: Google OAuth client ID
   - Get from: https://console.cloud.google.com

6. **GOOGLE_CLIENT_SECRET**
   - Description: Google OAuth client secret
   - Get from: https://console.cloud.google.com

## Vercel Dashboard Setup

### 1. Import Project

1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the repository containing this project
4. Vercel will auto-detect Next.js framework

### 2. Configure Build Settings

Vercel should auto-detect these settings from `vercel.json`:

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`
- **Development Command**: `next dev`

### 3. Add Environment Variables

1. Go to Project Settings → Environment Variables
2. Add each variable from the list above
3. Select environments: Production, Preview, Development
4. Click "Save"

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (typically 2-3 minutes)
3. Visit your deployment URL

## CORS Configuration

### Backend API CORS Settings

Your backend API must allow requests from your Vercel domain. Configure CORS headers:

```javascript
// Example Express.js CORS configuration
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'https://your-app-*.vercel.app', // Preview deployments
    'http://localhost:3000' // Local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### Frontend CORS Headers

The `vercel.json` file includes CORS headers for API routes within the Next.js app. These are already configured.

## Preview Deployments

Vercel automatically creates preview deployments for:

- Every push to non-production branches
- Every pull request

### Preview Deployment Features

- Unique URL for each deployment
- Same environment variables as production (or configure separately)
- Automatic comments on pull requests with deployment URL
- Perfect for testing before merging to production

### Configure Preview Deployments

1. Go to Project Settings → Git
2. Enable "Automatic Preview Deployments"
3. Configure branch patterns (default: all branches except production)

## Testing Build Locally

Before deploying, test the production build locally:

```bash
# Install dependencies
npm install

# Create production build
npm run build

# Start production server
npm run start
```

Visit http://localhost:3000 to test the production build.

### Common Build Issues

**Issue**: Module not found errors
- **Solution**: Ensure all dependencies are in `package.json`, not just `devDependencies`

**Issue**: Environment variables not working
- **Solution**: Prefix client-side variables with `NEXT_PUBLIC_`

**Issue**: Build succeeds but runtime errors
- **Solution**: Check browser console and Vercel function logs

## Monitoring and Logs

### View Deployment Logs

1. Go to your project dashboard
2. Click on a deployment
3. View "Building" and "Functions" tabs for logs

### Runtime Logs

1. Go to Project → Deployments
2. Click on active deployment
3. Click "Functions" tab
4. View real-time logs

### Analytics

Enable Vercel Analytics:
1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. Add `<Analytics />` component to your app (optional)

## Custom Domain

### Add Custom Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., `events.yourdomain.com`)
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (up to 48 hours)

### Update Environment Variables

After adding custom domain, update:
- `NEXTAUTH_URL` to your custom domain
- Backend CORS to allow your custom domain

## Rollback

If a deployment has issues:

1. Go to Project → Deployments
2. Find a previous working deployment
3. Click "..." menu → "Promote to Production"

## Performance Optimization

### Recommended Settings

1. **Enable Edge Functions** (if applicable)
   - Faster response times globally
   - Configure in `vercel.json` or per-route

2. **Image Optimization**
   - Already configured in `next.config.js`
   - Uses Vercel's image optimization automatically

3. **Caching**
   - Next.js automatically caches static assets
   - Configure cache headers in `next.config.js` if needed

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] `NEXTAUTH_SECRET` is unique and secure
- [ ] Backend API has proper CORS configuration
- [ ] Database credentials are secure (not exposed to client)
- [ ] Google OAuth redirect URIs include Vercel domain
- [ ] HTTPS is enabled (automatic on Vercel)

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Test build locally with `npm run build`
3. Ensure all dependencies are installed
4. Check for TypeScript errors

### Runtime Errors

1. Check browser console for client-side errors
2. Check Vercel function logs for server-side errors
3. Verify environment variables are set correctly
4. Test API connectivity from deployed app

### API Connection Issues

1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend CORS configuration
3. Ensure backend API is accessible from internet
4. Test API endpoints directly with curl/Postman

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` or `master` branch
- **Preview**: Pushes to other branches and pull requests

To disable automatic deployments:
1. Go to Project Settings → Git
2. Disable "Production Branch" or "Preview Deployments"
