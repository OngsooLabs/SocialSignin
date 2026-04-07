// apple_verify.js

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Client setup to fetch Apple's Public Keys
const client = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys'
});

// Function to return the appropriate Apple public key using the 'kid' from the JWT header
function getApplePublicKey(header, callback) {
    client.getSigningKey(header.kid, function(err, key) {
        if (err) {
            callback(err, null);
            return;
        }
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

/**
 * Verifies the Apple ID Token received from the Unity client.
 * @param {string} idToken - The JWT token received from Unity
 * @param {string} bundleId - The iOS App's Bundle Identifier (e.g., com.yourcompany.game)
 */
async function verifyAppleToken(idToken, bundleId) {
    return new Promise((resolve) => {
        jwt.verify(idToken, getApplePublicKey, {
            algorithms: ['RS256'],
            issuer: 'https://appleid.apple.com',
            audience: bundleId // CRITICAL: Verify that the token's recipient matches your app (Bundle ID)
        }, (err, decoded) => {
            if (err) {
                console.error('Apple Token Verification failed:', err.message);
                resolve(null);
            } else {
                // Verification successful. Return the unique identifier (sub) and email from the payload
                resolve({ uid: decoded.sub, email: decoded.email });
            }
        });
    });
}

module.exports = { verifyAppleToken };