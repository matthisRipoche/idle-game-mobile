import { useCallback, useEffect, useRef, useState } from 'react';

import { BigNumber } from '@/engine/big-number';
import {
  buyGenerator as applyBuyGenerator,
  buyMaxGenerator as applyBuyMaxGenerator,
  buyMaxMultiplier as applyBuyMaxMultiplier,
  buyMultiplier as applyBuyMultiplier,
  canBuyGenerator,
  canBuyMultiplier,
  canPrestige,
  canTap as checkCanTap,
  canTriggerBoost,
  canUnlockShakeBoost,
  createInitialState,
  GameState,
  getEffectiveGenerationRate,
  getGeneratorCost,
  getMaxAffordableGeneratorLevels,
  getMaxAffordableMultiplierLevels,
  getMultiplierCost,
  getPrestigeMultiplier,
  getPrestigeProgress,
  getShakeBoostUnlockCost,
  isBoostActive,
  prestige as applyPrestige,
  tap as applyTap,
  tick,
  triggerBoost as applyTriggerBoost,
  unlockShakeBoost as applyUnlockShakeBoost,
} from '@/engine/game-state';
import {
  triggerBoostHaptic,
  triggerPrestigeHaptic,
  triggerPurchaseHaptic,
  triggerTapHaptic,
} from '@/services/haptics';
import { subscribeToShake } from '@/services/motion';
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
  maxAffordableGeneratorLevels: number;
  buyMaxGenerator: () => void;
  multiplierCost: BigNumber;
  canBuyMultiplier: boolean;
  buyMultiplier: () => void;
  maxAffordableMultiplierLevels: number;
  buyMaxMultiplier: () => void;
  effectiveGenerationRate: BigNumber;
  prestigeMultiplier: number;
  prestigeProgress: number;
  canPrestige: boolean;
  prestige: () => void;
  shakeBoostUnlockCost: BigNumber;
  canUnlockShakeBoost: boolean;
  unlockShakeBoost: () => void;
  isBoostActive: boolean;
  boostRemainingSeconds: number;
}

export function useGameLoop(): GameLoop {
  const [state, setState] = useState<GameState>(createInitialState);
  const [now, setNow] = useState(() => Date.now());
  const lastTickRef = useRef(now);
  const lastSaveRef = useRef(now);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
      setState((current) => tick(current, deltaSeconds, currentTime));
      setNow(currentTime);
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!state.isShakeBoostUnlocked) {
      return;
    }

    return subscribeToShake(() => {
      const currentTime = Date.now();
      if (!canTriggerBoost(stateRef.current, currentTime)) {
        return;
      }

      triggerBoostHaptic();
      setState((current) => applyTriggerBoost(current, currentTime));
    });
  }, [state.isShakeBoostUnlocked]);

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

  const buyMaxGeneratorAction = useCallback(() => {
    if (getMaxAffordableGeneratorLevels(state) <= 0) {
      return;
    }

    triggerPurchaseHaptic();
    setState((current) => applyBuyMaxGenerator(current));
  }, [state]);

  const buyMultiplierAction = useCallback(() => {
    if (!canBuyMultiplier(state)) {
      return;
    }

    triggerPurchaseHaptic();
    setState((current) => applyBuyMultiplier(current));
  }, [state]);

  const buyMaxMultiplierAction = useCallback(() => {
    if (getMaxAffordableMultiplierLevels(state) <= 0) {
      return;
    }

    triggerPurchaseHaptic();
    setState((current) => applyBuyMaxMultiplier(current));
  }, [state]);

  const prestigeAction = useCallback(() => {
    if (!canPrestige(state)) {
      return;
    }

    triggerPrestigeHaptic();
    setState((current) => applyPrestige(current));
  }, [state]);

  const unlockShakeBoostAction = useCallback(() => {
    if (!canUnlockShakeBoost(state)) {
      return;
    }

    triggerPurchaseHaptic();
    setState((current) => applyUnlockShakeBoost(current));
  }, [state]);

  return {
    state,
    canTap: checkCanTap(state, now),
    tap: tapAction,
    generatorCost: getGeneratorCost(state.generatorLevel),
    canBuyGenerator: canBuyGenerator(state),
    buyGenerator: buyGeneratorAction,
    maxAffordableGeneratorLevels: getMaxAffordableGeneratorLevels(state),
    buyMaxGenerator: buyMaxGeneratorAction,
    multiplierCost: getMultiplierCost(state.multiplierLevel),
    canBuyMultiplier: canBuyMultiplier(state),
    buyMultiplier: buyMultiplierAction,
    maxAffordableMultiplierLevels: getMaxAffordableMultiplierLevels(state),
    buyMaxMultiplier: buyMaxMultiplierAction,
    effectiveGenerationRate: getEffectiveGenerationRate(state, now),
    prestigeMultiplier: getPrestigeMultiplier(state),
    prestigeProgress: getPrestigeProgress(state),
    canPrestige: canPrestige(state),
    prestige: prestigeAction,
    shakeBoostUnlockCost: getShakeBoostUnlockCost(),
    canUnlockShakeBoost: canUnlockShakeBoost(state),
    unlockShakeBoost: unlockShakeBoostAction,
    isBoostActive: isBoostActive(state, now),
    boostRemainingSeconds: Math.max(0, Math.ceil((state.boostActiveUntil - now) / 1000)),
  };
}
