# Google Workspace MCP Server

This is a Model Context Protocol (MCP) server that provides AI agents with tools to interact with Google Workspace services (Gmail and Google Docs).

## Available Tools

- `send_email`: Send an email via Gmail (supports multiple recipients, CC, BCC, plain-text and HTML).
- `append_google_doc`: Append text to an existing Google Document.

## Setup Instructions

### 1. Configure Environment Variables

Rename `.env.example` to `.env` and fill in your Google Cloud credentials.

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
PORT=3000
TOKEN_PATH=tokens.json
```

### 2. Generate Authentication Tokens

Before starting the MCP server, you must grant it access to your Google account. Run the authentication script:

```bash
npm run auth
```

1. Click the link printed in your terminal.
2. Sign in with your Google account.
3. Grant the required permissions for Gmail and Google Docs.
4. The script will automatically generate `tokens.json` in your workspace.

### 3. Build the Server

Compile the TypeScript code:

```bash
npm run build
```

### 4. Connect to an MCP Client (e.g., Claude Desktop)

To use this server with Claude Desktop or another MCP client, configure the client to run the compiled `index.js` file. Add the following to your MCP client configuration file (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/build/index.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "your_client_id",
        "GOOGLE_CLIENT_SECRET": "your_client_secret",
        "GOOGLE_REDIRECT_URI": "http://localhost:3000/oauth2callback",
        "TOKEN_PATH": "/absolute/path/to/mcp-server/tokens.json"
      }
    }
  }
}
```

*Note: Ensure the `TOKEN_PATH` environment variable in the client config points to the absolute path of your generated `tokens.json` file.*
