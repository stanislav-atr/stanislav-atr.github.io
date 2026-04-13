# GitHub Pages Deployment Setup

This repository uses GitHub Actions to automatically build and deploy to GitHub Pages.

## One-Time Setup Required

Before the first deployment can succeed, you need to configure your repository settings:

### 1. Enable GitHub Pages with Actions

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages** (in the left sidebar under "Code and automation")
3. Under **Source**, select **GitHub Actions** from the dropdown
4. Click **Save** if prompted

### 2. Verify Permissions (usually automatic)

The workflow requires these permissions which are typically enabled by default:
- `contents: read` - to checkout the repository
- `pages: write` - to deploy to GitHub Pages
- `id-token: write` - for OIDC token authentication

If deployment fails with permission errors:
1. Go to **Settings** → **Actions** → **General**
2. Scroll to "Workflow permissions"
3. Ensure "Read and write permissions" is selected
4. Check "Allow GitHub Actions to create and approve pull requests" if needed

## Deployment

After the initial setup:
- **Automatic**: Every push to `main` branch triggers a deployment
- **Manual**: Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**

## Accessing the Site

Once deployed, your site will be available at:
- `https://stanislav-atr.github.io/`

## Troubleshooting

### Build Fails
- Check the Actions tab for error logs
- Ensure `npm ci` and `npm run build` work locally

### 404 After Deploy
- Verify the `build` folder contains an `index.html`
- Check that `.nojekyll` file exists in `static/` folder
- Wait a few minutes for GitHub's CDN to update

### Permission Denied
- Review step 2 above to verify workflow permissions
