# Apple Sign-In Integration Guide

This guide covers the end-to-end setup for Apple Sign-In, including Apple Developer Console configuration, Unity client setup, and backend token verification.

---

## 1. Apple Developer Portal Setup

To implement Apple Sign-In, you must have an active Apple Developer account and grant the necessary capabilities to your App ID.

### A. App ID & Capabilities
* Navigate to **Certificates, Identifiers & Profiles** in the Apple Developer Portal and select **Identifiers**.
* Create or select the App ID that exactly matches your Unity project's Bundle Identifier.
* Scroll down the **Capabilities** list, check **Sign In with Apple**, and save the configuration.

---

## 2. Unity Client Configuration

This plugin strictly supports native Apple Sign-In for the iOS environment.

### A. GameObject Naming (CRITICAL)
The iOS native bridge uses UnitySendMessage to route callbacks to C#. You **MUST** ensure that the GameObject hosting the script in your Unity Hierarchy is named exactly **AppleSigninManager**.

### B. Client Initialization
Use AppleSigninManager.cs to initialize the plugin. The Client ID must be your app's Bundle Identifier.

// C# Example
#if UNITY_IOS
    // Must exactly match the Bundle Identifier registered in Apple Developer Portal.
    private const string CLIENT_ID = "com.yourcompany.yourgame";
#else
    private const string CLIENT_ID = "";
#endif

---

## 3. Backend Token Verification (Node.js)

The idToken returned upon a successful sign-in from the Unity client is a JWT (JSON Web Token). For security reasons, you must verify this token's signature on your server using Apple's public keys.

### Prerequisites
Run the following command in your Node.js environment:

npm install jsonwebtoken jwks-rsa

### Verification Logic (apple_verify.js)
The verification process fetches Apple's public keys from https://appleid.apple.com/auth/keys and validates the signature and audience.

// Javascript Example
const { verifyAppleToken } = require('./apple_verify');

const tokenFromUnity = "eyAidHlw... (JWT String)";
const BUNDLE_ID = "com.yourcompany.yourgame";

verifyAppleToken(tokenFromUnity, BUNDLE_ID).then(user => {
    if (user) {
        console.log("Verified UID:", user.uid);
    } else {
        console.log("Invalid Token");
    }
});

---

## 4. Troubleshooting

* 1000: Authorization failed - The "Sign In with Apple" capability is not enabled for your App ID in the Apple Developer Portal.
* Silently Failed (No Callback) - The GameObject name does not match. Ensure the script is attached to a GameObject named exactly AppleSigninManager.
* audience invalid (Server Error) - The audience value used during server verification does not match your App's Bundle ID.
* Missing Email - Apple only provides the user's email address on the very first successful sign-in. For subsequent logins, you must identify the user using the UID (sub) only.