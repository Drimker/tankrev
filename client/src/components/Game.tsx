import { useEffect, useRef } from "react";
import { useGameState } from "@/lib/stores/useGameState";
import GameCanvas from "./GameCanvas";
import MainMenu from "./UI/MainMenu";
import GameUI from "./UI/GameUI";
import MobileControls from "./UI/MobileControls";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function Game() {
  const { gameState, initializeGame } = useGameState();
  const isMobile = useIsMobile();
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div 
      ref={gameRef}
      className="relative w-full h-full bg-black overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      {gameState === 'menu' && <MainMenu />}
      
      {(gameState === 'playing' || gameState === 'gameOver' || gameState === 'victory') && (
        <>
          <GameCanvas />
          <GameUI />
          {isMobile && <MobileControls />}
        </>
      )}
    </div>
  );
}
