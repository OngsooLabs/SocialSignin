# OSL Social Sign-In for Unity

A lightweight, cross-platform authentication plugin for Unity supporting Google, Facebook, and Apple Sign-In. This package provides a unified, easy-to-use C# interface (`ISignin`) and utilizes `ScriptableObject` settings to eliminate hardcoded credentials.

## Supported Platforms

* **Google:** Android, iOS, WebGL, Standalone (PC / Windows)
* **Facebook:** Android, iOS, WebGL *(Standalone PC is strictly not supported due to Meta's security policies)*
* **Apple:** iOS (Native Only)

> **Note:** Apple Sign-In on non-iOS platforms requires complex redirect servers and domain verification. For security and maintainability, non-iOS platforms are not supported for Apple Sign-In.

## Features

* **No Hardcoding:** Manage all your Client IDs, App IDs, and Tokens cleanly through Unity's Inspector via `ScriptableObject` settings in the `Resources` folder.
* **Automated Builds:** Custom `PreProcessBuild` and `PostProcessBuild` scripts automatically configure your Android `AndroidManifest.xml` / `.androidlib` and iOS Xcode `Info.plist`. Zero manual configuration is required.
* **Unified Interface:** Switch between Google, Facebook, and Apple using the exact same `ISignin` methods and callbacks.

## Installation

1. Open the Unity Editor and import the "OSL Social Sign-In" package.
2. Navigate to **Assets > External Dependency Manager > Android Resolver > Force Resolve**. This is **mandatory** to fetch the required native Android SDKs (`.aar` files) for Google and Facebook.
3. For iOS, simply build your project. The included automated scripts will automatically configure `AuthenticationServices.framework`, CocoaPods dependencies, and URL Schemes.

## Setup Guides

Proper configuration of Client IDs and App settings is mandatory before writing any code.

1. Create a folder named exactly `Resources` in your Unity project.
2. Right-click inside the folder and navigate to **Create > OSL > Social** to create your settings files:
   * `Google Auth Settings`
   * `Facebook Auth Settings`
   * `Apple Auth Settings`
3. Enter your respective App IDs and Client Secrets in the Inspector.

## Quick Start

Use the `ISignin` interface for a consistent implementation across all providers.

### 1. Google Sign-In Example

```csharp
using UnityEngine;
using osl.social.signin.core;
using osl.social.signin.google;

public class GoogleAuthExample : MonoBehaviour
{
    private ISignin googleSignin;

    void Start()
    {
        // CRITICAL: Ensure the GameObject name exactly matches the native bridge target
        gameObject.name = "GoogleSigninManager";

        googleSignin = new GoogleSignin();
        googleSignin.OnSignInSuccess += (token) => Debug.Log("Google Token: " + token);
        googleSignin.OnSignInFailed += (error) => Debug.LogError("Error: " + error);

        // Automatically loads credentials from GoogleAuthSettings in the Resources folder
        googleSignin.Init();
    }

    public void Login() => googleSignin.SignIn();
}
```

### 2. Facebook Sign-In Example

```csharp
using UnityEngine;
using osl.social.signin.core;
using osl.social.signin.facebook;

public class FacebookAuthExample : MonoBehaviour
{
    private ISignin facebookSignin;

    void Start()
    {
        // CRITICAL: Ensure the GameObject name exactly matches the native bridge target
        gameObject.name = "FacebookSigninManager";

        facebookSignin = new FacebookSignin();
        facebookSignin.OnSignInSuccess += (token) => Debug.Log("Facebook Access Token: " + token);
        facebookSignin.OnSignInFailed += (error) => Debug.LogError("Error: " + error);

        // Automatically loads App ID & Client Token from FacebookAuthSettings
        facebookSignin.Init();
    }

    public void Login() => facebookSignin.SignIn();
}
```

### 3. Apple Sign-In Example (iOS Only)

```csharp
using UnityEngine;
using osl.social.signin.core;
using osl.social.signin.apple;

public class AppleAuthExample : MonoBehaviour
{
    private ISignin appleSignin;

    void Start()
    {
        // CRITICAL: Ensure the GameObject name exactly matches the native bridge target
        gameObject.name = "AppleSigninManager";

        appleSignin = new AppleSignin();
        appleSignin.OnSignInSuccess += (token) => Debug.Log("Apple JWT: " + token);
        appleSignin.OnSignInFailed += (error) => Debug.LogError("Error: " + error);

        // Automatically loads Service ID from AppleAuthSettings
        appleSignin.Init();
    }

    public void Login() => appleSignin.SignIn();
}
```

## Backend Token Verification

Never trust the tokens (ID Token, Access Token, JWT) sent directly from the Unity client. You must send these tokens to your backend server and verify their validity. Relying solely on client-side authentication is a critical security risk.

* **Google:** Verify the ID Token via `google-auth-library` or `tokeninfo` endpoint.
* **Facebook:** Verify the Access Token via Facebook's Graph API (`debug_token` endpoint).
* **Apple:** Verify the JWT signature using Apple's public keys.

## Important Precautions

1. **GameObject Naming Convention (CRITICAL):** All native bridges (Android Java, iOS `.mm`, WebGL `.jslib`) use `UnitySendMessage` to route callbacks. You **MUST** name your GameObjects exactly as expected (e.g., `GoogleSigninManager`, `FacebookSigninManager`, `AppleSigninManager`).
2. **Facebook WebGL HTTPS Requirement:** Facebook's JavaScript SDK strictly requires an `https://` secure connection. Running WebGL on a local `http://` server will result in Facebook blocking the login attempt.
3. **Apple Silent Sign-In:** Apple requires explicit user intent (via FaceID/TouchID). Calling `SilentSignIn()` will automatically redirect to the standard `SignIn()` UI prompt.
4. **Apple User Profile Scope:** Apple only provides the user's name and email on the *very first* successful sign-in. Subsequent sign-ins return the Identity Token only. Do not design your database to expect the email string on every login attempt.