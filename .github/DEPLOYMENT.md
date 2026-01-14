# GitHub Pages Deployment Setup

## One-Time Setup Required

After pushing your code to GitHub, you need to configure GitHub Pages in your repository:

### Steps:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click on **Settings** (top menu)
   - Click on **Pages** (left sidebar)
   - Under "Build and deployment":
     - **Source:** Select "GitHub Actions"
   - Click **Save**

3. **Wait for deployment:**
   - Go to the **Actions** tab in your repository
   - You'll see the "Deploy to GitHub Pages" workflow running
   - Once it completes (green checkmark), your site will be live

4. **Access your site:**
   - Your site will be available at:
     - `https://<your-username>.github.io/<repository-name>/`
     - Example: `https://johndoe.github.io/solana-usdc-approval/`

## Automatic Deployments

After the initial setup, every push to the `main` branch will automatically:
- Build your React app
- Deploy to GitHub Pages
- Update your live site

## Troubleshooting

If deployment fails:
1. Check the **Actions** tab for error messages
2. Ensure the workflow has **write** permissions:
   - Go to Settings → Actions → General
   - Scroll to "Workflow permissions"
   - Select "Read and write permissions"
   - Click Save

## Manual Deployment (Alternative)

If you prefer manual deployment, you can also use:
```bash
npm run deploy
```

This uses the `gh-pages` package to deploy directly from your local machine.
