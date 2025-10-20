// Streamless Autonomous Subscription Contract (AssemblyScript)
// NOTE: This scaffold uses Massa AS SDK APIs and key-value storage patterns.
// It focuses on clarity and correctness of logic; integrate transfers and
// deferred scheduling per the SDK's provider environment.

import {
  Storage,
  Context,
  generateEvent,
} from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';

// Storage key helpers
function kPlanIds(): string { return 'plan:ids'; }
function kPlanCreator(id: string): string { return `plan:${id}:creator`; }
function kPlanAmount(id: string): string { return `plan:${id}:amount`; }
function kPlanFreq(id: string): string { return `plan:${id}:freq`; }
function kPlanActive(id: string): string { return `plan:${id}:active`; }

function kSubsIndex(addr: string): string { return `subs:${addr}:index`; }
function kSubActive(addr: string, id: string): string { return `sub:${addr}:${id}:active`; }
function kSubNext(addr: string, id: string): string { return `sub:${addr}:${id}:next`; }
function kSubRemain(addr: string, id: string): string { return `sub:${addr}:${id}:remain`; }

// Utilities
function now(): u64 { return Context.timestamp(); }
function toBool(s: string): bool { return s == '1'; }
function fromBool(b: bool): string { return b ? '1' : '0'; }

// Strict decimal parsers (no sign, base-10 only)
function parseU64Strict(s: string): u64 {
  let x: u64 = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    assert(c >= 48 && c <= 57, 'invalid u64 string');
    x = x * 10 + <u64>(c - 48);
  }
  return x;
}

function parseU32Strict(s: string): u32 {
  let x: u32 = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    assert(c >= 48 && c <= 57, 'invalid u32 string');
    x = (<u32>10) * x + <u32>(c - 48);
  }
  return x;
}

function getIds(key: string): string[] {
  const raw = Storage.has<string>(key) ? Storage.get<string>(key) : '';
  return raw.length == 0 ? new Array<string>(0) : raw.split('|');
}

function setIds(key: string, ids: string[]): void {
  Storage.set<string>(key, ids.join('|'));
}

function pushUniqueId(key: string, id: string): void {
  const ids = getIds(key);
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] == id) return;
  }
  ids.unshift(id);
  setIds(key, ids);
}

// Contract methods
// create_plan(plan_id: string, amount: u64, frequency_days: u32) -> bool
export function create_plan(argsBytes: StaticArray<u8>): StaticArray<u8> {
  const a = new Args(argsBytes);
  const planId = a.nextString().expect('plan_id is required');
  const amount = a.nextU64().expect('amount is required');
  const frequencyDays = a.nextU32().expect('frequency_days is required');

  assert(planId.length > 0, 'plan_id required');
  assert(frequencyDays > 0, 'frequency_days must be > 0');
  const creator = Context.caller().toString();

  assert(!Storage.has<string>(kPlanCreator(planId)), 'plan already exists');

  Storage.set<string>(kPlanCreator(planId), creator);
  Storage.set<string>(kPlanAmount(planId), amount.toString());
  Storage.set<string>(kPlanFreq(planId), frequencyDays.toString());
  Storage.set<string>(kPlanActive(planId), '1');
  pushUniqueId(kPlanIds(), planId);

  generateEvent(`PlanCreated|${planId}|${creator}|${amount.toString()}|${frequencyDays.toString()}`);
  return new Args().add<bool>(true).serialize();
}

// update_plan(plan_id: string, new_amount: u64, new_freq: u32) -> bool
export function update_plan(argsBytes: StaticArray<u8>): StaticArray<u8> {
  const a = new Args(argsBytes);
  const planId = a.nextString().expect('plan_id is required');
  const newAmount = a.nextU64().expect('new_amount is required');
  const newFreq = a.nextU32().expect('new_freq is required');

  assert(Storage.has<string>(kPlanCreator(planId)), 'plan not found');
  const creator = Storage.get<string>(kPlanCreator(planId));
  assert(Context.caller().toString() == creator, 'only creator');
  assert(newFreq > 0, 'frequency_days must be > 0');

  Storage.set<string>(kPlanAmount(planId), newAmount.toString());
  Storage.set<string>(kPlanFreq(planId), newFreq.toString());
  return new Args().add<bool>(true).serialize();
}

