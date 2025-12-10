# Render Deployment Guide for CashClash Admin Panel

## Prerequisites

1. **GitHub Repository**: Your admin panel code is already pushed to https://github.com/himaanshuuyadav/CashClash-Admin
2. **Render Account**: Sign up at https://render.com (free tier available)
3. **Brevo API Key**: From your Brevo account
4. **Firebase Credentials**: Your `serviceAccountKey.json` file

---

## Step-by-Step Deployment

### Step 1: Prepare Firebase Credentials

Since we can't upload `serviceAccountKey.json` directly, we'll use environment variables:

1. Open your `serviceAccountKey.json` file
2. Copy the entire JSON content
3. We'll paste it as an environment variable in Render

### Step 2: Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"**
4. If this is your first time:
   - Click **"Configure account"**
   - Authorize Render to access your GitHub
5. Select **"CashClash-Admin"** repository

### Step 3: Configure Service Settings

**Basic Settings:**
- **Name**: `cashclash-admin` (or your preferred name)
- **Region**: Choose closest to your users (e.g., Singapore, Oregon)
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn server:app`

**Instance Type:**
- Select **"Free"** for testing
- (Upgrade to **Starter** for production - $7/month)

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

1. **BREVO_API_KEY**
   - Value: `your_brevo_api_key_here`

2. **SENDER_EMAIL**
   - Value: `your_verified_email@domain.com`

3. **FIREBASE_CREDENTIALS_JSON**
   - Value: Paste the ENTIRE content of your `serviceAccountKey.json`
   - Example:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "...",
     "client_id": "...",
     "auth_uri": "...",
     "token_uri": "...",
     "auth_provider_x509_cert_url": "...",
     "client_x509_cert_url": "..."
   }
   ```

4. **PORT** (Optional - Render sets this automatically)
   - Value: `10000`

5. **PYTHON_VERSION** (Optional)
   - Value: `3.11.0`

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your application
   - Deploy it

### Step 6: Monitor Deployment

- Watch the **Logs** section for deployment progress
- First deployment takes 3-5 minutes
- Look for: `"Build completed successfully!"`
- Then: `"Your service is live 🎉"`

### Step 7: Access Your Admin Panel

Once deployed, your URL will be:
```
https://cashclash-admin.onrender.com
```

Or your custom name:
```
https://your-service-name.onrender.com
```

---

## Post-Deployment Setup

### Update Android App

Update the server URL in your Android app:

**File**: `app/src/main/java/com/prantiux/cashclash/utils/ServerConfig.kt`

```kotlin
object ServerConfig {
    const val BASE_URL = "https://cashclash-admin.onrender.com"
}
```

### Test the Deployment

1. Visit your Render URL
2. You should see the login page
3. Test API endpoints:
   - Health check: `https://your-url.onrender.com/api/health`

---

## Important Notes

### Free Tier Limitations

- **Spins down after 15 minutes of inactivity**
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (multiple services share this)

**Solutions:**
1. Upgrade to Starter plan ($7/month) - stays always active
2. Use a service like UptimeRobot to ping your app every 14 minutes
3. Accept the cold start delay

### Security Best Practices

✅ **Already Done:**
- Environment variables for secrets
- HTTPS enabled by default
- CORS configured

⚠️ **Recommended:**
- Add admin authentication
- Set up Firebase security rules
- Enable Render's IP allowlist (if needed)

### Automatic Deployments

- Every push to `main` branch triggers auto-deploy
- Can disable in Render settings if needed
- Can set up preview environments for PRs

---

## Troubleshooting

### Build Fails

**Check:**
1. `requirements.txt` has all dependencies
2. Python version compatibility
3. Build logs for specific errors

### App Crashes

**Check:**
1. Environment variables are set correctly
2. Firebase credentials JSON is valid
3. Brevo API key is active
4. Logs section in Render dashboard

### Can't Access Admin Panel

**Check:**
1. Service status is "Live"
2. No build errors
3. URL is correct
4. Browser cache (try incognito mode)

### OTP Emails Not Sending

**Check:**
1. Brevo API key is valid
2. Sender email is verified in Brevo
3. Check Render logs for errors
4. Verify Brevo account is active

---

## Updating Your App

### Method 1: Push to GitHub
```bash
cd d:\Program2\CashClash\admin-web
git add .
git commit -m "Update: description of changes"
git push
```
Render auto-deploys within 2-3 minutes.

### Method 2: Manual Deploy
1. Go to Render dashboard
2. Click your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Monitoring

### View Logs
- Dashboard → Your Service → **Logs**
- Real-time logs of all requests and errors

### Check Metrics
- Dashboard → Your Service → **Metrics**
- CPU, Memory, Request count
- Response times

### Set Up Alerts
- Dashboard → Your Service → **Settings** → **Notifications**
- Email alerts for:
  - Deploy failures
  - Service crashes
  - High resource usage

---

## Cost Optimization

### Free Tier Strategy
- Keep on free tier for development
- Upgrade before production launch

### Starter Plan Benefits ($7/month)
- Always active (no spin down)
- Faster response times
- Better for production
- Shared resources with other Starter services

---

## Custom Domain (Optional)

1. Buy domain from Namecheap, GoDaddy, etc.
2. In Render: **Settings** → **Custom Domain**
3. Add your domain: `admin.cashclash.com`
4. Update DNS records as shown
5. Wait for SSL certificate (automatic)

---

## Questions?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Support**: support@render.com (for paid plans)

---

**Ready to deploy? Follow the steps above! 🚀**
