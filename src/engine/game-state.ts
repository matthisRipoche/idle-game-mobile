export interface GameState {
  value: number;
  generationRate: number;
  nextTapAvailableAt: number;
}

const TAP_AMOUNT = 5;
const TAP_COOLDOWN_MS = 1000;

export function createInitialState(): GameState {
  return {
    value: 0,
    generationRate: 1,
    nextTapAvailableAt: 0,
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
