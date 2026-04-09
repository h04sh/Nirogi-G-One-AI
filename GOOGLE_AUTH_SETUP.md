# Google Authentication Setup Guide

This guide explains how to set up Google Sign-in and Sign-up for the Nirogi G-One AI application.

## Features Added

✅ Google Sign-in on Login page
✅ Google Sign-up on Register page
✅ User profile picture support
✅ Automatic redirect to diagnosis page after login
✅ Persistent authentication using localStorage

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter project name: "Nirogi G-One AI"
4. Click "Create"

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields (app name, user support email, etc.)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed
4. After consent screen is configured, create OAuth 2.0 credentials:
   - Application type: "Web application"
   - Name: "Nirogi G-One AI Web"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:3001`
     - Your production domain (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - Your production domain
5. Click "Create"
6. Copy the **Client ID** from the credentials

### Step 4: Configure Environment Variables

1. Open `artifacts/medagent/.env`
2. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
   ```

### Step 5: Restart the Application

1. Stop the frontend server (if running)
2. Run: `pnpm install` (to ensure dependencies are installed)
3. Run: `pnpm --filter @workspace/nirogi-g-one-ai run dev`
4. Open http://localhost:5173 in your browser

## Testing Google Authentication

### Test Login with Google

1. Go to http://localhost:5173/login
2. Click the "Sign in with Google" button
3. Select your Google account
4. You should be redirected to the diagnosis page
5. Your profile picture and name should appear in the navbar

### Test Sign-up with Google

1. Go to http://localhost:5173/register
2. Click the "Sign up with Google" button
3. Select your Google account
4. You should be redirected to the diagnosis page

## How It Works

### Frontend Flow

1. **Login/Register Pages**: Use `@react-oauth/google` library to render Google Sign-in button
2. **JWT Decoding**: Google returns a JWT token which is decoded using `jwt-decode`
3. **Auth Context**: User data (name, email, picture) is stored in React Context
4. **Persistence**: User data is saved to localStorage for session persistence
5. **Redirect**: After successful login, user is redirected to `/diagnosis` page

### User Data Stored

```typescript
interface User {
  name: string;        // User's full name
  email: string;       // User's email
  picture?: string;    // User's profile picture URL
  provider?: "google" | "email";  // Authentication provider
}
```

## Files Modified

- `artifacts/medagent/package.json` - Added `@react-oauth/google` and `jwt-decode`
- `artifacts/medagent/src/App.tsx` - Wrapped app with `GoogleOAuthProvider`
- `artifacts/medagent/src/lib/auth.tsx` - Added `loginWithGoogle` method
- `artifacts/medagent/src/pages/Login.tsx` - Added Google Sign-in button
- `artifacts/medagent/src/pages/Register.tsx` - Added Google Sign-up button
- `artifacts/medagent/.env` - Added `VITE_GOOGLE_CLIENT_ID` variable
- `artifacts/medagent/.env.example` - Created example env file

## Troubleshooting

### "Failed to load Google Sign-in"
- Check that `VITE_GOOGLE_CLIENT_ID` is set correctly in `.env`
- Verify that `http://localhost:5173` is added to authorized JavaScript origins in Google Cloud Console

### "Invalid Client ID"
- Make sure you copied the entire Client ID from Google Cloud Console
- Check for extra spaces or characters

### User not redirected after login
- Check browser console for errors
- Verify that the auth context is properly wrapping the app

### Profile picture not showing
- Some Google accounts may not have a profile picture
- The app gracefully handles missing pictures

## Production Deployment

Before deploying to production:

1. Add your production domain to Google Cloud Console:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com`

2. Update `.env` in production with your production Client ID

3. Test thoroughly in a staging environment

## Security Notes

- Google tokens are decoded on the client side (no backend verification in this implementation)
- For production, consider adding backend verification of Google tokens
- User data is stored in localStorage - consider using secure cookies for sensitive data
- Always use HTTPS in production

## Support

For issues with Google OAuth setup, refer to:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
