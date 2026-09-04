# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the My-Work-Tracking project.

## Workflows

### 1. Cloud Run Deploy (`cloud-run-deploy.yml`)
**Trigger**: Push to `main` branch or manual trigger

**What it does**:
- Authenticates to Google Cloud using Workload Identity Federation
- Builds Docker image
- Pushes image to Google Container Registry
- Deploys to Cloud Run
- Verifies deployment

**Required Secrets**:
- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `WIF_PROVIDER`: Workload Identity Provider resource name
- `WIF_SERVICE_ACCOUNT`: Service account email

---

### 2. Test & Lint (`test-and-lint.yml`)
**Trigger**: Push to `main`/`develop` or Pull Requests

**What it does**:
- **Lint Job**: Runs ESLint and Prettier checks
- **Test Job**: Runs tests and builds TypeScript
- **Code Quality Job**: Checks for security vulnerabilities

**Required Setup**:
- Ensure `npm run lint`, `npm run format:check`, `npm run test`, and `npm run build` are configured in `package.json`

---

### 3. Build & Deploy to Vercel (`build-and-deploy-vercel.yml`)
**Trigger**: Push to `main`, Pull Requests, or manual trigger

**What it does**:
- Builds the project
- Deploys to Vercel (production on main, preview on PRs)
- Comments PR with deployment URL

**Required Secrets**:
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

**Setup Steps**:
1. Create a Vercel account and project
2. Generate a Vercel token at https://vercel.com/account/tokens
3. Add secrets to GitHub repository settings

---

### 4. Docker Build & Push (`docker-build-and-push.yml`)
**Trigger**: Push to `main`, Tags (v*), or manual trigger

**What it does**:
- Builds Docker image using Buildx
- Pushes to GitHub Container Registry (GHCR)
- Automatically tags with branch, version, and SHA
- Caches layers for faster builds

**Required Setup**:
- GHCR is automatically available with GitHub Secrets
- Permissions are configured with `GITHUB_TOKEN`

---

## Setup Instructions

### For All Workflows
1. Ensure Node.js scripts are configured in `package.json`:
   ```json
   {
     "scripts": {
       "build": "vite build",
       "test": "vitest",
       "lint": "eslint .",
       "format:check": "prettier --check ."
     }
   }
   ```

2. Create a Dockerfile in the project root if deploying to Cloud Run

### For Cloud Run Deployment
1. Set up Workload Identity Federation in Google Cloud
2. Create a service account with Cloud Run admin permissions
3. Add the required secrets to your GitHub repository

### For Vercel Deployment
1. Link your GitHub repo to Vercel
2. Generate a Vercel token
3. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` to GitHub Secrets

### For Docker Registry
- Uses GitHub Container Registry automatically
- Images are tagged and pushed to `ghcr.io/JntnCH/My-Work-Tracking`

---

## Monitoring Workflows

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select a workflow to view logs and status
4. Click on individual runs to see detailed output

## Troubleshooting

### Workflow fails on dependencies
- Check `package.json` scripts exist and are valid
- Verify Node.js version compatibility

### Deployment fails
- Verify all required secrets are set in GitHub repository settings
- Check Cloud Run/Vercel service status
- Review workflow logs for detailed error messages

### Docker push fails
- Ensure `GITHUB_TOKEN` has `packages:write` permission
- Verify GitHub Actions has permission to push to GHCR

---

## Best Practices

✅ Keep secrets secure - never commit them  
✅ Review workflow logs after each run  
✅ Test workflows in a non-production branch first  
✅ Use caching for faster builds  
✅ Monitor deployment status in respective platforms  
