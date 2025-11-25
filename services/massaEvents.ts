const RPC_URL = 'https://mainnet.massa.net/api/v2'

export interface ScEvent {
  data?: string
  emitter?: string
  original_operation_id?: string
}

export async function getContractEvents(address: string, isFinal: boolean = true): Promise<ScEvent[]> {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'get_filtered_sc_output_event',
    params: [
      {
        start: { period: 0, thread: 0 },
        end: { period: 0, thread: 0 },
        emitter_address: address,
        original_caller_address: null,
        original_operation_id: null,
        is_final: isFinal,
      },
    ],
  }
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  const events = json?.result || []
  return Array.isArray(events) ? events : []
}

