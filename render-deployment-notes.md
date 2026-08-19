# Render Deployment Notes

## Official documentation

- Blueprint reference: https://render.com/docs/blueprint-spec
  - A Blueprint file is named `render.yaml` by default and lives at the repository root.
  - A Node web service uses `type: web`, `runtime: node`, `buildCommand`, `startCommand`, and optional `healthCheckPath`.
  - Secret values should not be committed to `render.yaml`; use `sync: false` and enter values in the Render Dashboard.
- Environment variables: https://render.com/docs/configure-environment-variables
  - Render injects environment variables at build/runtime and supports adding them in the Dashboard or via Blueprint placeholders.
  - Secret credentials must be configured in Render rather than committed to source.

## Local verification

- `npm run build` succeeded with the existing default Nitro target.
- `npm run build:render` succeeded with `NITRO_PRESET=node-server`.
- The production start command was tested with `PORT=10000 NODE_ENV=production npm run start:render`.
- The current production artifact was rebuilt with `npm run build:render`, verified by `scripts/verify-render-build.mjs`, and started successfully with `NODE_ENV=production PORT=10001 npm run start:render`. Local smoke tests returned the Login page at `/auth`, the controlled OAuth callback page at `/auth/callback`, and the Guest work tracker at `/` without an SSR 500.
- OAuth deployment requirement: add the deployed site URL plus `/auth/callback` to Supabase Authentication → URL Configuration → Redirect URLs. The GitHub OAuth App callback remains the Supabase Provider callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`), not the website route.
