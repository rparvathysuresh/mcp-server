#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from './server';
import { config } from './config';

const app = express();
app.use(cors());

const mcpServer = createServer();
let transport: SSEServerTransport;

app.get('/sse', async (req, res) => {
  console.log('Received connection on /sse');
  transport = new SSEServerTransport('/message', res);
  await mcpServer.connect(transport);
});

app.post('/message', async (req, res) => {
  if (!transport) {
    res.status(400).send('SSE connection not established');
    return;
  }
  await transport.handlePostMessage(req, res);
});

const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Google Workspace MCP server running on http://localhost:${PORT}/sse`);
});
