# ✅ Render Deployment Checklist

## Before You Start

- [ ] GitHub account created
- [ ] Render account created (https://render.com)
- [ ] Code pushed to GitHub (https://github.com/himaanshuuyadav/CashClash-Admin)
- [ ] Brevo API key ready
- [ ] Firebase `serviceAccountKey.json` file available

---

## Deployment Steps

### 1. Create Web Service ⚙️
- [ ] Log in to Render dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository: **CashClash-Admin**
- [ ] Choose branch: **main**

### 2. Configure Service Settings 🔧

**Basic Info:**
- [ ] Name: `cashclash-admin`
- [ ] Region: (choose closest)
- [ ] Runtime: **Python 3**

**Build & Start:**
- [ ] Build Command: `./build.sh`
- [ ] Start Command: `gunicorn server:app`

**Instance:**
- [ ] Free tier (for testing)
- [ ] Starter tier ($7/month - recommended for production)

### 3. Environment Variables 🔐

Click "Advanced" → "Add Environment Variable"

- [ ] **BREVO_API_KEY**: Your Brevo API key
- [ ] **SENDER_EMAIL**: Your verified sender email
- [ ] **FIREBASE_CREDENTIALS_JSON**: Paste entire serviceAccountKey.json content

Optional:
- [ ] **FLASK_DEBUG**: `False` (default, recommended)
- [ ] **PORT**: `10000` (Render sets this automatically)

### 4. Deploy 🚀
- [ ] Click "Create Web Service"
- [ ] Wait 3-5 minutes for deployment
- [ ] Check logs for "Build completed successfully!"
- [ ] Verify "Your service is live 🎉"

### 5. Test Deployment ✅
- [ ] Visit your Render URL: `https://cashclash-admin.onrender.com`
- [ ] Login page loads successfully
- [ ] Test health endpoint: `/api/health`
- [ ] Try logging in with OTP

### 6. Update Android App 📱
- [ ] Update server URL in Android app
- [ ] File: `ServerConfig.kt`
- [ ] Change to: `https://cashclash-admin.onrender.com`
- [ ] Test Android app with production server

---

## Post-Deployment

### Monitor Your App
- [ ] Check Render logs regularly
- [ ] Set up email alerts in Render settings
- [ ] Monitor metrics (CPU, memory, requests)

### Security
- [ ] Verify environment variables are set
- [ ] Check Firebase security rules
- [ ] Review CORS settings if needed

### Performance
- [ ] Test cold start time (free tier)
- [ ] Consider upgrading to Starter if needed
- [ ] Set up uptime monitoring (optional)

---

## Troubleshooting

**Build fails?**
- Check `requirements.txt` syntax
- Verify Python version compatibility
- Review build logs in Render

**App crashes?**
- Verify all environment variables
- Check Firebase credentials format
- Review runtime logs

**Can't access?**
- Verify service status is "Live"
- Clear browser cache
- Try incognito mode
- Check URL is correct

**OTP not sending?**
- Verify Brevo API key
- Check sender email is verified
- Review logs for Brevo errors

---

## Need Help?

📖 Full Guide: See `RENDER_DEPLOYMENT.md`
💬 Render Docs: https://render.com/docs
🆘 Community: https://community.render.com

---

**Ready? Start at Step 1! 🎯**
