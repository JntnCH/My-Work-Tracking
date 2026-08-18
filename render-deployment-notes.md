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
- The Node server started, but requesting `/` returned an SSR error: `TypeError: (0, import_jsx_dev_runtime.jsxDEV) is not a function` from `RootShell` in the generated server bundle. This means Render configuration is not yet ready for delivery; the SSR dev-runtime mismatch must be fixed or the deployment must be changed to a compatible production target before asking the user to deploy.
