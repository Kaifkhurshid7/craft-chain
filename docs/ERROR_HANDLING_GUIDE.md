# Error Handling & Troubleshooting Guide

## Overview

Craft-Chain implements comprehensive error handling across all layers:
- **Smart Contract Layer**: Gas estimation, permission checks, token validation
- **Blockchain Utilities**: Network detection, transaction monitoring, error categorization
- **IPFS Integration**: Timeout detection, gateway fallbacks, upload retries
- **Form Validation**: Field-level and cross-field validation with user-friendly messages
- **React Components**: Error boundaries, graceful degradation, recovery options

---

## Error Types & Categories

### Validation Errors
**Category**: `VALIDATION_ERROR`

Validation errors occur when user input doesn't meet requirements.

**Common Examples:**
- Batch name too short (must be 3-100 characters)
- Description too short (must be 10-500 characters)
- Invalid Ethereum address format
- Image file too large (max 5MB)
- Production date in the future
- Token ID not a positive number

**User-Friendly Messages:**
- "Batch name must be between 3 and 100 characters."
- "Description must be between 10 and 500 characters."
- "Please enter a valid Ethereum address."
- "Image must be a valid image file (JPEG, PNG, GIF, WebP) and max 5MB."

**Recovery:**
- Fix the invalid input and try again
- Review input requirements displayed in UI
- Check field-level error messages

---

### Network Errors
**Category**: `NETWORK_ERROR`

Network errors indicate connectivity issues or unavailable services.

**Common Causes:**
- No internet connection
- RPC provider (Alchemy) unreachable
- IPFS gateway timeout or unavailable
- DNS resolution failure
- Network timeout during transaction

**User-Friendly Messages:**
- "Network error occurred. Please check your internet connection."
- "Cannot connect to the blockchain network. Please check your internet connection."
- "RPC provider is unavailable. Please try again in a moment."

**Recovery:**
1. Check internet connection
2. Verify firewall/proxy settings
3. Try again after a few seconds
4. Check service status pages:
   - Alchemy: https://status.alchemy.com/
   - Sepolia Explorer: https://sepolia.etherscan.io/

---

### Gas Errors
**Category**: `GAS_ERROR`

Gas errors occur when the wallet doesn't have enough ETH to pay transaction fees.

**Common Causes:**
- Insufficient ETH balance for gas fees
- Gas price spike on network
- Wallet not funded with test ETH

**User-Friendly Messages:**
- "You don't have enough ETH to cover gas fees. Please get some testnet ETH from a faucet."
- "Insufficient gas or gas estimation failed."

**Recovery:**
1. Get free test ETH from a Sepolia faucet:
   - Faucet 1: https://sepoliafaucet.com/
   - Faucet 2: https://www.alchemy.com/faucets/ethereum-sepolia
   - Faucet 3: https://sepolia-faucet.pk910.de/
2. Wait for test ETH to arrive in wallet (usually instant)
3. Retry the transaction

---

### Contract Errors
**Category**: `CONTRACT_ERROR`

Contract errors occur during smart contract interactions.

**Common Causes:**
- Token does not exist
- Caller not authorized (not owner for step recording)
- Invalid contract state
- Transaction reverted on-chain

**User-Friendly Messages:**
- "The batch NFT you're looking for does not exist."
- "Only the current batch owner can record steps."
- "The transaction failed on-chain. This could be due to invalid data or contract state."

**Recovery:**
1. Verify token ID is correct
2. Ensure you're the current batch owner
3. Check on Etherscan: https://sepolia.etherscan.io/
4. Try again or contact support

---

### Permission Errors
**Category**: `PERMISSION_ERROR`

Permission errors occur when the user lacks required authorization.

**Common Causes:**
- Attempting to record step without owning the batch
- Attempting to mint without MINTER_ROLE
- Attempting to transfer token you don't own

**User-Friendly Messages:**
- "Only the current batch owner can record steps."
- "Only authorized addresses can perform this action."

**Recovery:**
1. Verify you're connected with the correct wallet address
2. Ensure you own the batch NFT
3. Contact admin if you need MINTER_ROLE granted

---

### IPFS Errors
**Category**: `IPFS_ERROR`

IPFS errors occur during file upload/retrieval from decentralized storage.

**Common Causes:**
- IPFS gateway unavailable or slow
- Authentication failure (invalid Pinata JWT)
- File too large
- Rate limiting from Pinata service

**User-Friendly Messages:**
- "Failed to upload or retrieve data from IPFS. Please try again."
- "Authentication with IPFS service failed. Please check your API key."
- "File is too large for IPFS. Maximum size is 5MB."
- "Rate limited by IPFS service. Please try again later."

**Recovery:**
1. **For gateway errors**: System automatically tries 3 different gateways
2. **For auth errors**: Verify NEXT_PUBLIC_PINATA_JWT is set correctly
3. **For file size**: Reduce image size (must be under 5MB)
4. **For rate limiting**: Wait and retry after a few minutes

