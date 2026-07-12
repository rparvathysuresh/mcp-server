import http from 'http';
import url from 'url';
import fs from 'fs/promises';
import { createOAuth2Client } from '../auth/oauth';
import { config } from '../config';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/documents'
];

async function authenticate() {
  const oauth2Client = createOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
  });

  console.log('Authorize this app by visiting this url:');
  console.log(authUrl);

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url && req.url.startsWith('/oauth2callback')) {
        const q = url.parse(req.url, true).query;
        if (q.error) {
          console.error('Error received:', q.error);
          res.end(`Error: ${q.error}`);
          server.close();
          return;
        }

        if (q.code) {
          const { tokens } = await oauth2Client.getToken(q.code as string);
          oauth2Client.setCredentials(tokens);

          await fs.writeFile(config.TOKEN_PATH, JSON.stringify(tokens));
          console.log(`Token stored to ${config.TOKEN_PATH}`);

          res.end('Authentication successful! You can close this tab.');
          server.close();
        }
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      res.end('Authentication failed. Check the console for details.');
      server.close();
    }
  });

  server.listen(config.PORT, () => {
    console.log(`Listening on http://localhost:${config.PORT}/oauth2callback for the OAuth callback...`);
  });
}

authenticate().catch(console.error);
