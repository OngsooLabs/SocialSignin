const axios = require('axios');

const APP_ID = 'YOUR_FACEBOOK_APP_ID';
const APP_SECRET = 'YOUR_FACEBOOK_APP_SECRET'; // Required to verify tokens securely on the backend

/**
 * Verifies a Facebook Access Token using the Facebook Graph API.
 * Facebook uses Access Tokens consistently across all platforms (Android, iOS, WebGL),
 * so platform-specific branching is not required.
 * * @param {string} accessToken - The Access Token received from the Unity client
 * @returns {object|null} - Returns user data if valid, or null if verification fails
 */
async function verifyFacebookToken(accessToken) {
    try {
        // 1. Construct the App Access Token (AppID|AppSecret)
        const appAccessToken = `${APP_ID}|${APP_SECRET}`;

        // 2. Verify the client token using the debug_token endpoint
        const debugResponse = await axios.get(`https://graph.facebook.com/debug_token`, {
            params: {
                input_token: accessToken,
                access_token: appAccessToken
            }
        });

        const tokenData = debugResponse.data.data;

        // 3. Validate the App ID (Audience match) and Token validity
        if (tokenData.app_id !== APP_ID) {
            throw new Error('App ID mismatch (Audience invalid)');
        }
        if (!tokenData.is_valid) {
            throw new Error('Token is invalid or expired');
        }

        // 4. (Optional) Fetch the user's profile information using the validated token
        const profileResponse = await axios.get(`https://graph.facebook.com/me`, {
            params: {
                fields: 'id,name,email',
                access_token: accessToken
            }
        });

        return { 
            uid: profileResponse.data.id, 
            email: profileResponse.data.email,
            name: profileResponse.data.name
        };

    } catch (error) {
        // Log the exact API error message if available, otherwise fallback to the generic message
        const errorMessage = error.response?.data?.error?.message || error.message;
        console.error('Facebook verification failed:', errorMessage);
        return null;
    }
}