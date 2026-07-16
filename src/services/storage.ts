import AsyncStorage from '@react-native-async-storage/async-storage';

import { GameState } from '@/engine/game-state';

const STORAGE_KEY = 'idle-game:state';

export async function loadGameState(): Promise<GameState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as GameState;
}

export async function saveGameState(state: GameState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
