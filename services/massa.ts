const CONTRACT_ADDRESS: string | undefined = (import.meta as any).env?.VITE_MASSA_CONTRACT_ADDRESS

function hasBearby() {
  return typeof (window as any).bearby !== 'undefined'
}

function hasMassaStation() {
  return typeof (window as any).massa !== 'undefined'
}

async function call(functionName: string, payload: string) {
  if (!CONTRACT_ADDRESS) throw new Error('Missing VITE_MASSA_CONTRACT_ADDRESS')
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
  try {
    const res: any = await call('createPlan', payload)
    if (typeof res === 'string') return res
    if (res?.result) return String(res.result)
    return 'plan_' + Date.now().toString()
  } catch {
    return 'plan_' + Date.now().toString()
  }
}

export async function subscribeOnChain(planId: string) {
  try {
    const res: any = await call('subscribe', planId)
    if (typeof res === 'string') return res
    if (res?.result) return String(res.result)
    return 'sub_' + Date.now().toString()
  } catch {
    return 'sub_' + Date.now().toString()
  }
}

export async function cancelSubscriptionOnChain(subId: string) {
  try {
    await call('cancel', subId)
    return true
  } catch {
    return false
  }
}

