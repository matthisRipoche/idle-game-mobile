import { createContext, ReactNode, useContext } from 'react';

import { GameLoop, useGameLoop } from './use-game-loop';

const GameLoopContext = createContext<GameLoop | null>(null);

export function GameLoopProvider({ children }: { children: ReactNode }) {
  const gameLoop = useGameLoop();
  return <GameLoopContext.Provider value={gameLoop}>{children}</GameLoopContext.Provider>;
}

export function useGame(): GameLoop {
  const context = useContext(GameLoopContext);
  if (!context) {
    throw new Error('useGame must be used within a GameLoopProvider');
  }
  return context;
}
