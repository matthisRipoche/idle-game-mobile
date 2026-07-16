import { add, BigNumber, compare, fromLog10, fromNumber, multiply, subtract } from './big-number';

export interface GameState {
  value: BigNumber;
  generationRate: BigNumber;
  nextTapAvailableAt: number;
  generatorLevel: number;
}

const TAP_AMOUNT = fromNumber(5);
const TAP_COOLDOWN_MS = 1000;

const GENERATOR_BASE_COST_LOG10 = Math.log10(10);
const GENERATOR_COST_GROWTH_LOG10 = Math.log10(1.15);
const GENERATOR_RATE_PER_LEVEL = fromNumber(1);

export function createInitialState(): GameState {
  return {
    value: fromNumber(0),
    generationRate: fromNumber(1),
    nextTapAvailableAt: 0,
    generatorLevel: 0,
  };
}

export function tick(state: GameState, deltaSeconds: number): GameState {
  return {
    ...state,
    value: add(state.value, multiply(state.generationRate, deltaSeconds)),
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