---

### Transaction Errors
**Category**: `TRANSACTION_ERROR`

Transaction errors occur during blockchain transaction execution.

**Common Causes:**
- User rejected transaction in MetaMask
- Transaction nonce error
- Transaction reverted
- Gas estimation failed
- Failed to get receipt

**User-Friendly Messages:**
- "You rejected the transaction. Please try again if you want to proceed."
- "Transaction was submitted but receipt could not be confirmed."
- "There was an issue with your transaction sequence. Please try again."

**Recovery:**
1. Check MetaMask for rejection reason
2. If rejected: Click "Retry Transaction" button
3. Check Etherscan for transaction status: https://sepolia.etherscan.io/
4. Ensure sufficient gas ETH
5. Try again after a few seconds

---

### Wallet Errors
**Category**: `WALLET_ERROR`

Wallet errors occur when MetaMask is not available or not properly connected.

**Common Causes:**
- MetaMask extension not installed
- MetaMask not connected
- Unable to switch to Sepolia network
- No signer available

**User-Friendly Messages:**
- "MetaMask is not installed. Please install MetaMask extension."
- "Could not access your wallet. Please ensure MetaMask is connected and try again."
- "Could not switch to Sepolia network. Please try again or switch manually in MetaMask."

**Recovery:**
1. Install MetaMask: https://metamask.io/
2. Create/unlock MetaMask wallet
3. Click "Connect Wallet" button in application
4. Approve connection to application
5. Switch to Sepolia network if prompted

---

### Timeout Errors
**Category**: `TIMEOUT_ERROR`

Timeout errors occur when operations take too long to complete.

**Common Causes:**
- Very slow internet connection
- IPFS upload taking too long (>60 seconds)
- IPFS retrieval taking too long (>30 seconds)
- Network congestion

**User-Friendly Messages:**
- "The operation timed out. Please try again."
- "The upload took too long. Please check your internet connection and try again."

**Recovery:**
1. Check internet connection speed
2. Close other bandwidth-heavy applications
3. Try again immediately
4. If persistent, contact support

---

### Not Found Errors
**Category**: `NOT_FOUND_ERROR`

Not Found errors occur when requested resources don't exist.

**Common Causes:**
- Invalid token ID
- Batch doesn't exist
- IPFS content not available

**User-Friendly Messages:**
- "Batch NFT with ID {id} does not exist."
- "The requested resource was not found."

**Recovery:**
1. Verify token ID is correct
2. Check batch exists on blockchain: https://sepolia.etherscan.io/
3. Verify IPFS data is pinned and available

---

## Error Recovery Strategies

### Automatic Retry with Exponential Backoff

The application implements intelligent retry logic for network-related errors:

```
Attempt 1: Immediate retry
Attempt 2: Wait 1 second, then retry
Attempt 3: Wait 2 seconds, then retry (configurable)
```

**Retryable Errors:**
- Network timeouts
- Connection refused
- Service unavailable
- Rate limiting (429)

**Non-Retryable Errors:**
- Validation errors
- Permission errors
- Authorization errors
- Rejected by user

### Manual Retry Options

Users see retry buttons for these scenarios:

1. **Cached Metadata Retry** (Mint page)
   - If IPFS upload succeeds but transaction fails
   - Click "Retry Transaction" to re-submit transaction
   - Uses cached metadata URI

2. **Full Process Retry** (All pages)
   - Click "Clear & Start Over" to reset form
   - Re-submit entire operation

3. **Component Retry** (Error Boundary)
   - Click "Try Again" to reset error boundary
   - Re-render component

### Gateway Fallback

IPFS operations automatically try multiple gateways:

1. Primary: `https://gateway.pinata.cloud/ipfs/`
2. Fallback 1: `https://cloudflare-ipfs.com/ipfs/`
3. Fallback 2: `https://ipfs.io/ipfs/`

If one gateway fails, automatically tries the next.

---

## Error Logging & Debugging

### Log Levels

- **DEBUG**: Detailed information for development
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failures
- **CRITICAL**: Critical errors sent to external service

### Accessing Logs

**In Browser Console:**
```javascript
// View all logs
errorLogger.getLogs()

// View logs by level
errorLogger.getLogsByLevel(LogLevel.ERROR)

// Export logs as JSON
errorLogger.downloadLogs()
```

**In Development:**
- Open browser DevTools (F12)
- Go to Console tab
- Logs appear with timestamps and context

### Exporting Logs for Support

```javascript
// In browser console
errorLogger.downloadLogs("craft-chain-logs.json")
```

This creates a JSON file with all application logs for debugging.

---

## Common Issues & Solutions

### MetaMask Not Connecting

**Symptoms:**
- "MetaMask is not installed" error
- Connection button doesn't work
- Wallet shows disconnected

**Solutions:**
1. Install MetaMask: https://metamask.io/
2. Create account or import existing
3. Ensure MetaMask is enabled in browser
4. Check extension permissions
5. Refresh page and try again

