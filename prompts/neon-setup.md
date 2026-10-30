# Implementation Prompt: Neon Organization and Project Setup

## Objective
Set up the Neon organization **DENNIS** (`org-rapid-frost-03481699`) for the **Fancy Atelier Parfums** project following the instructions outlined in `https://neon.com/get-started/prompt.md`.

---

## Proposed Changes & Execution Plan

### 1. CLI Installation & Verification
- Check if the Neon CLI is installed using `neon --version`.
- If missing, install globally using:
  ```powershell
  npm i -g neon
  ```
- Verify CLI installation and path availability.

### 2. Authentication
- Run `neon login` (`neon auth`) to launch the browser authentication flow for the user.
- Await confirmation of authenticated session linked to organization **DENNIS** (`org-rapid-frost-03481699`).

### 3. Neon Project Initialization
- Run the initialization command targeting Antigravity agent configuration under the designated organization:
  ```powershell
  neon init -y --agent antigravity --region-id aws-us-east-1 --project-name fancy-atelier-parfums
  ```
  *(Defaulting to `aws-us-east-1` as the primary cloud region)*.
- Populate environment variables for database connectivity.
- Verify generated skills and MCP server registrations without breaking the project's existing Supabase foundation.

### 4. Verification & Validation
- Verify the newly created/linked project in the Neon console.
- Confirm environment variables in `.env` / `.env.local` are cleanly separated from existing Supabase configuration.
- Validate that the existing Express API server and Vite storefront remain operational.

---

## Acceptance Criteria
- [ ] Neon CLI installed and authenticated.
- [ ] Neon project created or linked under organization `org-rapid-frost-03481699`.
- [ ] Project environment variables and agent configurations installed.
- [ ] Existing project integrity preserved.
