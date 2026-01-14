# RPC Endpoint Setup

## Important Security Note

⚠️ **Even with this setup, your API key will still be visible in the built JavaScript bundle** because React is a frontend framework that embeds environment variables at build time. Anyone can view the source in DevTools.

**This approach helps:**
- ✓ Keep API key out of source code repository
- ✓ Easier to rotate keys without code changes
- ✓ Separate keys for local dev vs production

**For real security:**
- Use domain restrictions on your RPC provider dashboard
- Limit the API key to only work on `yourusername.github.io`
- Monitor usage and set up alerts

## Setup Instructions

### 1. Get a Free RPC API Key

Choose one provider (all have generous free tiers):

- **Helius**: https://www.helius.dev/ (100k requests/day free)
- **QuickNode**: https://www.quicknode.com/
- **Alchemy**: https://www.alchemy.com/ (300M compute units/month)

Sign up and get your RPC endpoint URL with API key, example:
```
https://mainnet.helius-rpc.com/?api-key=abc123-your-key-here
```

### 2. Local Development Setup

Add your RPC endpoint to `.env.local`:

```bash
REACT_APP_SOLANA_RPC_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY_HERE
REACT_APP_SOLANA_RPC_DEVNET=https://api.devnet.solana.com
```

This file is gitignored and works for both `npm start` (development) and `npm run build` (production builds).

### 3. GitHub Actions Setup

Add your API keys as GitHub Secrets:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:

   **Secret 1:**
   - Name: `SOLANA_RPC_MAINNET`
   - Value: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY_HERE`

   **Secret 2:**
   - Name: `SOLANA_RPC_DEVNET`
   - Value: `https://api.devnet.solana.com`

5. Click **Add secret**

### 4. Enable Domain Restrictions (Recommended)

In your RPC provider dashboard (Helius/QuickNode/Alchemy):

1. Find your API key settings
2. Add allowed domains/origins:
   - `https://yourusername.github.io`
   - `http://localhost:3000` (for local testing)
3. Save changes

Now even if someone finds your API key in the JavaScript, they can't use it from other domains.

### 5. Test

**Local build:**
```bash
npm run build
npm install -g serve
serve -s build
```

**Production:**
- Commit and push to trigger GitHub Actions
- Check the Actions tab to see the build with your secret RPC endpoint
- Your deployed app will use the RPC endpoint from GitHub Secrets

## Fallback Behavior

If no API key is configured, the app falls back to:
- Mainnet: `https://api.mainnet.solana.com` (public, rate-limited)
- Devnet: `https://api.devnet.solana.com` (public)

## Rotating Keys

To rotate your API key:
1. Generate new key in RPC provider dashboard
2. Update `.env.production.local` locally
3. Update GitHub Secrets in repository settings
4. No code changes needed!
