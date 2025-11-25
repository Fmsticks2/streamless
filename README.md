
# Streamless on Massa

This dApp runs on the Massa network and manages on-chain subscription plans.

## Run Locally

Prerequisites: Node.js, Bearby or Massa Station wallet

1. Install dependencies:
   `npm install`
2. Configure env in `.env.local`:
   `GEMINI_API_KEY=your_key`
   `VITE_MASSA_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS`
3. Start:
   `npm run dev`

## Smart Contract

Source is in `contracts/streamless/Streamless.ts` (AssemblyScript). It exposes `createPlan`, `subscribe`, and `cancel` entry points and stores plan and subscription data in contract storage.

### Build and Deploy

1. Create a Massa smart contract project and copy `contracts/streamless/Streamless.ts` into it.
2. Install `@massalabs/massa-as-sdk` and compile to Wasm.
3. Deploy the Wasm to Massa testnet/mainnet using Massa CLI or Bearby.
4. Set the deployed address in `VITE_MASSA_CONTRACT_ADDRESS`.

## Wallets

The app detects Bearby and Massa Station. On-chain operations are executed via the connected wallet. If no provider is available, actions continue locally for demo purposes.
