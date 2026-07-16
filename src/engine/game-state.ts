export interface GameState {
  value: number;
  generationRate: number;
  nextTapAvailableAt: number;
  generatorLevel: number;
}

const TAP_AMOUNT = 5;
const TAP_COOLDOWN_MS = 1000;

const GENERATOR_BASE_COST = 10;
const GENERATOR_COST_GROWTH = 1.15;
const GENERATOR_RATE_PER_LEVEL = 1;

export function createInitialState(): GameState {
  return {
    value: 0,
    generationRate: 1,
    nextTapAvailableAt: 0,
    generatorLevel: 0,
  };
}

export function tick(state: GameState, deltaSeconds: number): GameState {
  return {
    ...state,
    value: state.value + state.generationRate * deltaSeconds,
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
    value: state.value + TAP_AMOUNT,
    nextTapAvailableAt: now + TAP_COOLDOWN_MS,
  };
}

export function getGeneratorCost(level: number): number {
  return Math.ceil(GENERATOR_BASE_COST * Math.pow(GENERATOR_COST_GROWTH, level));
}

export function canBuyGenerator(state: GameState): boolean {
  return state.value >= getGeneratorCost(state.generatorLevel);
}

export function buyGenerator(state: GameState): GameState {
  if (!canBuyGenerator(state)) {
    return state;
  }

  return {
    ...state,
    value: state.value - getGeneratorCost(state.generatorLevel),
    generatorLevel: state.generatorLevel + 1,
    generationRate: state.generationRate + GENERATOR_RATE_PER_LEVEL,
  };
}
