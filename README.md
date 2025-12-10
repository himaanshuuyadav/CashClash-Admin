# CashClash Admin Web Panel

Flask-based admin panel for managing CashClash tournaments, withdrawals, and user verification.

## 🚀 Features

- 🔐 **Email Verification**: 6-digit OTP verification via Brevo
- 🏆 **Tournament Management**: Create, edit, and monitor tournaments
- 💰 **Withdrawal Processing**: Handle user withdrawal requests
- 📊 **Dashboard**: Real-time statistics and monitoring
- 🔥 **Firebase Integration**: Firestore database and authentication
- ⏱️ **OTP Expiry**: Secure 10-minute OTP validity
- 🔄 **Resend OTP**: User-friendly resend functionality

## 📋 Requirements

- Python 3.8 or higher
- Firebase project with Firestore enabled
- Brevo (formerly Sendinblue) account for email service

## 🛠️ Setup Instructions

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file with your credentials:

```env
BREVO_API_KEY=your_brevo_api_key_here
SENDER_EMAIL=your_verified_email@domain.com
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
PORT=5000
```

### 3. Add Firebase Credentials

- Download `serviceAccountKey.json` from Firebase Console
- Place it in the `admin-web` folder

### 4. Get Brevo API Key

1. Sign up at [Brevo](https://www.brevo.com)
2. Go to **Settings** → **SMTP & API** → **API Keys**
3. Create a new API key
4. Copy and paste it in `.env`

### 5. Verify Sender Email

1. In Brevo, go to **Senders**
2. Add and verify your email address
3. Use this email as `SENDER_EMAIL` in `.env`

## Running the Server

### Local Development

```bash
python server.py
```

Server will run at: `http://localhost:5000`

- Admin Panel: `http://localhost:5000/`
- API Endpoints: `http://localhost:5000/api/*`

## API Endpoints

### Send OTP
```
POST /api/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "userId": "user123",
  "fullName": "John Doe"
}
```

### Verify OTP
```
POST /api/verify-otp
Content-Type: application/json

{
  "userId": "user123",
  "code": "123456"
}
```

### Resend OTP
```
POST /api/resend-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "userId": "user123",
  "fullName": "John Doe"
}
```

### Check Verification Status
```
POST /api/check-verification
Content-Type: application/json

{
  "userId": "user123"
}
```

### Health Check
```
GET /api/health
```

## Deployment

### Deploy to Render.com (Free)

1. Create account at [Render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn server:app`
5. Add environment variables in Render dashboard
6. Deploy!

### Deploy to Railway.app (Free)

1. Create account at [Railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository
4. Add environment variables
5. Deploy!

## Admin Panel Routes

- `/` or `/login.html` - Login page
- `/dashboard.html` - Dashboard
- `/tournaments.html` - Tournament management
- `/withdrawals.html` - Withdrawal management
- `/css/*` - CSS files
- `/js/*` - JavaScript files

## Firestore Structure

```
verificationCodes/
  {userId}/
    code: "123456"
    email: "user@example.com"
    expiry: 1699123456789
    verified: false
    createdAt: timestamp
    verifiedAt: timestamp (optional)
```

## Testing

Test endpoints with curl:

```bash
# Send OTP
curl -X POST http://localhost:5000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","userId":"test123","fullName":"Test User"}'

# Verify OTP
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","code":"123456"}'
```

## Troubleshooting

### Error: "Could not connect to Brevo API"
- Check your `BREVO_API_KEY` in `.env`
- Ensure API key is active in Brevo dashboard

### Error: "Sender email not verified"
- Verify your sender email in Brevo dashboard
- Wait for verification email and confirm

### Error: "Firebase credentials not found"
- Ensure `serviceAccountKey.json` is in `admin-web` folder
- Check `FIREBASE_CREDENTIALS_PATH` in `.env`

## License

MIT
