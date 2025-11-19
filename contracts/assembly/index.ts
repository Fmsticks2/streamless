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
// add imports for scheduling and coins
import { currentPeriod, currentThread } from '@massalabs/massa-as-sdk/assembly/std/context';
import { Address } from '@massalabs/massa-as-sdk/assembly/std/address';
import { sendMessage } from '@massalabs/massa-as-sdk/assembly/std/contract/calls';
import { transferCoins, balance } from '@massalabs/massa-as-sdk/assembly/std/coins';

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
// deposit ledger per subscriber
function kDeposit(addr: string): string { return `deposit:${addr}`; }

// Scheduling and fees constants
const ESTIMATED_SLOT_MS: u64 = 10000; // 10s
const DRIFT_PERIODS: u64 = 10; // tolerance range
const MAX_GAS: u64 = 5_000_000_000; // conservative gas limit
const RAW_FEE: u64 = 100_000; // base fee for message priority

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
    if (unchecked(ids[i]) == id) return;
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
  const firstPay = now() + <u64>frequencyDays * 86400 * 1000;
  Storage.set<string>(kSubNext(subscriber, planId), firstPay.toString());
  if (hasCycles) Storage.set<string>(kSubRemain(subscriber, planId), cycles.toString());

  pushUniqueId(kSubsIndex(subscriber), planId);

  // Schedule autonomous execution at the due time
  const delayMs: u64 = firstPay > now() ? firstPay - now() : 0;
  // convert delay to periods using an estimated slot duration
  let startPeriod = currentPeriod() + (delayMs / ESTIMATED_SLOT_MS) + 1;
  let endPeriod = startPeriod + DRIFT_PERIODS;
  const thread = currentThread();
  const params = new Args()
    .add<string>(subscriber)
    .add<string>(planId)
    .serialize();
  sendMessage(
    Context.callee(),
    'execute_payment',
    startPeriod,
    thread,
    endPeriod,
    thread,
    MAX_GAS,
    RAW_FEE,
    0, // no coins sent
    params,
  );

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

  const amount = parseU64Strict(Storage.get<string>(kPlanAmount(planId)));
  const creator = Storage.get<string>(kPlanCreator(planId));

  // MASS transfer using deposit ledger: subscriber pre-deposits funds to this contract
  const depKey = kDeposit(subscriber);
  const available: u64 = Storage.has<string>(depKey) ? parseU64Strict(Storage.get<string>(depKey)) : 0;
  let success = false;
  if (available >= amount && balance() >= amount) {
    // debit internal ledger
    const newBal = available - amount;
    Storage.set<string>(depKey, newBal.toString());
    // transfer from contract balance to creator
    transferCoins(new Address(creator), amount);
    success = true;
  }

  // Update remaining cycles only if transfer succeeded
  if (success && Storage.has<string>(kSubRemain(subscriber, planId))) {
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

  if (stillActive) {
    // schedule again for next due date
    const delayMs: u64 = newNext > now() ? newNext - now() : 0;
    let startPeriod = currentPeriod() + (delayMs / ESTIMATED_SLOT_MS) + 1;
    let endPeriod = startPeriod + DRIFT_PERIODS;
    const thread = currentThread();
    const params = new Args().add<string>(subscriber).add<string>(planId).serialize();
    sendMessage(
      Context.callee(),
      'execute_payment',
      startPeriod,
      thread,
      endPeriod,
      thread,
      MAX_GAS,
      RAW_FEE,
      0,
      params,
    );
  }

  generateEvent(`PaymentExecuted|${subscriber}|${planId}|${amount.toString()}|${now().toString()}|${success ? 'ok' : 'insufficient'}`);

  return new Args().add<bool>(success && stillActive).serialize();
}

// List all plan IDs (CSV "|")
export function list_plans(_args: StaticArray<u8>): StaticArray<u8> {
  const csv = getIds(kPlanIds()).join('|');
  return new Args().add<string>(csv).serialize();
}

// Return subscription details as JSON
// get_subscription(subscriber: string, plan_id: string) -> string
export function get_subscription(argsBytes: StaticArray<u8>): StaticArray<u8> {
  const a = new Args(argsBytes);
  const subscriber = a.nextString().expect('subscriber required');
  const planId = a.nextString().expect('plan_id required');

  const active = Storage.has<string>(kSubActive(subscriber, planId)) && toBool(Storage.get<string>(kSubActive(subscriber, planId)));
  const next = Storage.has<string>(kSubNext(subscriber, planId)) ? Storage.get<string>(kSubNext(subscriber, planId)) : '0';
  const remain = Storage.has<string>(kSubRemain(subscriber, planId)) ? Storage.get<string>(kSubRemain(subscriber, planId)) : '';
  const remPart = remain.length ? `,"remaining_cycles":"${remain}"` : '';
  const json = `{"subscriber":"${subscriber}","plan_id":"${planId}","next_payment_time":"${next}","active":${active}${remPart}}`;
  return new Args().add<string>(json).serialize();
}

// Allow users to deposit/withdraw MASS into/from this contract for autonomous payments
export function deposit(_args: StaticArray<u8>): StaticArray<u8> {
  const coins = Context.transferredCoins();
  assert(coins > 0, 'no coins transferred');
  const who = Context.caller().toString();
  const key = kDeposit(who);
  const cur: u64 = Storage.has<string>(key) ? parseU64Strict(Storage.get<string>(key)) : 0;
  const next: u64 = cur + coins;
  Storage.set<string>(key, next.toString());
  generateEvent(`Deposit|${who}|${coins.toString()}`);
  return new Args().add<bool>(true).serialize();
}

export function withdraw(argsBytes: StaticArray<u8>): StaticArray<u8> {
  const a = new Args(argsBytes);
  const amount = a.nextU64().expect('amount required');
  const who = Context.caller().toString();
  const key = kDeposit(who);
  const cur: u64 = Storage.has<string>(key) ? parseU64Strict(Storage.get<string>(key)) : 0;
  assert(cur >= amount, 'insufficient deposit');
  assert(balance() >= amount, 'contract underfunded');
  const next: u64 = cur - amount;
  Storage.set<string>(key, next.toString());
  transferCoins(new Address(who), amount);
  generateEvent(`Withdraw|${who}|${amount.toString()}`);
  return new Args().add<bool>(true).serialize();
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