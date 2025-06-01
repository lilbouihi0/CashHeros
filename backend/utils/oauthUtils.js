const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

// Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Verify Google ID token
 * @param {string} idToken - The ID token to verify
 * @returns {Object} The verified user data
 */
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    return {
      oauthId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      profilePicture: payload.picture,
      verified: payload.email_verified
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};

/**
 * Exchange Google authorization code for tokens
 * @param {string} code - The authorization code
 * @returns {Object} The tokens and user data
 */
const exchangeGoogleCode = async (code) => {
  try {
    const { tokens } = await googleClient.getToken(code);
    const { id_token, access_token, refresh_token, expiry_date } = tokens;
    
    // Verify the ID token to get user data
    const userData = await verifyGoogleToken(id_token);
    
    return {
      ...userData,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiry: new Date(expiry_date)
    };
  } catch (error) {
    console.error('Error exchanging Google code:', error);
    throw new Error('Failed to exchange Google authorization code');
  }
};

/**
 * Verify Facebook access token and get user data
 * @param {string} accessToken - The access token to verify
 * @returns {Object} The verified user data
 */
const verifyFacebookToken = async (accessToken) => {
  try {
    // First, verify the token with Facebook
    const appAccessTokenResponse = await axios.get(
      `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&grant_type=client_credentials`
    );
    
    const appAccessToken = appAccessTokenResponse.data.access_token;
    
    const verifyResponse = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`
    );
    
    const { is_valid, user_id } = verifyResponse.data.data;
    
    if (!is_valid) {
      throw new Error('Invalid Facebook token');
    }
    
    // Get user data
    const userDataResponse = await axios.get(
      `https://graph.facebook.com/v13.0/${user_id}?fields=id,email,first_name,last_name,picture&access_token=${accessToken}`
    );
    
    const { id, email, first_name, last_name, picture } = userDataResponse.data;
    
    return {
      oauthId: id,
      email,
      firstName: first_name,
      lastName: last_name,
      profilePicture: picture?.data?.url,
      verified: true // Facebook verifies emails
    };
  } catch (error) {
    console.error('Error verifying Facebook token:', error);
    throw new Error('Invalid Facebook token');
  }
};

module.exports = {
  verifyGoogleToken,
  exchangeGoogleCode,
  verifyFacebookToken
};