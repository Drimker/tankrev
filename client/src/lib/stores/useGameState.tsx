import { create } from "zustand";
import { TankClass, GameState } from "@/lib/game/types";

interface GameStateStore {
  gameState: GameState;
  selectedTankClass: TankClass | null;
  score: number;
  lives: number;
  
  // Actions
  setGameState: (state: GameState) => void;
  setSelectedTankClass: (tankClass: TankClass) => void;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  initializeGame: () => void;
  restartGame: () => void;
}

export const useGameState = create<GameStateStore>((set, get) => ({
  gameState: 'menu',
  selectedTankClass: 'ranger',
  score: 0,
  lives: 3,
  
  setGameState: (state) => set({ gameState: state }),
  setSelectedTankClass: (tankClass) => set({ selectedTankClass: tankClass }),
  setScore: (score) => set({ score }),
  setLives: (lives) => set({ lives }),
  
  initializeGame: () => {
    set({
      gameState: 'menu',
      selectedTankClass: 'ranger',
      score: 0,
      lives: 3
    });
  },
  
  restartGame: () => {
    set({
      gameState: 'playing',
      score: 0,
      lives: 3
    });
  }
}));
