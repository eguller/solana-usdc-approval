# Solana USDC Approval Manager

A React application for managing USDC token approvals on Solana with support for multiple wallets (Phantom and Coinbase Wallet).

## Features

- **Multi-Wallet Support**: Automatically detects and supports both Phantom and Coinbase Wallet
- **Network Switching**: Seamlessly switch between Solana Mainnet and Devnet
- **Token Approvals**: Approve delegate addresses to spend USDC on your behalf
- **Revoke Approvals**: Revoke all existing USDC approvals
- **Real-time Transaction Status**: Track transaction confirmations with links to Solana Explorer
- **Beautiful UI**: Purple gradient design with responsive layout

## Prerequisites

- **Node.js v16, v18, or v20** (recommended for best compatibility with react-scripts 5.0.1)
  - If you have Node.js v24+, you may encounter build tooling issues
  - Use [nvm](https://github.com/nvm-sh/nvm) to switch Node versions: `nvm install 18 && nvm use 18`
- npm or yarn
- A Solana wallet extension installed:
  - [Phantom Wallet](https://phantom.app/)
  - [Coinbase Wallet](https://www.coinbase.com/wallet)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solana-usdc-approval
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```
Note: The `--legacy-peer-deps` flag is required for compatibility between Solana libraries and React 18.

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

**Troubleshooting**: If you encounter build errors with Node.js v24+, switch to Node.js v18:
```bash
nvm install 18
nvm use 18
npm install --legacy-peer-deps
npm start
```

## Usage

1. **Select Network**: Choose between Mainnet or Devnet at the top of the page
2. **Connect Wallet**: Click the connect button and approve the connection in your wallet
3. **Approve Delegation**:
   - Enter the delegate address (the wallet that will be allowed to spend your USDC)
   - Enter the amount of USDC to approve
   - Click "Approve" and confirm the transaction in your wallet
4. **Revoke Approvals**: Click "Revoke All Approvals" to remove all existing approvals

## Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` directory.

## Deploying to GitHub Pages

1. Update the `homepage` field in `package.json` with your repository URL
2. Run the deploy command:

```bash
npm run deploy
```

## Technology Stack

- **React 18**: UI framework
- **@solana/web3.js**: Solana blockchain interaction
- **@solana/spl-token**: SPL token operations
- **React Scripts**: Build tooling

## USDC Token Addresses

- **Mainnet**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **Devnet**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

## Security Notes

- Always verify the delegate address before approving
- Only approve amounts you're comfortable delegating
- Revoke approvals when they're no longer needed
- Test on Devnet first before using Mainnet

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue on the GitHub repository.
