import 'dotenv/config';
import {
  Account,
  Args,
  Mas,
  SmartContract,
  JsonRpcProvider,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

const account = await Account.fromEnv();
const net = (process.env.NETWORK || 'testnet').toLowerCase();
const provider = net.startsWith('main')
  ? JsonRpcProvider.mainnet(account)
  : net.startsWith('build')
    ? JsonRpcProvider.buildnet(account)
    : JsonRpcProvider.testnet(account);

console.log('Deploying contract...');

const byteCode = getScByteCode('build', 'main.wasm');

const constructorArgs = new Args();
const coins = process.env.DEPLOY_COINS || '0.01';

const contract = await SmartContract.deploy(
  provider,
  byteCode,
  constructorArgs,
  { coins: Mas.fromString(coins) },
);

console.log('Contract deployed at:', contract.address);

const events = await provider.getEvents({ smartContractAddress: contract.address });
for (const event of events) {
  console.log('Event message:', event.data);
}
