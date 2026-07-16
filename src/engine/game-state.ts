import { add, BigNumber, compare, fromLog10, fromNumber, multiply, subtract } from './big-number';

export interface GameState {
  value: BigNumber;
  generationRate: BigNumber;
  nextTapAvailableAt: number;
  generatorLevel: number;
  prestigePoints: number;
  isShakeBoostUnlocked: boolean;
  boostActiveUntil: number;
  boostAvailableAt: number;
}

const TAP_AMOUNT = fromNumber(5);
const TAP_COOLDOWN_MS = 1000;

const GENERATOR_BASE_COST_LOG10 = Math.log10(10);
const GENERATOR_COST_GROWTH_LOG10 = Math.log10(1.15);
const GENERATOR_RATE_PER_LEVEL = fromNumber(1);

// TODO: remonter à 100 (1e100, cf spec) une fois le rythme de progression équilibré
const PRESTIGE_THRESHOLD_LOG10 = 8;
const PRESTIGE_MULTIPLIER_PER_POINT = 1;

const SHAKE_BOOST_UNLOCK_COST = fromNumber(200);
const BOOST_MULTIPLIER = 3;
const BOOST_DURATION_MS = 30_000;
const BOOST_COOLDOWN_MS = 60_000;

export function createInitialState(): GameState {
  return {
    value: fromNumber(0),
    generationRate: fromNumber(1),
    nextTapAvailableAt: 0,
    generatorLevel: 0,
    prestigePoints: 0,
    isShakeBoostUnlocked: false,
    boostActiveUntil: 0,
    boostAvailableAt: 0,
  };
}

export function getPrestigeMultiplier(state: GameState): number {
  return 1 + state.prestigePoints * PRESTIGE_MULTIPLIER_PER_POINT;
}

export function isBoostActive(state: GameState, now: number): boolean {
  return now < state.boostActiveUntil;
}

function getBoostMultiplier(state: GameState, now: number): number {
  return isBoostActive(state, now) ? BOOST_MULTIPLIER : 1;
}

export function getEffectiveGenerationRate(state: GameState, now: number): BigNumber {
  return multiply(state.generationRate, getPrestigeMultiplier(state) * getBoostMultiplier(state, now));
}

export function tick(state: GameState, deltaSeconds: number, now: number): GameState {
  return {
    ...state,
    value: add(state.value, multiply(getEffectiveGenerationRate(state, now), deltaSeconds)),
  };
}

export function getShakeBoostUnlockCost(): BigNumber {
  return SHAKE_BOOST_UNLOCK_COST;
}

export function canUnlockShakeBoost(state: GameState): boolean {
  return !state.isShakeBoostUnlocked && compare(state.value, SHAKE_BOOST_UNLOCK_COST) >= 0;
}

export function unlockShakeBoost(state: GameState): GameState {
  if (!canUnlockShakeBoost(state)) {
    return state;
  }

  return {
    ...state,
    value: subtract(state.value, SHAKE_BOOST_UNLOCK_COST),
    isShakeBoostUnlocked: true,
  };
}

export function canTriggerBoost(state: GameState, now: number): boolean {
  return state.isShakeBoostUnlocked && now >= state.boostAvailableAt;
}

export function triggerBoost(state: GameState, now: number): GameState {
  if (!canTriggerBoost(state, now)) {
    return state;
  }

  return {
    ...state,
    boostActiveUntil: now + BOOST_DURATION_MS,
    boostAvailableAt: now + BOOST_COOLDOWN_MS,
  };
}

export function canTap(state: GameState, now: number): boolean {
  return now >= state.nextTapAvailableAt;
}

export function tap(state: GameState, now: number): GameState {
  if (!canTap(state, now)) {
    return state;
  }

  return {
    ...state,
    value: add(state.value, TAP_AMOUNT),
    nextTapAvailableAt: now + TAP_COOLDOWN_MS,
  };
}

export function getGeneratorCost(level: number): BigNumber {
  return fromLog10(GENERATOR_BASE_COST_LOG10 + level * GENERATOR_COST_GROWTH_LOG10);
}

export function canBuyGenerator(state: GameState): boolean {
  return compare(state.value, getGeneratorCost(state.generatorLevel)) >= 0;
}

export function buyGenerator(state: GameState): GameState {
  if (!canBuyGenerator(state)) {
    return state;
  }

  return {
    ...state,
    value: subtract(state.value, getGeneratorCost(state.generatorLevel)),
    generatorLevel: state.generatorLevel + 1,
    generationRate: add(state.generationRate, GENERATOR_RATE_PER_LEVEL),
  };
}

function getValueLog10(value: BigNumber): number {
  if (value.mantissa === 0) {
    return -Infinity;
  }

  return value.exponent + Math.log10(value.mantissa);
}

export function getPrestigeProgress(state: GameState): number {
  return Math.max(0, Math.min(1, getValueLog10(state.value) / PRESTIGE_THRESHOLD_LOG10));
}

export function canPrestige(state: GameState): boolean {
  return getValueLog10(state.value) >= PRESTIGE_THRESHOLD_LOG10;
}

export function getPrestigeGain(state: GameState): number {
  return Math.max(0, getValueLog10(state.value) - PRESTIGE_THRESHOLD_LOG10 + 1);
}

export function prestige(state: GameState): GameState {
  if (!canPrestige(state)) {
    return state;
  }

  return {
    ...createInitialState(),
    prestigePoints: state.prestigePoints + getPrestigeGain(state),
  };
}
