import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

const configSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Google Client Secret is required"),
  GOOGLE_REDIRECT_URI: z.string().default('http://localhost:3000/oauth2callback'),
  PORT: z.string().default('3000').transform(Number), // For the auth script web server
  TOKEN_PATH: z.string().default(path.join(process.cwd(), '.google-token.json')),
});

const parseConfig = () => {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid environment variables:', error);
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseConfig();