// subscribe(plan_id: string, cycles?: u32) -> bool
export function subscribe(argsBytes: StaticArray<u8>): StaticArray<u8> {
  const a = new Args(argsBytes);
  const planId = a.nextString().expect('plan_id is required');
  const hasCycles = a.nextBool().unwrapOrDefault();
  const cycles: u32 = hasCycles ? a.nextU32().expect('cycles required') : 0;

  assert(Storage.has<string>(kPlanCreator(planId)), 'plan not found');
  const isActive = toBool(Storage.get<string>(kPlanActive(planId)));
  assert(isActive, 'plan inactive');

  const subscriber = Context.caller().toString();
  // if already have sub, set active true
  Storage.set<string>(kSubActive(subscriber, planId), '1');
  const frequencyDays = parseU32Strict(Storage.get<string>(kPlanFreq(planId)));
  // Context.timestamp() returns milliseconds; convert days -> milliseconds
  const firstPay = now() + <u64>frequencyDays * 86400000;
  Storage.set<string>(kSubNext(subscriber, planId), firstPay.toString());
  if (hasCycles) Storage.set<string>(kSubRemain(subscriber, planId), cycles.toString());

  pushUniqueId(kSubsIndex(subscriber), planId);

  // NOTE: Scheduling deferred call is environment-specific; integrate using SDK once available.
  // e.g., Context.defer(Context.address(), 'execute_payment', new Args().add(subscriber).add(planId).serialize(), firstPay - now());

  generateEvent(`Subscribed|${subscriber}|${planId}`);
  return new Args().add<bool>(true).serialize();
}

// cancel_subscription(plan_id: string) -> bool
export function cancel_subscription(argsBytes: StaticArray<u8>): StaticArray<u8> {
  const a = new Args(argsBytes);
  const planId = a.nextString().expect('plan_id is required');
  const subscriber = Context.caller().toString();

  assert(Storage.has<string>(kSubActive(subscriber, planId)), 'no subscription');
  Storage.set<string>(kSubActive(subscriber, planId), '0');
  generateEvent(`SubscriptionCancelled|${subscriber}|${planId}`);
  return new Args().add<bool>(true).serialize();
}

// execute_payment(subscriber: string, plan_id: string) -> bool
export function execute_payment(argsBytes: StaticArray<u8>): StaticArray<u8> {
  const a = new Args(argsBytes);
  const subscriber = a.nextString().expect('subscriber required');
  const planId = a.nextString().expect('plan_id required');

  // Validate active
  const active =
    Storage.has<string>(kSubActive(subscriber, planId)) &&
    toBool(Storage.get<string>(kSubActive(subscriber, planId)));
  if (!active) return new Args().add<bool>(false).serialize();

  // Validate due time
  const nextTime: u64 = parseU64Strict(Storage.get<string>(kSubNext(subscriber, planId)));
  if (now() < nextTime) return new Args().add<bool>(false).serialize();

  // Transfer logic placeholder: integrate MRC-20/MASS transfer via SDK
  const amount = parseU64Strict(Storage.get<string>(kPlanAmount(planId)));
  const creator = Storage.get<string>(kPlanCreator(planId));
  // TODO: perform transfer_from(subscriber -> creator, amount)

  // Update remaining cycles
  if (Storage.has<string>(kSubRemain(subscriber, planId))) {
    let remain = parseU32Strict(Storage.get<string>(kSubRemain(subscriber, planId)));
    if (remain > 0) {
      remain -= 1;
      Storage.set<string>(kSubRemain(subscriber, planId), remain.toString());
      if (remain == 0) Storage.set<string>(kSubActive(subscriber, planId), '0');
    }
  }

  // Reschedule next payment if still active
  const stillActive = toBool(Storage.get<string>(kSubActive(subscriber, planId)));
  const frequencyDays = parseU32Strict(Storage.get<string>(kPlanFreq(planId)));
  const newNext = now() + <u64>frequencyDays * 86400000;
  Storage.set<string>(kSubNext(subscriber, planId), newNext.toString());

  generateEvent(`PaymentExecuted|${subscriber}|${planId}|${amount.toString()}|${now().toString()}`);

  return new Args().add<bool>(stillActive).serialize();
}

// get_plan(plan_id: string) -> string (JSON)
export function get_plan(argsBytes: StaticArray<u8>): StaticArray<u8> {
  const a = new Args(argsBytes);
  const planId = a.nextString().expect('plan_id is required');
  assert(Storage.has<string>(kPlanCreator(planId)), 'plan not found');
  const json = `{"id":"${planId}","creator":"${Storage.get<string>(kPlanCreator(planId))}","amount":"${Storage.get<string>(kPlanAmount(planId))}","frequency_days":"${Storage.get<string>(kPlanFreq(planId))}","active":${toBool(Storage.get<string>(kPlanActive(planId)))}}`;
  return new Args().add<string>(json).serialize();
}

// get_user_subscriptions(user: string) -> string (CSV plan ids)
export function get_user_subscriptions(argsBytes: StaticArray<u8>): StaticArray<u8> {
  const a = new Args(argsBytes);
  const who = a.nextString().expect('user is required');
  const ids = getIds(kSubsIndex(who));
  return new Args().add<string>(ids.join(',')).serialize();
}