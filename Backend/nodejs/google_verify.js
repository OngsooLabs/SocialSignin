const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

async function verifyGoogleToken(token, isWebGL = false) {
    try {
        if (isWebGL) {
            // 1. WebGL: Verify Access Token via Google's tokeninfo API
            const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
            if (response.data.aud !== CLIENT_ID) throw new Error('Audience mismatch');
            return { uid: response.data.sub, email: response.data.email };
        } else {
            // 2. Mobile/PC: Verify ID Token (JWT)
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