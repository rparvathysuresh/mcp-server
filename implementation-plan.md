# Google Workspace MCP Server Implementation Plan

This document outlines the proposed phase-wise implementation plan for the Google Workspace Model Context Protocol (MCP) server. The server provides generic tools for AI agents to interact with Gmail and Google Docs using OAuth 2.0.

## Overview

We will build a TypeScript-based Node.js application utilizing the official `@modelcontextprotocol/sdk` and `googleapis`. The development is structured into 6 sequential phases to ensure a modular, robust, and testable system.

---

## Phase 1: Project Setup & Configuration

**Goal:** Establish the foundational project structure and configuration validation.

- **Tasks:**
  1. Initialize the Node.js project (`package.json`) and configure TypeScript (`tsconfig.json`).
  2. Install core dependencies (`@modelcontextprotocol/sdk`, `googleapis`, `zod`, `dotenv`).
  3. Set up the project directory structure (`src/config`, `src/auth`, `src/services`, `src/tools`).
  4. Create `src/config/index.ts` to define and validate environment variables (e.g., `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) using `zod`.
  5. Create a `.env.example` file.

---

## Phase 2: Authentication (OAuth 2.0)

**Goal:** Securely manage Google API authentication and automatic token refreshing.

- **Tasks:**
  1. Create `src/auth/oauth.ts` to initialize the `google.auth.OAuth2` client using the configuration.
  2. Implement logic to load saved OAuth tokens from the local file system.
  3. Create an interactive CLI script (`src/scripts/auth.ts`) to handle the initial OAuth consent flow, exchange the authorization code for tokens, and securely save the refresh token locally.

---

## Phase 3: Google API Integration Layer

**Goal:** Implement the raw business logic for interacting with Google Workspace services.

- **Tasks:**
  1. **Gmail Integration (`src/services/gmail.ts`):** 
     - Implement a function to construct RFC 2822 compliant MIME email messages (supporting to, cc, bcc, subject, and text/HTML body).
     - Wire the function to `gmail.users.messages.send`.
  2. **Google Docs Integration (`src/services/docs.ts`):**
     - Implement a function using `docs.documents.batchUpdate` to append plain text to the end of a specified Google Document ID.

---

## Phase 4: MCP Tool Layer

**Goal:** Wrap the Google API services into generic, standardized MCP tools.

- **Tasks:**
  1. **`send_email` Tool (`src/tools/sendEmail.ts`):**
     - Define the input schema using `zod` based on the problem statement requirements.
     - Implement the handler that maps the MCP request to the Gmail service and returns the expected `messageId` and `threadId`.
  2. **`append_google_doc` Tool (`src/tools/appendGoogleDoc.ts`):**
     - Define the input schema (`documentId`, `content`) using `zod`.
     - Implement the handler mapping to the Docs service, returning the success status and updated document info.

---

## Phase 5: Server Integration & Error Handling

**Goal:** Tie the tools together into a functional MCP server with comprehensive error handling.

- **Tasks:**
  1. **Server Initialization (`src/server.ts`):**
     - Instantiate the MCP `Server`.
     - Implement the `ListToolsRequestSchema` handler to advertise the available Google Workspace tools.
     - Implement the `CallToolRequestSchema` handler to route requests to the appropriate tool handlers.
  2. **Error Handling:**
     - Ensure meaningful, machine-readable MCP errors are returned for authentication failures, invalid inputs, and API rate limits.
  3. **Entry Point (`src/index.ts`):**
     - Set up the Stdout/Stdin transport for the MCP server.

---

## Phase 6: Testing & Documentation

**Goal:** Ensure reliability and provide clear instructions for users and AI agents.

- **Tasks:**
  1. **Documentation (`README.md`):**
     - Provide a step-by-step guide on creating Google Cloud credentials.
     - Explain how to run the initial authentication script.
     - Document how to attach the server to MCP clients (like Claude Desktop).
  2. **Testing:**
     - Execute manual end-to-end tests for the auth flow.
     - Verify tool discovery and execution via the MCP Inspector.
     - Test error cases (expired tokens, invalid document IDs).
