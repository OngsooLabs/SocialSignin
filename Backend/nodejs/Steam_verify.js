const axios = require('axios');

// Web API Key issued from the Steamworks Partner site (MUST NOT be exposed to the client)
const STEAM_WEB_API_KEY = 'YOUR_STEAM_WEB_API_KEY'; 
const APP_ID = 480; // App ID currently being tested

/**
 * Verifies the Steam Session Ticket (Hex string) received from the Unity client.
 * @param {string} ticketHexString - The ticket string sent from Unity
 * @returns {object|null} - Returns the user's Steam ID on success, or null on failure
 */
async function verifySteamTicket(ticketHexString) {
    try {
        // Request ticket verification via Steam official Web API
        const response = await axios.get('https://api.steampowered.com/ISteamUserAuth/AuthenticateUserTicket/v1/', {
            params: {
                key: STEAM_WEB_API_KEY,
                appid: APP_ID,
                ticket: ticketHexString
            }
        });

        const responseData = response.data.response;

        // If there is an error (ticket expired, forged, canceled, etc.)
        if (responseData.error) {
            throw new Error(`Steam API Error: ${responseData.error.errordesc}`);
        }

        const params = responseData.params;

        // Verification successful (result === 'OK')
        if (params && params.result === 'OK') {
            console.log('Steam Ticket Verified Successfully!');
            return {
                steamId: params.steamid,               // User's unique Steam ID
                ownerSteamId: params.ownersteamid,     // Game owner's Steam ID (for Family Sharing verification)
                vacBanned: params.vacbanned,           // VAC ban status
                publisherBanned: params.publisherbanned // Publisher ban status
            };
        } else {
            throw new Error('Unknown Steam API response format.');
        }

    } catch (error) {
        console.error('Steam verification failed:', error.message);
        return null;
    }
}

// Usage example
// const unityTicket = "140000000A0... (Hex string generated from Unity)";
// verifySteamTicket(unityTicket).then(user => console.log(user));