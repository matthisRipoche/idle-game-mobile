import { useCallback, useEffect, useRef, useState } from 'react';

import { BigNumber } from '@/engine/big-number';
import {
  buyGenerator as applyBuyGenerator,
  canBuyGenerator,
  canPrestige,
  canTap as checkCanTap,
  createInitialState,
  GameState,
  getEffectiveGenerationRate,
  getGeneratorCost,
  getPrestigeMultiplier,
  getPrestigeProgress,
  prestige as applyPrestige,
  tap as applyTap,
  tick,
} from '@/engine/game-state';
import { triggerPrestigeHaptic, triggerPurchaseHaptic, triggerTapHaptic } from '@/services/haptics';
import { loadGameState, saveGameState } from '@/services/storage';

const TICK_INTERVAL_MS = 100;
const SAVE_INTERVAL_MS = 5000;

export interface GameLoop {
  state: GameState;
  canTap: boolean;
  tap: () => void;
  generatorCost: BigNumber;
  canBuyGenerator: boolean;
  buyGenerator: () => void;
  effectiveGenerationRate: BigNumber;
  prestigeMultiplier: number;
  prestigeProgress: number;
  canPrestige: boolean;
  prestige: () => void;
}

export function useGameLoop(): GameLoop {
  const [state, setState] = useState<GameState>(createInitialState);
  const [now, setNow] = useState(() => Date.now());
  const lastTickRef = useRef(now);
  const lastSaveRef = useRef(now);

  useEffect(() => {
    let isMounted = true;

    loadGameState().then((saved) => {
      if (isMounted && saved) {
        setState(saved);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const currentTime = Date.now();
    if (currentTime - lastSaveRef.current < SAVE_INTERVAL_MS) {
      return;
    }

    lastSaveRef.current = currentTime;
    saveGameState(state);
  }, [state]);

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

  const buyGeneratorAction = useCallback(() => {
    if (!canBuyGenerator(state)) {
      return;
    }

    triggerPurchaseHaptic();
    setState((current) => applyBuyGenerator(current));
  }, [state]);

  const prestigeAction = useCallback(() => {
    if (!canPrestige(state)) {
      return;
    }

    triggerPrestigeHaptic();
    setState((current) => applyPrestige(current));
  }, [state]);

  return {
    state,
    canTap: checkCanTap(state, now),
    tap: tapAction,
    generatorCost: getGeneratorCost(state.generatorLevel),
    canBuyGenerator: canBuyGenerator(state),
    buyGenerator: buyGeneratorAction,
    effectiveGenerationRate: getEffectiveGenerationRate(state),
    prestigeMultiplier: getPrestigeMultiplier(state),
    prestigeProgress: getPrestigeProgress(state),
    canPrestige: canPrestige(state),
    prestige: prestigeAction,
  };
}
