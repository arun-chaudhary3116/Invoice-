# Backend Environment Setup Guide

## Overview

This is a professional authentication system with email/password and Google OAuth login using:

- **Express.js** - Backend framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests support

## Required Setup Steps

### 1. MongoDB Setup

Your MongoDB connection string has a placeholder password. Replace it:

**Current:** `mongodb+srv://arunc3116_db_user:<db_password>@cluster0.tf2gjuw.mongodb.net/?appName=Cluster0`

**Steps:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in to your account
3. Navigate to Clusters → Connect → Connect your application
4. Copy the connection string
5. Replace `<db_password>` with your actual database password
6. Update `.env` file with the complete URI

### 2. Google OAuth Setup

**Your Google Client ID:** `1083751139072-r90hbromj9e0cvcif6ulqah41leg3ch0.apps.googleusercontent.com`

**Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Click on it to view details
5. Copy the **Client Secret**
6. Update `backend/.env` with `GOOGLE_CLIENT_SECRET=your_secret_here`

### 3. JWT Secret Setup

In `backend/.env`, replace:

```
JWT_SECRET=your_jwt_secret_key_here
```

With a strong random string (use an online generator or: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### 4. Session Secret Setup

In `backend/.env`, replace:

```
SESSION_SECRET=your_session_secret_here
```

With another strong random string

### 5. Update .env Files

**Backend (`backend/.env`):**

- ✅ MONGODB_URI - Replace `<db_password>` with your actual password
- ✅ GOOGLE_CLIENT_ID - Already set
- ⚠️ GOOGLE_CLIENT_SECRET - Add your Google Client Secret
- ⚠️ JWT_SECRET - Add a strong random key
- ⚠️ SESSION_SECRET - Add a strong random key

**Frontend (`frontend/.env`):**

- ✅ VITE_GOOGLE_CLIENT_ID - Already set
- ✅ VITE_API_URL - Already set to http://localhost:5000

## Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── google.js         # Google OAuth config
│   ├── models/
│   │   └── User.js           # User schema with auth methods
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── routes/
│   │   └── authRoutes.js     # Auth endpoints
│   ├── middleware/
│   │   └── authMiddleware.js # JWT protection
│   └── server.js             # Express app
├── package.json
└── .env
```

## API Endpoints

### Public Endpoints

- `POST /api/auth/register` - Register with email
- `POST /api/auth/login` - Login with email
- `POST /api/auth/google` - Google OAuth authentication

### Protected Endpoints (require JWT token)

- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### System Endpoints

- `GET /api/health` - Health check
- `GET /api` - API info

## How to Use

### Start Backend

```bash
cd backend
npm install  # Install dependencies
npm start    # Start server
```

### Email Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Email Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Google OAuth

```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "google_user_id",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "https://..."
  }'
```

## Frontend Integration

The frontend has ready-to-use utilities:

### Authentication API (`src/lib/authAPI.js`)

- `authAPI.register()` - Register user
- `authAPI.login()` - Login user
- `authAPI.googleAuth()` - Google OAuth
- `authAPI.getMe()` - Fetch user data
- `authAPI.logout()` - Logout

### Authentication Store (`src/lib/authStore.js`)

Zustand store for state management with methods:

- `register()` - Register and store token
- `login()` - Login and store token
- `googleAuth()` - Google auth and store token
- `logout()` - Clear authentication
- `initialize()` - Load from localStorage

### Google OAuth (`src/lib/googleOAuth.js`)

- `initializeGoogleOAuth()` - Initialize Google SDK
- `renderGoogleSignInButton()` - Render button
- `handleGoogleSignIn()` - Process Google response
- `decodeJWT()` - Decode tokens

## Security Notes

1. **Password Security**: Passwords are hashed using bcryptjs before storage
2. **JWT Tokens**: Signed tokens expire after 7 days (configurable)
3. **CORS**: Configured to only accept requests from frontend URL
4. **Sensitive Fields**: Password and tokens hidden in user responses
5. **MongoDB**: Ensure your database has authentication enabled

## Troubleshooting

### MongoDB Connection Error

- Check your MongoDB URI in .env
- Verify password doesn't contain special characters (URL encode if needed)
- Ensure your IP is whitelisted in MongoDB Atlas

### Google OAuth Not Working

- Verify GOOGLE_CLIENT_ID in .env
- Check that frontend URL is added to authorized redirect URIs in Google Cloud Console
- Ensure google-gsi library loads (check browser console)

### CORS Errors

- Update FRONTEND_URL in backend .env
- Ensure frontend is running on the correct URL

## Next Steps

1. ✅ Replace MongoDB password in `.env`
2. ✅ Add Google Client Secret to backend `.env`
3. ✅ Generate and add JWT_SECRET
4. ✅ Generate and add SESSION_SECRET
5. ✅ Restart backend server
6. ✅ Test authentication endpoints
7. ✅ Integrate authentication components in frontend pages
