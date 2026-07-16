import { add, BigNumber, compare, fromLog10, fromNumber, multiply, subtract } from './big-number';

export interface GameState {
  value: BigNumber;
  generationRate: BigNumber;
  nextTapAvailableAt: number;
  generatorLevel: number;
  multiplierLevel: number;
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

const MULTIPLIER_BASE_COST_LOG10 = Math.log10(50);
const MULTIPLIER_COST_GROWTH_LOG10 = Math.log10(1.4);
const MULTIPLIER_FACTOR_PER_LEVEL = 1.5;

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
    multiplierLevel: 0,
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

function getMultiplierUpgradeFactor(state: GameState): number {
  return Math.pow(MULTIPLIER_FACTOR_PER_LEVEL, state.multiplierLevel);
}

export function getEffectiveGenerationRate(state: GameState, now: number): BigNumber {
  const multiplier =
    getPrestigeMultiplier(state) * getMultiplierUpgradeFactor(state) * getBoostMultiplier(state, now);
  return multiply(state.generationRate, multiplier);
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

// Résout combien de niveaux d'un coût géométrique (base * growth^level) sont
// affordables avec `value`, en espace log10 pour rester stable même à très
// grande échelle (évite d'exponentier des valeurs qui débordent un double).
function getMaxAffordableLevels(
  value: BigNumber,
  currentLevel: number,
  baseLog10: number,
  growthLog10: number,
): number {
  const valueLog10 = getValueLog10(value);
  const costAtCurrentLevelLog10 = baseLog10 + currentLevel * growthLog10;
  const ratioLog10 = valueLog10 - costAtCurrentLevelLog10;

  if (ratioLog10 < 0) {
    return 0;
  }

  const growthFactor = Math.pow(10, growthLog10);
  const growthMinusOneLog10 = Math.log10(growthFactor - 1);

  const sumLog10 =
    ratioLog10 > 20
      ? ratioLog10 + growthMinusOneLog10
      : Math.log10(Math.pow(10, ratioLog10) * (growthFactor - 1) + 1);

  return Math.max(0, Math.floor(sumLog10 / growthLog10 + 1e-9));
}

function getBulkCost(currentLevel: number, count: number, baseLog10: number, growthLog10: number): BigNumber {
  if (count <= 0) {
    return fromNumber(0);
  }

  const growthFactor = Math.pow(10, growthLog10);
  const growthMinusOneLog10 = Math.log10(growthFactor - 1);
  const powLog10 = count * growthLog10;

  const seriesFactorLog10 =
    powLog10 > 20
      ? powLog10 - growthMinusOneLog10
      : Math.log10((Math.pow(growthFactor, count) - 1) / (growthFactor - 1));

  return fromLog10(baseLog10 + currentLevel * growthLog10 + seriesFactorLog10);
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

export function getMaxAffordableGeneratorLevels(state: GameState): number {
  return getMaxAffordableLevels(
    state.value,
    state.generatorLevel,
    GENERATOR_BASE_COST_LOG10,
    GENERATOR_COST_GROWTH_LOG10,
  );
}

export function buyMaxGenerator(state: GameState): GameState {
  const count = getMaxAffordableGeneratorLevels(state);
  if (count <= 0) {
    return state;
  }

  const cost = getBulkCost(state.generatorLevel, count, GENERATOR_BASE_COST_LOG10, GENERATOR_COST_GROWTH_LOG10);
  return {
    ...state,
    value: subtract(state.value, cost),
    generatorLevel: state.generatorLevel + count,
    generationRate: add(state.generationRate, multiply(GENERATOR_RATE_PER_LEVEL, count)),
  };
}

export function getMultiplierCost(level: number): BigNumber {
  return fromLog10(MULTIPLIER_BASE_COST_LOG10 + level * MULTIPLIER_COST_GROWTH_LOG10);
}

export function canBuyMultiplier(state: GameState): boolean {
  return compare(state.value, getMultiplierCost(state.multiplierLevel)) >= 0;
}

export function buyMultiplier(state: GameState): GameState {
  if (!canBuyMultiplier(state)) {
    return state;
  }

  return {
    ...state,
    value: subtract(state.value, getMultiplierCost(state.multiplierLevel)),
    multiplierLevel: state.multiplierLevel + 1,
  };
}

export function getMaxAffordableMultiplierLevels(state: GameState): number {
  return getMaxAffordableLevels(
    state.value,
    state.multiplierLevel,
    MULTIPLIER_BASE_COST_LOG10,
    MULTIPLIER_COST_GROWTH_LOG10,
  );
}

export function buyMaxMultiplier(state: GameState): GameState {
  const count = getMaxAffordableMultiplierLevels(state);
  if (count <= 0) {
    return state;
  }

  const cost = getBulkCost(state.multiplierLevel, count, MULTIPLIER_BASE_COST_LOG10, MULTIPLIER_COST_GROWTH_LOG10);
  return {
    ...state,
    value: subtract(state.value, cost),
    multiplierLevel: state.multiplierLevel + count,
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
