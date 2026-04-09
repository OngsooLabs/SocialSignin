# Facebook Sign-In Integration Guide

This guide covers the end-to-end setup for Facebook Sign-In, including Meta Developer Console configuration, Unity client setup, and backend token verification.

---

## 1. Meta Developer Console Setup

To implement Facebook Sign-In, you must have an active Meta Developer account and configure your App for the supported platforms (Android, iOS, WebGL).

### A. App ID & Client Token
* Navigate to the **Meta for Developers** portal and create or select your App.
* Go to **App Settings > Advanced** to locate your **Client Token**. You will need this along with your **App ID**.
* In **App Settings > Basic**, add the required platforms:
  * **Android:** Enter your Google Play package name and development/release Key Hashes.
  * **iOS:** Enter your exact Unity project's Bundle ID.
  * **Website (WebGL):** Enter your secure HTTPS hosting URL (e.g., `https://your-game-website.com`).

---

## 2. Unity Client Configuration

This plugin supports Facebook Sign-In for Android, iOS, and WebGL environments. Standalone (PC) is strictly not supported due to Meta's security policies.

### A. GameObject Naming (CRITICAL)
The native bridges (Java, Objective-C++, and JavaScript) use `UnitySendMessage` to route callbacks to C#. You **MUST** ensure that the GameObject hosting the script in your Unity Hierarchy is named exactly **FacebookSigninManager**.

### B. Client Initialization
Use the `ScriptableObject` settings file for a clean configuration. Create a `FacebookAuthSettings` file in your `Resources` folder and enter your App ID and Client Token.

```csharp
// C# Example
using osl.social.signin.facebook;

// The Init() method automatically loads credentials from Resources/FacebookAuthSettings.asset
// Ensure this script is attached to a GameObject named "FacebookSigninManager"
private ISignin facebookSignin;

void Start()
{
    facebookSignin = new FacebookSignin();
    facebookSignin.Init(); 
}
```

---

## 3. Backend Token Verification (Node.js)

The Access Token returned upon a successful sign-in from the Unity client must be verified on your server using Facebook's Graph API. Relying solely on client-side authentication is a critical security risk.

### Prerequisites
Run the following command in your Node.js environment:

```bash
npm install axios
```

### Verification Logic (facebook_verify.js)
The verification process uses the `debug_token` endpoint to ensure the token is valid and matches your App ID (preventing Confused Deputy Attacks).

```javascript
// Javascript Example
const { verifyFacebookToken } = require('./facebook_verify');

const tokenFromUnity = "EAAQ... (Access Token String)";
// Note: App ID and App Secret are configured inside verifyFacebookToken

verifyFacebookToken(tokenFromUnity).then(user => {
    if (user) {
        console.log("Verified UID:", user.uid);
        console.log("User Email:", user.email);
    } else {
        console.log("Invalid Token");
    }
});
```

---

## 4. Troubleshooting

* **Invalid Key Hash (Android):** The Android app crashes or shows an error screen. Ensure your Unity debug keystore's SHA-1 hash is converted to Base64 and registered in the Meta Developer Console.
* **Facebook Login Blocked (WebGL):** The Facebook JavaScript SDK strictly requires a secure `https://` connection. Testing on a local `http://` server will block the login.
* **Silently Failed (No Callback):** The GameObject name does not match. Ensure the script is attached to a GameObject named exactly `FacebookSigninManager`.