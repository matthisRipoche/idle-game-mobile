export interface GameState {
  value: number;
  generationRate: number;
}

export function createInitialState(): GameState {
  return {
    value: 0,
    generationRate: 1,
  };
}

export function tick(state: GameState, deltaSeconds: number): GameState {
  return {
    ...state,
    value: state.value + state.generationRate * deltaSeconds,
  };
}
