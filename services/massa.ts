import WalletProvider from '@massalabs/wallet-provider'
import { providers } from '@massalabs/wallet-provider'
const CONTRACT_ADDRESS: string | undefined = (import.meta as any).env?.VITE_MASSA_CONTRACT_ADDRESS

function hasBearby() {
  return typeof (window as any).bearby !== 'undefined'
}

// Massa Wallet (Bearby) is the primary browser wallet we support

async function call(functionName: string, payload: string) {
  if (!CONTRACT_ADDRESS) throw new Error('Missing VITE_MASSA_CONTRACT_ADDRESS')
  const wallets = await providers()
  for (const w of wallets) {
    try {
      if ((w as any).connect) {
        const ok = await (w as any).connect()
        if (!ok) continue
      }
      const accounts = await w.accounts()
      const acc = accounts?.[0]
      if (acc && typeof (acc as any).callSC === 'function') {
        return await (acc as any).callSC({ targetAddress: CONTRACT_ADDRESS, functionName, param: payload })
      }
    } catch {}
  }
  if (hasBearby()) {
    const b: any = (window as any).bearby
    if (b.contract?.call) return await b.contract.call(CONTRACT_ADDRESS, functionName, payload)
    if (b.massa?.callSmartContract) return await b.massa.callSmartContract({ targetAddress: CONTRACT_ADDRESS, functionName, param: payload })
  }
  if (hasMassaStation()) {
    const m: any = (window as any).massa
    if (typeof m.request === 'function') return await m.request({ method: 'massa_callSmartContract', params: { targetAddress: CONTRACT_ADDRESS, functionName, param: payload } })
  }
  throw new Error('No Massa provider available')
}

export async function createPlanOnChain(input: { name: string; description: string; amount: number; token: string; frequency: string }) {
  const payload = [input.name, input.description, String(input.amount), input.token, input.frequency].join('|')
  const res: any = await call('createPlan', payload)
  if (typeof res === 'string') return res
  if (res?.result) return String(res.result)
  throw new Error('Unexpected response from provider')
}

export async function subscribeOnChain(planId: string) {
  const res: any = await call('subscribe', planId)
  if (typeof res === 'string') return res
  if (res?.result) return String(res.result)
  throw new Error('Unexpected response from provider')
}

export async function cancelSubscriptionOnChain(subId: string) {
  await call('cancel', subId)
  return true
}
function hasMassaStation() {
  return typeof (window as any).massa !== 'undefined'
}
