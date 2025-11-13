# Vercel Deployment Quick Start

## 🚀 Deploy in 5 Minutes

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub/GitLab/Bitbucket
3. Click "Add New Project"
4. Import this repository

### Step 2: Configure Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# REQUIRED
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api

# REQUIRED for authentication
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-app.vercel.app

# OPTIONAL (for Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 3: Deploy

Click "Deploy" - Vercel will automatically:
- Detect Next.js framework
- Install dependencies
- Build the project
- Deploy to production

### Step 4: Configure Backend CORS

Update your backend API to allow requests from Vercel:

```javascript
// Add your Vercel domain to CORS origins
const allowedOrigins = [
  'https://your-app.vercel.app',
  'https://your-app-*.vercel.app', // Preview deployments
  'http://localhost:3000'
];
```

## ✅ Verification Checklist

- [ ] Build completed successfully
- [ ] Environment variables are set
- [ ] Backend API is accessible
- [ ] CORS is configured on backend
- [ ] Can access deployed app
- [ ] Can login/register
- [ ] Can view events
- [ ] Language switching works

## 🔧 Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Run `npm run build` locally to test

**Can't connect to API?**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS settings
- Ensure backend is publicly accessible

**Authentication not working?**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Update Google OAuth redirect URIs

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

## 🌐 Preview Deployments

Every pull request automatically gets a preview deployment:
- Unique URL for testing
- Same configuration as production
- Perfect for reviewing changes before merge

## 🔄 Continuous Deployment

Automatic deployments on:
- **Production**: Push to `main` branch
- **Preview**: Push to any branch or open PR

## 📊 Monitoring

View logs and analytics:
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" → Select deployment
4. View "Functions" tab for logs

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Project Issues](https://github.com/your-repo/issues)
