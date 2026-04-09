# Steam Sign-In Integration Guide

This guide covers the end-to-end setup for Steam Sign-In, including Steamworks Partner Site configuration, Unity client setup using Facepunch.Steamworks, and backend ticket verification.

---

## 1. Steamworks Portal Setup

To implement Steam Sign-In in a production environment, you must have an active Steamworks developer account. For development and testing, you can use the public App ID `480` (Spacewar).

### A. App ID & Web API Key
* Log in to the **Steamworks Partner Site**.
* Ensure you have your game's **App ID** ready.
* Navigate to your group/user permissions and generate a **Web API Key**. This key is strictly for your backend server and **MUST NEVER** be included in your Unity client build.

---

## 2. Unity Client Configuration

This plugin natively supports Steam Sign-In for Standalone PC builds (Windows, macOS, Linux). Mobile and WebGL are unsupported.

### A. GameObject Naming & Update Loop (CRITICAL)
You **MUST** ensure the GameObject hosting the script is named exactly **SteamSigninManager**. Furthermore, Steam requires a continuous loop to process network callbacks.

```csharp
// C# Example: Ensure this runs every frame inside your SteamSigninManager
void Update()
{
    if (Steamworks.SteamClient.IsValid)
    {
        Steamworks.SteamClient.RunCallbacks();
    }
}
```

### B. Client Initialization
1. Create a `steam_appid.txt` file in your Unity project's root folder (outside `Assets`) containing only your App ID (e.g., `480`).
2. Create a `SteamAuthSettings` file in your `Resources` folder and enter your App ID.

```csharp
// C# Example
using osl.social.signin.steam;

// Ensure Steam Client is running in the background before calling Init()
private ISignin steamSignin;

void Start()
{
    steamSignin = new SteamSignin();
    steamSignin.Init(); 
}
```

---

## 3. Backend Token Verification (Node.js)

The Session Ticket (returned as a Hex string) upon a successful sign-in from the Unity client must be verified on your server using the Steam Web API. 

### Prerequisites
Run the following command in your Node.js environment:

```bash
npm install axios
```

### Verification Logic (steam_verify.js)
The verification process calls the `ISteamUserAuth/AuthenticateUserTicket` endpoint to validate the ticket and retrieve the user's Steam ID.

```javascript
// Javascript Example
const { verifySteamTicket } = require('./steam_verify');

const ticketFromUnity = "140000000A0... (Hex String)";

verifySteamTicket(ticketFromUnity).then(user => {
    if (user) {
        console.log("Verified Steam ID:", user.steamId);
        console.log("VAC Banned:", user.vacBanned);
    } else {
        console.log("Invalid or Expired Ticket");
    }
});
```

---

## 4. Troubleshooting

* **Initialization Failed (SteamClient is invalid):** The Steam Client application is not running in the background, or no user is logged in. Steam Sign-In requires the active desktop client to function.
* **DLLNotFoundException (steam_api64.dll):** Unity cannot find the native C++ library. Ensure `steam_api64.dll` is in the `Assets/Plugins/Steam/` folder, and the Inspector settings are checked for `Editor` and `Standalone` (x86_64). Restart Unity if necessary.
* **Error 11 / Invalid Ticket (Server Error):** The generated Session Ticket was either already consumed, expired, or the Web API Key used on the server does not have permissions for the specified App ID.