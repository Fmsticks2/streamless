import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const {
  ClientFactory,
  DefaultProviderUrls,
  SmartContractsClient,
  Web3Account,
  Args,
  EOperationStatus,
  fromMAS,
  utils,
  ProviderType,
} = require('@massalabs/massa-web3')

function readBytecode() {
  const wasmPath = path.join(process.cwd(), 'build', 'streamless.wasm')
  if (!fs.existsSync(wasmPath)) {
    console.error('Bytecode not found. Build first: npm run build')
    process.exit(1)
  }
  const bytes = fs.readFileSync(wasmPath)
  return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

async function main() {
  const rawPriv = (process.env.PRIVATE_KEY || '').replace(/`/g, '').trim()
  if (!rawPriv) {
    console.error('Missing PRIVATE_KEY in .env')
    process.exit(1)
  }
  const byteCode = readBytecode()
  const sk = new utils.keyAndAddresses.SecretKey(rawPriv)
  const pk = await sk.getPublicKey()
  const addr = utils.keyAndAddresses.Address.fromPublicKey(pk)
  const baseAccount = {
    publicKey: pk.base58Encode,
    secretKey: rawPriv,
    address: addr.base58Encode,
  }
  const rawNet = (process.env.NETWORK || 'testnet').toLowerCase()
  const network = rawNet.startsWith('main') ? 'mainnet' : 'testnet'
  let client
  const pubUrl = (process.env.JSON_RPC_URL_PUBLIC || '').replace(/`/g, '').trim()
  const prvUrl = (process.env.JSON_RPC_URL_PRIVATE || '').replace(/`/g, '').trim()
  if (pubUrl && prvUrl) {
    const providers = [
      { url: pubUrl, type: ProviderType.PUBLIC },
      { url: prvUrl, type: ProviderType.PRIVATE },
    ]
    client = await ClientFactory.createCustomClient(providers, baseAccount)
  } else {
    client = await ClientFactory.createDefaultClient(
      network === 'mainnet' ? DefaultProviderUrls.MAINNET : DefaultProviderUrls.TESTNET,
      baseAccount
    )
  }
  const sc = client.smartContracts()
  const executor = new Web3Account(baseAccount, client.publicApi())
  await client.wallet().setBaseAccount(executor)
  try {
    await executor.verify()
  } catch (e) {
    console.error('Key verification failed. Ensure PRIVATE_KEY is valid:', e.message || e)
    process.exit(1)
  }
  console.log(`Derived PUBLIC_KEY: ${baseAccount.publicKey}`)
  console.log(`Derived ADDRESS: ${baseAccount.address}`)
  // derive and log balance
  const bal = await client.wallet().getAccountBalance(baseAccount.address)
  console.log(`Balance for ${baseAccount.address}: final=${bal.final} candidate=${bal.candidate}`)
  console.log(`Submitting deploy to ${network}...`)
  const opIds = await sc.deploySmartContract(
    {
      fee: fromMAS('0.01'),
      maxGas: Number(process.env.MAX_GAS || 3_900_000_000),
      gasPrice: 0,
      coins: fromMAS(process.env.DEPLOY_COINS || '0.01'),
      contractDataBinary: byteCode,
    },
    executor
  )
  const opId = Array.isArray(opIds) ? opIds[0] : opIds
  console.log('Operation submitted:', opId)
  await sc.awaitRequiredOperationStatus(opId, EOperationStatus.FINAL_SUCCESS)
  console.log('Operation is final. Fetching events...')
  const filter = {
    start: { period: 0, thread: 0 },
    end: { period: 0, thread: 0 },
    original_operation_id: opId,
    original_caller_address: null,
    emitter_address: null,
  }
  const events = await sc.getFilteredScOutputEvents(filter)
  const msg = events?.find((e) => typeof e.data === 'string' && e.data.includes('Contract deployed at address:'))?.data
  if (msg) {
    const address = msg.split('Contract deployed at address:')[1].trim()
    console.log('Contract deployed at:', address)
    fs.writeFileSync(path.join(process.cwd(), 'deploy-address.txt'), address)
  } else {
    console.log('Deployed. Could not parse address from events. Check wallet or node logs.')
  }
}

main().catch((e) => {
  console.error('Deploy failed:', e)
  process.exit(1)
})
