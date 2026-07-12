import { google } from 'googleapis';
import { getAuthenticatedClient } from '../auth/oauth';

export interface SendEmailOptions {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
}

export const sendEmail = async (options: SendEmailOptions) => {
  const auth = await getAuthenticatedClient();
  const gmail = google.gmail({ version: 'v1', auth });

  // Construct MIME email
  const headers = [
    `To: ${options.to.join(', ')}`,
    options.cc && options.cc.length > 0 ? `Cc: ${options.cc.join(', ')}` : '',
    options.bcc && options.bcc.length > 0 ? `Bcc: ${options.bcc.join(', ')}` : '',
    `Subject: =?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    options.isHtml ? 'Content-Type: text/html; charset="UTF-8"' : 'Content-Type: text/plain; charset="UTF-8"',
  ].filter(Boolean);

  const messageParts = [
    ...headers,
    '', // Empty line separates headers and body
    options.body
  ];

  const message = messageParts.join('\r\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  return response.data;
};
