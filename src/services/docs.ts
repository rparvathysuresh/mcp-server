import { google } from 'googleapis';
import { getAuthenticatedClient } from '../auth/oauth';

export interface AppendDocOptions {
  documentId: string;
  content: string;
}

export const appendGoogleDoc = async (options: AppendDocOptions) => {
  const auth = await getAuthenticatedClient();
  const docs = google.docs({ version: 'v1', auth });

  // First, get the document to find the end index
  const doc = await docs.documents.get({
    documentId: options.documentId,
  });

  const body = doc.data.body?.content;
  if (!body) {
    throw new Error('Document body not found.');
  }

  // The last element in the body content array is the end of the document
  const lastElement = body[body.length - 1];
  let endIndex = lastElement.endIndex;

  if (typeof endIndex !== 'number') {
    // Fallback if endIndex is not found, although it should always be present
    endIndex = 1;
  }

  // The very last index is usually a newline that cannot be inserted after.
  // We insert at endIndex - 1
  const insertionIndex = Math.max(1, endIndex - 1);

  // Prepare the content, ensuring it starts with a newline if it's appending
  const textToInsert = `\n${options.content}\n`;

  const response = await docs.documents.batchUpdate({
    documentId: options.documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: {
              index: insertionIndex,
            },
            text: textToInsert,
          },
        },
      ],
    },
  });

  return {
    documentId: response.data.documentId,
    replies: response.data.replies,
    charactersAdded: textToInsert.length,
  };
};
