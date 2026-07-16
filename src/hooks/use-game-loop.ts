import { useCallback, useEffect, useRef, useState } from 'react';

import {
  canTap as checkCanTap,
  createInitialState,
  GameState,
  tap as applyTap,
  tick,
} from '@/engine/game-state';
import { triggerTapHaptic } from '@/services/haptics';

const TICK_INTERVAL_MS = 100;

export interface GameLoop {
  state: GameState;
  canTap: boolean;
  tap: () => void;
}

export function useGameLoop(): GameLoop {
  const [state, setState] = useState<GameState>(createInitialState);
  const [now, setNow] = useState(() => Date.now());
  const lastTickRef = useRef(now);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const deltaSeconds = (currentTime - lastTickRef.current) / 1000;
      lastTickRef.current = currentTime;
      setState((current) => tick(current, deltaSeconds));
      setNow(currentTime);
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const tapAction = useCallback(() => {
    const currentTime = Date.now();
    if (!checkCanTap(state, currentTime)) {
      return;
    }

    triggerTapHaptic();
    setState((current) => applyTap(current, currentTime));
  }, [state]);

  return {
    state,
    canTap: checkCanTap(state, now),
    tap: tapAction,
  };
}