### Insufficient Gas Error

**Symptoms:**
- "You don't have enough ETH for gas fees"
- Transaction rejected with gas error
- Balance shows but can't complete transaction

**Solutions:**
1. Get free Sepolia ETH from faucet (see above)
2. Request multiple times if first is small
3. Wait 1-2 minutes for faucet rate limiting
4. Check balance updated: https://sepolia.etherscan.io/

### IPFS Upload Timeout

**Symptoms:**
- Upload progress stops at 50%
- "Upload took too long" error
- Application hangs on upload

**Solutions:**
1. Check internet connection speed
2. Reduce image file size (keep under 2MB)
3. Close bandwidth-heavy applications
4. Try again - automatic retry will attempt
5. Use different network if available

### Token Not Found

**Symptoms:**
- "Batch NFT with ID X does not exist"
- Batch details page shows error
- Token ID appears invalid

**Solutions:**
1. Verify token ID is correct
2. Check batch exists: https://sepolia.etherscan.io/
   - Search for contract address
   - Look for token ID
3. Ensure batch was successfully minted
4. Try viewing on blockchain explorer

### MetaMask Wrong Network

**Symptoms:**
- "Please switch to Sepolia testnet" warning
- Connected to Mainnet instead of Sepolia
- Transactions fail with network error

**Solutions:**
1. Open MetaMask
2. Click network selector at top
3. Select "Sepolia" from list
4. If not listed: Add manually
   - Network Name: Sepolia Testnet
   - Chain ID: 11155111
   - RPC URL: https://eth-sepolia.g.alchemy.com/v2/demo
   - Block Explorer: https://sepolia.etherscan.io/

---

## Environment Configuration

### Required Environment Variables

```bash
# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...          # Deployed contract address
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111

# IPFS
NEXT_PUBLIC_PINATA_JWT=...                  # Pinata API JWT
NEXT_PUBLIC_IPFS_GATEWAY=...                # IPFS gateway URL (optional)

# Optional
NEXT_PUBLIC_ERROR_LOG_SERVICE=...           # External error logging service
```

### Troubleshooting Configuration

1. **Contract address not set**
   - Error: "Cannot read property 'address' of undefined"
   - Solution: Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local

2. **Pinata JWT not set**
   - Error: "Pinata JWT not configured"
   - Solution: Set NEXT_PUBLIC_PINATA_JWT in .env.local

3. **RPC not configured**
   - Error: "Cannot connect to RPC"
   - Solution: Ensure Alchemy key is in environment

---

## Best Practices

### For Users

1. **Always verify:**
   - Connected wallet address is correct
   - Using Sepolia network
   - Have sufficient test ETH for gas

2. **Before minting:**
   - Double-check batch information
   - Ensure image is under 5MB
   - Have production date ready

3. **On error:**
   - Read error message carefully
   - Check suggested action
   - Use retry button if available
   - Check logs if needed

### For Developers

1. **Error Handling:**
   ```typescript
   try {
     const result = await mintBatch(to, uri);
   } catch (error) {
     const message = getUserMessage(error);
     const action = getSuggestedAction(error);
     // Display to user with suggested action
   }
   ```

2. **Logging:**
   ```typescript
   logDebug("Operation started", { operationName });
   logError("Operation failed", error, { operationName });
   ```

3. **Validation:**
   ```typescript
   const errors = validateBatchForm(formData);
   if (Object.keys(errors).length > 0) {
     // Show validation errors to user
     setErrors(errors);
   }
   ```

---

## Support & Escalation

### When to Contact Support

1. **Persistent errors** that survive multiple retries
2. **Configuration issues** after following troubleshooting guide
3. **Smart contract issues** (token not minted despite transaction success)
4. **IPFS data loss** (metadata not retrievable)
5. **Unexpected behavior** not matching documented flows

### Information to Provide

When contacting support, include:

1. **Error message** (screenshot or exact text)
2. **Error logs** (exported JSON via errorLogger)
3. **Wallet address** (affected account)
4. **Token ID** (if applicable)
5. **Transaction hash** (from MetaMask/Etherscan)
6. **Browser and OS** information
7. **Steps to reproduce** the issue

### Diagnostic Commands

Run in browser console:

```javascript
// Check wallet connection
console.log(window.ethereum)

// Check error logs
errorLogger.getLogs()

// Get error count
errorLogger.getLogsByLevel(LogLevel.ERROR).length

// Check IPFS gateway
await checkIPFSGateway()

// Check Pinata service
await checkPinataService()
```

---

## Future Improvements

- [ ] Integration with error tracking service (e.g., Sentry)
- [ ] Automatic error recovery workflows
- [ ] Machine learning for error prediction
- [ ] Enhanced analytics for common error patterns
- [ ] Multi-language error messages
- [ ] Mobile app error handling
- [ ] Advanced retry strategies per error type

