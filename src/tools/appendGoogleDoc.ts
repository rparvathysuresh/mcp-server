import { z } from 'zod';
import { appendGoogleDoc as docsAppendDoc, AppendDocOptions } from '../services/docs';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export const AppendGoogleDocSchema = z.object({
  documentId: z.string().min(1),
  content: z.string().min(1),
});

export const handleAppendGoogleDoc = async (args: unknown) => {
  try {
    const options = AppendGoogleDocSchema.parse(args) as AppendDocOptions;
    const response = await docsAppendDoc(options);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            documentId: response.documentId,
            charactersAdded: response.charactersAdded,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid arguments for append_google_doc: ${error.message}`
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to append to Google Doc: ${errorMessage}`
    );
  }
};
