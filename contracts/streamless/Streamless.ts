import { Storage, Context, generateEvent } from '@massalabs/massa-as-sdk'

function now(): u64 {
  return Context.timestamp()
}

function planKey(id: string, field: string): string {
  return 'plan:' + id + ':' + field
}

function subKey(id: string, field: string): string {
  return 'sub:' + id + ':' + field
}

function creatorPlansKey(addr: string): string {
  return 'creatorPlans:' + addr
}

function parseFrequency(freq: string): u64 {
  if (freq == 'Daily') return 1
  if (freq == 'Weekly') return 7
  if (freq == 'Monthly') return 30
  return 365
}

export function constructor(_: StaticArray<u8>): void {
  generateEvent('streamless_init')
}

export function createPlan(bytes: StaticArray<u8>): StaticArray<u8> {
  const args = String.UTF8.decode(bytes)
  const parts = args.split('|')
  const name = parts[0]
  const description = parts[1]
  const amount = parts[2]
  const token = parts[3]
  const frequency = parts[4]
  const creator = Context.caller()
  const id = 'plan_' + now().toString()
  Storage.set(planKey(id, 'name'), name)
  Storage.set(planKey(id, 'description'), description)
  Storage.set(planKey(id, 'amount'), amount)
  Storage.set(planKey(id, 'token'), token)
  Storage.set(planKey(id, 'frequency'), frequency)
  Storage.set(planKey(id, 'creator'), creator)
  Storage.set(planKey(id, 'subscribers'), '0')
  Storage.set(planKey(id, 'isActive'), 'true')
  const listKey = creatorPlansKey(creator)
  const existing = Storage.has(listKey) ? Storage.get(listKey) : ''
  const updated = existing.length > 0 ? existing + ',' + id : id
  Storage.set(listKey, updated)
  generateEvent('plan_created|' + id)
  return String.UTF8.encode(id)
}

export function subscribe(bytes: StaticArray<u8>): StaticArray<u8> {
  const planId = String.UTF8.decode(bytes)
  const creator = Storage.get(planKey(planId, 'creator'))
  const freq = Storage.get(planKey(planId, 'frequency'))
  const days = parseFrequency(freq)
  const subId = 'sub_' + now().toString() + '_' + Context.caller()
  Storage.set(subKey(subId, 'planId'), planId)
  Storage.set(subKey(subId, 'planName'), Storage.get(planKey(planId, 'name')))
  Storage.set(subKey(subId, 'creator'), creator)
  Storage.set(subKey(subId, 'nextPayment'), (now() + days * 86400000).toString())
  Storage.set(subKey(subId, 'cyclesCompleted'), '0')
  Storage.set(subKey(subId, 'totalPaid'), '0')
  Storage.set(subKey(subId, 'status'), 'Active')
  const subsStr = Storage.get(planKey(planId, 'subscribers'))
  const subs = I32.parseInt(subsStr)
  Storage.set(planKey(planId, 'subscribers'), (subs + 1).toString())
  generateEvent('sub_created|' + subId)
  return String.UTF8.encode(subId)
}

export function cancel(bytes: StaticArray<u8>): void {
  const subId = String.UTF8.decode(bytes)
  Storage.set(subKey(subId, 'status'), 'Cancelled')
  generateEvent('sub_cancelled|' + subId)
}

