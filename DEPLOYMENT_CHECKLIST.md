# Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

### Code Quality

- [x] Build passes locally (`npm run build`)
- [ ] All TypeScript errors resolved
- [ ] No console errors in development
- [ ] All features tested locally

### Configuration Files

- [x] `vercel.json` created with proper configuration
- [x] `.vercelignore` created to exclude unnecessary files
- [x] `.env.example` updated with all required variables
- [x] `next.config.js` properly configured
- [x] `package.json` has correct scripts

### Documentation

- [x] README.md created with project overview
- [x] DEPLOYMENT.md created with detailed instructions
- [x] VERCEL_QUICK_START.md created for quick reference
- [x] Environment variables documented

## Vercel Setup

### Account & Project

- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Project imported in Vercel
- [ ] Framework preset set to Next.js

### Environment Variables

- [ ] `NEXT_PUBLIC_API_URL` set (Required)
- [ ] `NEXTAUTH_SECRET` set (Required)
- [ ] `NEXTAUTH_URL` set (Auto-set by Vercel)
- [ ] `GOOGLE_CLIENT_ID` set (Optional)
- [ ] `GOOGLE_CLIENT_SECRET` set (Optional)
- [ ] Variables set for all environments (Production, Preview, Development)

### Build Settings

- [ ] Build command: `next build` (auto-detected)
- [ ] Output directory: `.next` (auto-detected)
- [ ] Install command: `npm install` (auto-detected)
- [ ] Node.js version: 18.x or higher

## Backend Configuration

### API Setup

- [ ] Backend API is deployed and accessible
- [ ] Backend API URL is correct in `NEXT_PUBLIC_API_URL`
- [ ] API endpoints are working

### CORS Configuration

- [ ] Backend allows requests from Vercel domain
- [ ] CORS headers include:
  - [ ] `Access-Control-Allow-Origin` with Vercel domains
  - [ ] `Access-Control-Allow-Methods` with required methods
  - [ ] `Access-Control-Allow-Headers` with required headers
  - [ ] `Access-Control-Allow-Credentials: true`
- [ ] Preview deployment domains included in CORS (\*.vercel.app)

### Authentication

- [ ] Backend authentication endpoints working
- [ ] JWT token generation working
- [ ] Token validation working
- [ ] Session management configured

## First Deployment

### Deploy

- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Check build logs for errors
- [ ] Deployment successful

### Verification

- [ ] Can access deployed URL
- [ ] Homepage loads correctly
- [ ] Language switcher works (Ukrainian/English)
- [ ] Theme toggle works (light/dark)
- [ ] Images load correctly

### Authentication Testing

- [ ] Can access login page
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can logout
- [ ] Protected routes redirect to login
- [ ] Session persists across page reloads

### Event Management Testing

- [ ] Can view events list
- [ ] Can view event details
- [ ] Can create new event (as organizer)
- [ ] Can edit own event
- [ ] Can delete own event
- [ ] Can view "My Events" page

### Registration Testing

- [ ] Can register for event
- [ ] Can view "My Registrations" page
- [ ] Capacity tracking works
- [ ] Cannot register for full events
- [ ] Cannot register twice for same event

### Internationalization Testing

- [ ] All pages display in Ukrainian by default
- [ ] Can switch to English
- [ ] Language preference persists
- [ ] Date/time formats are localized
- [ ] All UI elements are translated

### Responsive Design Testing

- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Navigation works on all screen sizes
- [ ] Forms are usable on mobile

## Post-Deployment

### Monitoring Setup

- [ ] Check Vercel function logs
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up error tracking (optional)
- [ ] Monitor performance metrics

### Domain Configuration (Optional)

- [ ] Custom domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Domain redirects working
- [ ] Update `NEXTAUTH_URL` to custom domain
- [ ] Update backend CORS for custom domain
- [ ] Update Google OAuth redirect URIs (if using)

### Preview Deployments

- [ ] Preview deployments enabled
- [ ] Test preview deployment from PR
- [ ] Verify preview uses correct environment variables
- [ ] Confirm preview URL is accessible

### Continuous Deployment

- [ ] Production branch configured (main/master)
- [ ] Auto-deploy on push enabled
- [ ] Preview deployments on PR enabled
- [ ] GitHub/GitLab integration working

## Security Review

### Environment Variables

- [ ] No secrets in code
- [ ] All sensitive data in environment variables
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] Database credentials not exposed to client

### Authentication

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Secure session cookies
- [ ] Password hashing on backend
- [ ] Rate limiting on auth endpoints (backend)

### API Security

- [ ] API requests use HTTPS
- [ ] Authorization checks on protected routes
- [ ] Input validation on all forms
- [ ] XSS protection enabled

## Performance Optimization

### Next.js Optimizations

- [ ] Server Components used where possible
- [ ] Client Components only when needed
- [ ] Images use Next.js Image component
- [ ] Static pages generated where possible

### Caching

- [ ] Static assets cached
- [ ] API responses cached appropriately
- [ ] Browser caching configured

### Bundle Size

- [ ] No unnecessary dependencies
- [ ] Code splitting working
- [ ] Lazy loading implemented where beneficial

## Documentation

### User Documentation

- [ ] README.md is up to date
- [ ] Deployment guides are accurate
- [ ] Environment variables documented
- [ ] Troubleshooting section complete

### Developer Documentation

- [ ] Code is commented where necessary
- [ ] API integration documented
- [ ] Component usage documented
- [ ] Contributing guidelines (if open source)

## Rollback Plan

### Preparation

- [ ] Know how to rollback in Vercel
- [ ] Previous working deployment identified
- [ ] Rollback procedure tested

### Emergency Contacts

- [ ] Backend team contact info
- [ ] Vercel support access
- [ ] Team notification plan

## Final Checks

- [ ] All checklist items completed
- [ ] Deployment is stable
- [ ] No critical errors in logs
- [ ] Users can access and use the application
- [ ] Team notified of deployment
- [ ] Documentation updated

## Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Monitor API response times
- [ ] Check for any CORS issues
- [ ] Verify all features working in production

---

## Notes

Use this space to document any deployment-specific notes, issues encountered, or custom configurations:

```
Date: ___________
Deployed by: ___________
Deployment URL: ___________
Backend API URL: ___________

Issues encountered:
-

Resolutions:
-

Custom configurations:
-
```

## Quick Reference

### Vercel Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs [deployment-url]

# List deployments
vercel ls
```

### Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Project Settings: https://vercel.com/[team]/[project]/settings
- Deployment Logs: https://vercel.com/[team]/[project]/deployments
- Environment Variables: https://vercel.com/[team]/[project]/settings/environment-variables
