import { google } from 'googleapis';
import fs from 'fs/promises';
import { config } from '../config';

export const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_REDIRECT_URI
  );
};

export const loadSavedToken = async () => {
  if (process.env.GOOGLE_TOKENS_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_TOKENS_JSON);
    } catch (e) {
      console.warn("Failed to parse GOOGLE_TOKENS_JSON environment variable.");
    }
  }

  try {
    const tokenContent = await fs.readFile(config.TOKEN_PATH, 'utf-8');
    return JSON.parse(tokenContent);
  } catch (error) {
    return null;
  }
};

export const getAuthenticatedClient = async () => {
  const oauth2Client = createOAuth2Client();
  const token = await loadSavedToken();
  
  if (!token) {
    throw new Error(`Authentication required. No token found at ${config.TOKEN_PATH}. Please run the auth script.`);
  }

  oauth2Client.setCredentials(token);
  return oauth2Client;
};
