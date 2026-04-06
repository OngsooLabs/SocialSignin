# Google Sign-In Integration Guide

This guide covers the end-to-end setup for Google Sign-In, including Google Cloud Console configuration, Unity client setup, and backend token verification.

---

## 1. Google Cloud Console Setup

To support all platforms, you must create **three distinct OAuth 2.0 Client IDs** in the [Google Cloud Console](https://console.cloud.google.com/).

### A. Android & WebGL (Web application)
* **Type**: Web application
* **Purpose**: Used for both Android (as Web Client ID) and WebGL.
* **For WebGL**: You **MUST** add your hosting URL (e.g., `https://your-game.com`) to the **Authorized JavaScript origins**.

### B. iOS (iOS application)
* **Type**: iOS
* **Bundle ID**: Must exactly match your Unity Project's Bundle Identifier.
* **Setup**: After creating, copy the `iOS Client ID` and `Reversed Client ID`.

### C. Windows / Editor (Desktop app)
* **Type**: Desktop app
* **Redirect URIs**: You **MUST** add `http://127.0.0.1:50000/` to the **Authorized redirect URIs**.

---

## 2. Unity Client Configuration

In your Unity project, use the `GoogleSigninManager.cs` to initialize the plugin with the correct IDs for each platform.

```csharp
#if UNITY_ANDROID || UNITY_WEBGL
    private const string CLIENT_ID = "YOUR_WEB_APPLICATION_CLIENT_ID.apps.googleusercontent.com";
#elif UNITY_IOS
    private const string CLIENT_ID = "YOUR_IOS_APPLICATION_CLIENT_ID.apps.googleusercontent.com";
#elif UNITY_EDITOR || UNITY_STANDALONE_WIN
    private const string CLIENT_ID = "YOUR_DESKTOP_APP_CLIENT_ID.apps.googleusercontent.com";
    private const string CLIENT_SECRET = "YOUR_DESKTOP_APP_CLIENT_SECRET";
#endif
```

---

## 3. Backend Token Verification (Node.js)


After a successful sign-in, the Unity client sends a token to your server. Your server must verify this token to ensure it is valid and intended for your app.

### Prerequisites
```bash
npm install google-auth-library axios
```

### Verification Logic (`google_verify.js`)
The verification method differs depending on whether the token is an **ID Token (JWT)** from Mobile/PC or an **Access Token** from WebGL.

```javascript
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

/**
 * Verifies the token received from Unity client.
 * @param {string} token - The token string from Unity.
 * @param {boolean} isWebGL - Set to true if the token is from a WebGL client.
 */
async function verifyGoogleToken(token, isWebGL = false) {
    try {
        if (isWebGL) {
            // 1. WebGL: Verify Access Token via Google's tokeninfo API
            const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
            
            // CRITICAL: Check if the 'aud' (Audience) matches your Client ID
            if (response.data.aud !== CLIENT_ID) {
                throw new Error('Audience mismatch! Potential security threat.');
            }
            
            return { uid: response.data.sub, email: response.data.email };
        } else {
            // 2. Mobile/PC: Verify ID Token (JWT) using Google Library
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID,
            });
            const payload = ticket.getPayload();
            
            return { uid: payload.sub, email: payload.email };
        }
    } catch (error) {
        console.error('Verification failed:', error.message);
        return null;
    }
}
```

---

## 4. Troubleshooting

| Error | Cause | Solution |
| :--- | :--- | :--- |
| `redirect_uri_mismatch` | PC Redirect URI missing | Add `http://127.0.0.1:50000/` to Desktop App settings. |
| `origin_mismatch` | WebGL Origin missing | Add your hosting URL to Web Application settings. |
| `403 disallowed_useragent` | Using Custom WebView | Ensure you are using this plugin's native/standard login flow. |
| `Status Code 10` (Android) | SHA-1 Mismatch | Register both Debug and Release SHA-1 fingerprints in Console. |