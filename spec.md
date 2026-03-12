# ClawBoard

## Current State
Full-featured mission control dashboard for OpenClaw AI agents with agents, brain, skills, cron, credits, activity, security, and controls sections. All sections are interactive with backend persistence. Light/dark mode toggle exists. No agent connection/integration system exists yet.

## Requested Changes (Diff)

### Add
- `ApiToken` type in backend: one token per app (shared secret for all agents under this ClawBoard instance)
- `AgentPing` type: incoming payload from real agents (agentId, apiToken, status, model, logs, creditsPerProvider, skillResults, cronHistory, errors, identityMd, soulMd, memoryMd, skillsList)
- Backend functions: `generateApiToken`, `getApiToken`, `revokeAndRegenerateToken`, `receiveAgentPing` (HTTP-accessible, validates token, upserts agent record, stores all ping data)
- `ConnectAgentSection` component: dedicated tab in dashboard with 4-step onboarding flow
  - Step 1: Display current API token with copy button
  - Step 2: Show pre-filled OpenClaw skill file (.md) with user's token embedded, copy + download buttons
  - Step 3: Instructions to drop skill file into agent's skills folder
  - Step 4: "Your agent will appear here automatically within 5 minutes"
- Security section enhancement: wire revoke/regenerate token button to `revokeAndRegenerateToken`

### Modify
- `App.tsx`: add "Connect Agent" nav item and section routing
- `SecuritySection.tsx`: add API token panel at top with revoke/regenerate functionality
- Backend `seedData`: also generate an initial API token if none exists

### Remove
- Nothing removed

## Implementation Plan
1. Generate new Motoko backend with ApiToken management + receiveAgentPing HTTP endpoint
2. Build ConnectAgentSection frontend component with 4-step onboarding
3. Update App.tsx to include Connect Agent nav item
4. Update SecuritySection to show API token panel with revoke/regenerate
