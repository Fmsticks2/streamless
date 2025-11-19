import { SmartContract, Args, Account, JsonRpcProvider } from '@massalabs/massa-web3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployContract() {
    try {
        console.log('🚀 Starting Streamless contract deployment...');

        // Check for private key in environment
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('PRIVATE_KEY environment variable is required. Please create a .env file with your wallet private key.');
        }

        // Initialize account from private key
        const account = await Account.fromPrivateKey(privateKey);
        const provider = JsonRpcProvider.buildnet(account);
        
        console.log('📡 Connected to Massa buildnet');
        console.log('🔑 Deployer address:', account.address);

        // Read the compiled WASM bytecode
        const wasmPath = join(__dirname, 'build', 'release.wasm');
        const byteCode = readFileSync(wasmPath);
        
        console.log('📦 Contract bytecode loaded:', byteCode.length, 'bytes');

        // Deploy the contract
        console.log('⏳ Deploying contract...');
        const contract = await SmartContract.deploy(
            provider,
            byteCode,
            new Args(), // No constructor arguments needed
            {
                fee: BigInt(10000000), // 0.01 MAS
                maxGas: BigInt(200000000), // 200M gas units
                maxCoins: BigInt(100000000000), // 100 MAS max coins
                waitFinalExecution: true
            }
        );

        console.log('✅ Contract deployed successfully!');
        console.log('📍 Contract address:', contract.address);
        console.log('🔗 Deployer address:', account.address);
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress: contract.address,
            deployerAddress: account.address,
            network: 'buildnet',
            timestamp: new Date().toISOString(),
            wasmSize: byteCode.length
        };

        console.log('\n📋 Deployment Summary:');
        console.log(JSON.stringify(deploymentInfo, null, 2));

        return deploymentInfo;

    } catch (error) {
        console.error('❌ Deployment failed:', error);
        throw error;
    }
}

// Run deployment
deployContract()
    .then((info) => {
        console.log('\n🎉 Deployment completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Deployment failed:', error.message);
        process.exit(1);
    });