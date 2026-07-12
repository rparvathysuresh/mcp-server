# Railway Deployment Plan for MCP Server

Deploying a Model Context Protocol (MCP) server to a cloud provider like Railway requires modifying the server to communicate over HTTP (using Server-Sent Events) rather than the standard local `stdio`. Furthermore, we need a strategy to handle OAuth tokens securely in an ephemeral cloud environment.

This document outlines the step-by-step plan to deploy the Google Workspace MCP server to Railway.

---

## Phase 1: Code Modifications for Cloud

### 1. Switch to SSE (Server-Sent Events) Transport
Currently, the server uses `StdioServerTransport`, which only works when the MCP client runs the server as a local background process. To make it accessible over the internet, we must use HTTP/SSE.

- **Dependencies**: Install `express` and `@types/express`.
- **New Entrypoint**: Create a new file (e.g., `src/server-sse.ts`) that:
  1. Initializes an Express application.
  2. Sets up a `GET /sse` endpoint using `SSEServerTransport`.
  3. Sets up a `POST /message` endpoint to handle incoming MCP RPC messages.
  4. Listens on `process.env.PORT` (Railway automatically assigns this).

### 2. Cloud-Native Token Management
Railway containers are ephemeral. If the app restarts, the locally saved `tokens.json` file will be erased unless we use a Persistent Volume.

**Recommended Approach (Environment Variables):**
Modify `src/auth/oauth.ts` to first check for an environment variable named `GOOGLE_TOKENS_JSON`. 
- Locally, you will authenticate using `npm run auth`, open `tokens.json`, and copy its contents.
- In Railway, you will paste the JSON contents into the `GOOGLE_TOKENS_JSON` environment variable.

*Alternative*: Attach a Railway Persistent Volume to the service, mount it to `/app/data`, and set `TOKEN_PATH=/app/data/tokens.json`.

---

## Phase 2: Configuration Updates

### 1. Package.json
Update the `package.json` to ensure Railway's build system (Nixpacks) knows how to start the app:
```json
"scripts": {
  "build": "tsc",
  "start": "node build/server-sse.js",
  "auth": "ts-node src/scripts/auth.ts"
}
```

### 2. Google Cloud Console
When deploying to the cloud, the OAuth redirect URI changes.
- Go to your Google Cloud Console.
- Navigate to **APIs & Services > Credentials**.
- Edit your OAuth 2.0 Client ID.
- Add your future Railway domain (e.g., `https://your-app-name.up.railway.app/oauth2callback`) to the **Authorized redirect URIs**.

---

## Phase 3: Railway Deployment Steps

1. **Push to GitHub**: Commit your codebase and push it to a GitHub repository.
2. **Create Railway Project**: 
   - Go to [Railway.app](https://railway.app/).
   - Click **New Project** > **Deploy from GitHub repo**.
   - Select your MCP server repository.
3. **Configure Environment Variables**:
   Go to the **Variables** tab in your Railway project and add:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (Set to your Railway public URL or leave as localhost if you are using the Environment Variable token passing method exclusively).
   - `GOOGLE_TOKENS_JSON` (Paste the contents of your locally generated `tokens.json` here).
4. **Deploy**: Railway will automatically detect the Node.js project, run `npm run build`, and execute `npm start`.
5. **Generate Public Domain**: Go to the **Settings** tab of your Railway service, under **Networking**, click **Generate Domain**.

---

## Phase 4: Connecting the Client

Once deployed, your MCP server will be accessible over the internet. You will need an MCP client that supports SSE (most clients, including Claude Desktop, support both `stdio` and `sse` via custom configuration or HTTP clients).

Configure your MCP client with the SSE URL:
```json
{
  "mcpServers": {
    "google-workspace-remote": {
      "type": "sse",
      "url": "https://your-app-name.up.railway.app/sse"
    }
  }
}
```
