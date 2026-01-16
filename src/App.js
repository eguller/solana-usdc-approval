import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createApproveInstruction,
  createRevokeInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import './App.css';

const USDC_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDC_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

// Max u64 value for unlimited approval (2^64-1 in base units, displayed with 6 decimals)
const MAX_U64_USDC = '18446744073709.551615';

// RPC endpoints - uses environment variable for custom RPC or falls back to public endpoint
const RPC_ENDPOINTS = {
  mainnet: process.env.REACT_APP_SOLANA_RPC_MAINNET || 'https://api.mainnet.solana.com',
  devnet: process.env.REACT_APP_SOLANA_RPC_DEVNET || 'https://api.devnet.solana.com'
};

function App() {
  const [availableWallets, setAvailableWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [network, setNetwork] = useState('mainnet');
  const [connection, setConnection] = useState(null);
  const [delegateAddress, setDelegateAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    detectWallets();
    updateConnection('mainnet');
  }, []);

  const detectWallets = () => {
    const wallets = [];

    if (window.coinbaseSolana) {
      wallets.push({
        name: 'Coinbase Wallet',
        wallet: window.coinbaseSolana,
        icon: '🔵'
      });
    }

    if (window.solana?.isPhantom) {
      wallets.push({
        name: 'Phantom',
        wallet: window.solana,
        icon: '👻'
      });
    }

    setAvailableWallets(wallets);

    if (wallets.length === 1) {
      setSelectedWallet(wallets[0]);
    }
  };

  const updateConnection = (networkName) => {
    const conn = new Connection(RPC_ENDPOINTS[networkName], 'confirmed');
    setConnection(conn);
  };

  const connectWallet = async () => {
    if (!selectedWallet) {
      setStatus({ message: 'Please select a wallet first', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setStatus({ message: '', type: '' });

      await selectedWallet.wallet.connect();

      // After connect, publicKey is available on the wallet object
      const walletPublicKey = selectedWallet.wallet.publicKey;
      const isConnected = selectedWallet.wallet.isConnected;

      if (!walletPublicKey) {
        throw new Error('Unable to retrieve public key from wallet');
      }

      setPublicKey(new PublicKey(walletPublicKey));
      setConnected(isConnected);
      setStatus({ message: `Connected to ${selectedWallet.name}!`, type: 'success' });
    } catch (error) {
      setStatus({ message: `Connection failed: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    if (selectedWallet?.wallet) {
      try {
        await selectedWallet.wallet.disconnect();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
    setConnected(false);
    setPublicKey(null);
    setDelegateAddress('');
    setAmount('');
    setStatus({ message: 'Disconnected from wallet', type: 'success' });
  };

  const switchNetwork = (networkName) => {
    setNetwork(networkName);
    updateConnection(networkName);
    setDelegateAddress('');
    setAmount('');
    setStatus({ message: `Switched to ${networkName}`, type: 'success' });
  };

  const setUnlimitedAmount = () => {
    setAmount(MAX_U64_USDC);
  };

  const approveUSDC = async () => {
    if (!connected || !publicKey || !delegateAddress || !amount) {
      setStatus({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setStatus({ message: '', type: '' });

      const usdcMint = new PublicKey(network === 'mainnet' ? USDC_MAINNET : USDC_DEVNET);
      const delegate = new PublicKey(delegateAddress);
      const amountInDecimals = Math.floor(parseFloat(amount) * 1e6);

      if (isNaN(amountInDecimals) || amountInDecimals <= 0) {
        throw new Error('Invalid amount');
      }

      const tokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      const approveInstruction = createApproveInstruction(
        tokenAccount,
        delegate,
        publicKey,
        amountInDecimals,
        [],
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(approveInstruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTransaction = await selectedWallet.wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      setStatus({
        message: `Approval submitted! Confirming transaction...`,
        type: 'success'
      });

      await connection.confirmTransaction(signature, 'confirmed');

      const explorerUrl = `https://explorer.solana.com/tx/${signature}${network === 'devnet' ? '?cluster=devnet' : ''}`;
      setStatus({
        message: (
          <span>
            Approval successful! View transaction: <a href={explorerUrl} target="_blank" rel="noopener noreferrer">{signature.slice(0, 8)}...</a>
          </span>
        ),
        type: 'success'
      });

      setDelegateAddress('');
      setAmount('');
    } catch (error) {
      console.error('Approve error:', error);
      setStatus({ message: `Approval failed: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const revokeUSDC = async () => {
    if (!connected || !publicKey) {
      setStatus({ message: 'Please connect your wallet first', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setStatus({ message: '', type: '' });

      const usdcMint = new PublicKey(network === 'mainnet' ? USDC_MAINNET : USDC_DEVNET);

      const tokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      const revokeInstruction = createRevokeInstruction(
        tokenAccount,
        publicKey,
        [],
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(revokeInstruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTransaction = await selectedWallet.wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      setStatus({
        message: `Revoke submitted! Confirming transaction...`,
        type: 'success'
      });

      await connection.confirmTransaction(signature, 'confirmed');

      const explorerUrl = `https://explorer.solana.com/tx/${signature}${network === 'devnet' ? '?cluster=devnet' : ''}`;
      setStatus({
        message: (
          <span>
            Revoke successful! View transaction: <a href={explorerUrl} target="_blank" rel="noopener noreferrer">{signature.slice(0, 8)}...</a>
          </span>
        ),
        type: 'success'
      });
    } catch (error) {
      console.error('Revoke error:', error);
      setStatus({ message: `Revoke failed: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    const str = address.toString();
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  };

  const getAddress = (address) => {
    if (!address) return '';
    const str = address.toString();
    return str;
  };

  const usdcAddress = network === 'mainnet' ? USDC_MAINNET : USDC_DEVNET;

  return (
    <div className="App">
      <div className="container">
        <h1>Solana USDC Approval Manager</h1>

        <div className="card">
          <div className="network-tabs">
            <button
              className={`network-tab ${network === 'mainnet' ? 'active' : ''}`}
              onClick={() => switchNetwork('mainnet')}
              disabled={loading}
            >
              Mainnet
            </button>
            <button
              className={`network-tab ${network === 'devnet' ? 'active' : ''}`}
              onClick={() => switchNetwork('devnet')}
              disabled={loading}
            >
              Devnet
            </button>
          </div>

          <div className="info-box">
            <h3>Network Information</h3>
            <p><strong>Network:</strong> {network.charAt(0).toUpperCase() + network.slice(1)}</p>
            <p><strong>USDC Address:</strong> {usdcAddress}</p>
          </div>
        </div>

        {availableWallets.length === 0 && (
          <div className="card">
            <div className="status-message error">
              No Solana wallet detected. Please install Phantom or Coinbase Wallet.
            </div>
          </div>
        )}

        {availableWallets.length > 1 && !connected && (
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Select Wallet</h3>
            <div className="wallet-cards">
              {availableWallets.map((wallet, index) => (
                <div
                  key={index}
                  className={`wallet-card ${selectedWallet?.name === wallet.name ? 'selected' : ''}`}
                  onClick={() => setSelectedWallet(wallet)}
                >
                  <div className="icon">{wallet.icon}</div>
                  <div className="name">{wallet.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {availableWallets.length > 0 && (
          <div className="card">
            {!connected ? (
              <button
                className="connect-button"
                onClick={connectWallet}
                disabled={!selectedWallet || loading}
              >
                {loading ? 'Connecting...' : `Connect ${selectedWallet ? selectedWallet.name : 'Wallet'}`}
              </button>
            ) : (
              <>
                <div className="connected-info">
                  <div className="wallet-name">{selectedWallet.name} Connected</div>
                  <div className="address">{getAddress(publicKey)}</div>
                </div>
                <button
                  className="disconnect-button"
                  onClick={disconnectWallet}
                  disabled={loading}
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        )}

        {status.message && (
          <div className={`card status-message ${status.type}`}>
            {status.message}
          </div>
        )}

        {connected && (
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Approve USDC Delegation</h3>

            <div className="form-group">
              <label>Delegate Address</label>
              <input
                type="text"
                placeholder="Enter delegate wallet address"
                value={delegateAddress}
                onChange={(e) => setDelegateAddress(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Amount (USDC)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  step="0.000001"
                  min="0"
                  style={{ flex: 1 }}
                />
                <button
                  className="max-button"
                  onClick={setUnlimitedAmount}
                  disabled={loading}
                  type="button"
                >
                  Unlimited
                </button>
              </div>
            </div>

            <button
              className="approve-button"
              onClick={approveUSDC}
              disabled={!delegateAddress || !amount || loading}
            >
              {loading ? 'Processing...' : 'Approve'}
            </button>

            <button
              className="revoke-button"
              onClick={revokeUSDC}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Revoke All Approvals'}
            </button>
          </div>
        )}

        <div className="card">
          <div className="instructions">
            <h3>How to Use</h3>
            <ol>
              <li>Select your preferred network (Mainnet or Devnet)</li>
              <li>Connect your Solana wallet (Phantom or Coinbase Wallet)</li>
              <li>Enter the delegate address you want to approve</li>
              <li>Enter the amount of USDC to approve</li>
              <li>Click "Approve" and confirm the transaction in your wallet</li>
              <li>To revoke all approvals, click "Revoke All Approvals"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
