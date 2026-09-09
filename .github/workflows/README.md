# GitHub Actions Workflows

This directory contains automated deployment workflows for the My-Work-Tracking application.

## Cloud Run Deployment (`cloud-run-deploy.yml`)

Automatically builds and deploys the application to Google Cloud Run on every push to `main` or manual trigger via workflow_dispatch.

### Required Setup

Before using this workflow, you need to configure the following in your GitHub repository:

#### 1. GitHub Variables (Public)
Set these in **Settings → Secrets and variables → Variables**:

- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `GCP_REGION`: Cloud Run region (e.g., `asia-southeast1`)
- `CLOUD_RUN_SERVICE`: Name of your Cloud Run service
- `GAR_REPOSITORY`: Artifact Registry repository name (e.g., `docker-registry`)
- `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT`: Service account email for runtime
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase measurement ID
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket

#### 2. GitHub Secrets (Private)
Set these in **Settings → Secrets and variables → Secrets**:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`: Workload Identity Provider resource name
- `GCP_SERVICE_ACCOUNT`: Service account email for deployment
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_LINE_LIFF_ID`: LINE LIFF ID

### Google Cloud Setup

#### Prerequisites
1. Create a GCP project
2. Enable required APIs:
   ```bash
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable iap.googleapis.com
   gcloud services enable iam.googleapis.com
   ```

3. Create Artifact Registry repository:
   ```bash
   gcloud artifacts repositories create docker-registry \
     --repository-format=docker \
     --location=asia-southeast1
   ```

4. Create Cloud Run service account:
   ```bash
   gcloud iam service-accounts create cloud-run-runtime \
     --display-name="Cloud Run Runtime Account"
   ```

5. Grant required permissions to runtime service account:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member=serviceAccount:cloud-run-runtime@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --role=roles/secretmanager.secretAccessor
   ```

#### Workload Identity Federation Setup

1. Create Workload Identity Pool:
   ```bash
   gcloud iam workload-identity-pools create "github-pool" \
     --project=YOUR_PROJECT_ID \
     --location=global \
     --display-name="GitHub Actions Pool"
   ```

2. Create Workload Identity Provider:
   ```bash
   gcloud iam workload-identity-pools providers create-oidc "github-provider" \
     --project=YOUR_PROJECT_ID \
     --location=global \
     --workload-identity-pool="github-pool" \
     --display-name="GitHub Provider" \
     --attribute-mapping="google.subject=assertion.sub,assertion.aud=assertion.aud" \
     --issuer-uri="https://token.actions.githubusercontent.com" \
     --attribute-condition="assertion.aud == 'https://github.com/JntnCH/My-Work-Tracking'"
   ```

3. Create service account for deployment:
   ```bash
   gcloud iam service-accounts create github-actions-deploy \
     --display-name="GitHub Actions Deployment Account"
   ```

4. Grant permissions to deployment service account:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member=serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --role=roles/artifactregistry.writer

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member=serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --role=roles/run.admin

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member=serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --role=roles/iam.serviceAccountUser
   ```

5. Set up Workload Identity binding:
   ```bash
   gcloud iam service-accounts add-iam-policy-binding \
     github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --project=YOUR_PROJECT_ID \
     --role=roles/iam.workloadIdentityUser \
     --member="principalSet://iam.googleapis.com/projects/YOUR_PROJECT_NUMBER/locations/global/workforcePools/github-pool/providers/github-provider/attributes.sub:repo:JntnCH/My-Work-Tracking:ref:refs/heads/main"
   ```

6. Get the Workload Identity Provider resource name:
   ```bash
   gcloud iam workload-identity-pools providers describe github-provider \
     --project=YOUR_PROJECT_ID \
     --location=global \
     --workload-identity-pool=github-pool \
     --format="value(name)"
   ```
   This will output something like: `projects/YOUR_PROJECT_NUMBER/locations/global/workforcePools/github-pool/providers/github-provider`

#### Google Secret Manager Setup (Optional)

Store sensitive runtime secrets:
```bash
echo -n "your-supabase-url" | gcloud secrets create SUPABASE_URL --data-file=-
echo -n "your-service-role-key" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
```

Grant access to runtime service account:
```bash
gcloud secrets add-iam-policy-binding SUPABASE_URL \
  --member=serviceAccount:cloud-run-runtime@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

### Workflow Triggers

- **Automatic**: Deploys on every push to `main` branch
- **Manual**: Use `workflow_dispatch` in GitHub Actions tab to trigger deployment with environment selection

### Monitoring

After deployment, check:
- GitHub Actions tab for workflow status
- Cloud Run console for service details and logs
- Application logs via `gcloud run logs read CLOUD_RUN_SERVICE --region GCP_REGION`

### Troubleshooting

Common issues:

1. **Authentication Failed**: Verify Workload Identity setup and that the service account has correct permissions
2. **Build Failed**: Check that all build arguments are correctly configured as GitHub Variables/Secrets
3. **Deployment Failed**: Ensure Cloud Run service exists or set up Cloud Run to auto-create services
4. **Image Push Failed**: Verify Artifact Registry permissions and repository exists
