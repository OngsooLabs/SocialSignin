# OSL Social Signin for Unity

A lightweight, cross-platform authentication plugin for Unity supporting Google and Apple Sign-In. This repository provides client-side token generation and backend server-side verification examples essential for production environments.

## Supported Platforms

* Google: iOS, Android, WebGL, Standalone (PC)
* Apple: iOS (Native Only)

> Note: Apple Sign-In on non-iOS platforms requires complex redirect servers. For maintainability and security, non-iOS platforms are not supported for Apple Sign-In. Use Google Sign-In instead.

## Installation

1. Open the Unity Editor and navigate to Window > Package Manager.
2. Select My Assets from the top-left dropdown menu.
3. Search for "OSL Social Signin", then click Download and Import.
4. After importing, navigate to Assets > External Dependency Manager > Android Resolver > Force Resolve to fetch the required Android libraries.
5. For iOS, the included XML dependency file will automatically generate the required Podfile and configure AuthenticationServices.framework when building the Xcode project.

## Setup Guides

Proper configuration of Client IDs and App settings is mandatory. Please refer to the detailed guides below before writing any code:

* [Google Sign-In Setup Guide](./Docs/Google_Guide.md)
* [Apple Sign-In Setup Guide](./Docs/Apple_Guide.md)

## Quick Start

Use the ISignin interface for a consistent implementation across providers.

### Google Sign-In Example

    using UnityEngine;
    using osl.social.signin.core;
    using osl.social.signin.google;

    public class GoogleAuthExample : MonoBehaviour
    {
        private ISignin googleSignin;

        void Start()
        {
            googleSignin = new GoogleSignin();
            googleSignin.OnSignInSuccess += (token) => Debug.Log("Token: " + token);
            googleSignin.OnSignInFailed += (error) => Debug.LogError("Error: " + error);

            // Initialize with Client ID (Client Secret is only for PC Standalone)
            googleSignin.Init("YOUR_CLIENT_ID", "YOUR_CLIENT_SECRET");
        }

        public void Login() => googleSignin.SignIn();
    }

### Apple Sign-In Example (iOS Only)

    using UnityEngine;
    using osl.social.signin.core;
    using osl.social.signin.apple;

    public class AppleAuthExample : MonoBehaviour
    {
        private ISignin appleSignin;

        void Start()
        {
            // CRITICAL: Ensure the GameObject name exactly matches "AppleSigninManager"
            gameObject.name = "AppleSigninManager";

            appleSignin = gameObject.AddComponent<AppleSigninIOS>();
            appleSignin.OnSignInSuccess += (token) => Debug.Log("JWT: " + token);
            appleSignin.OnSignInFailed += (error) => Debug.LogError("Error: " + error);

            // Initialize with your App Bundle ID
            appleSignin.Init("com.yourcompany.yourgame");
        }

        public void Login() => appleSignin.SignIn();
    }

## Backend Token Verification

Never trust the tokens (ID Token, Access Token, JWT) sent directly from the Unity client. You must send these tokens to your backend server and verify their signatures. Relying solely on client-side authentication is a critical security risk.

* [Google Token Verification](./Backend/nodejs/google_verify.js)
* [Apple Token Verification](./Backend/nodejs/apple_verify.js)

## Important Precautions

1. GameObject Naming Convention (Apple): The iOS native bridge uses UnitySendMessage to route callbacks. You MUST attach the AppleSigninIOS component to a GameObject named exactly "AppleSigninManager".
2. Silent Sign-In (Apple): Apple requires explicit user intent (via FaceID/TouchID). Calling SilentSignIn() will automatically redirect to the standard SignIn() UI prompt.
3. User Profile Scope (Apple): Apple only provides the user's name and email on the very first successful sign-in. Subsequent sign-ins return the Identity Token only. Do not design your database to expect the email string on every login attempt.