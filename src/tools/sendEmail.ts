import { z } from 'zod';
import { sendEmail as gmailSendEmail, SendEmailOptions } from '../services/gmail';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export const SendEmailSchema = z.object({
  to: z.array(z.string().email()),
  cc: z.array(z.string().email()).optional().default([]),
  bcc: z.array(z.string().email()).optional().default([]),
  subject: z.string().min(1),
  body: z.string().min(1),
  isHtml: z.boolean().optional().default(false),
});

export const handleSendEmail = async (args: unknown) => {
  try {
    const options = SendEmailSchema.parse(args) as SendEmailOptions;
    const response = await gmailSendEmail(options);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            messageId: response.id,
            threadId: response.threadId,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid arguments for send_email: ${error.message}`
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to send email: ${errorMessage}`
    );
  }
};
