import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { handleSendEmail, handleAppendGoogleDoc } from './tools';

export const createServer = () => {
  const server = new Server(
    {
      name: 'google-workspace-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'send_email',
          description: 'Send an email using Gmail',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'array', items: { type: 'string' } },
              cc: { type: 'array', items: { type: 'string' } },
              bcc: { type: 'array', items: { type: 'string' } },
              subject: { type: 'string' },
              body: { type: 'string' },
              isHtml: { type: 'boolean' },
            },
            required: ['to', 'subject', 'body'],
          },
        },
        {
          name: 'append_google_doc',
          description: 'Append content to an existing Google Document',
          inputSchema: {
            type: 'object',
            properties: {
              documentId: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['documentId', 'content'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case 'send_email':
        return await handleSendEmail(request.params.arguments);
      case 'append_google_doc':
        return await handleAppendGoogleDoc(request.params.arguments);
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
    }
  });

  return server;
};
