import { useEffect, useRef, useCallback } from "react";
import { useGameState } from "@/lib/stores/useGameState";
import { GameEngine } from "@/lib/game/GameEngine";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { gameState, setGameState, score, setScore, lives, setLives } = useGameState();

  const handleGameOver = useCallback(() => {
    setGameState('gameOver');
  }, [setGameState]);

  const handleVictory = useCallback(() => {
    setGameState('victory');
  }, [setGameState]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, [setScore]);

  const handleLivesUpdate = useCallback((newLives: number) => {
    setLives(newLives);
  }, [setLives]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Initialize or update game engine
        if (!gameEngineRef.current && gameState === 'playing') {
          gameEngineRef.current = new GameEngine(
            canvas,
            ctx,
            handleGameOver,
            handleVictory,
            handleScoreUpdate,
            handleLivesUpdate
          );
          gameEngineRef.current.start();
        } else if (gameEngineRef.current) {
          gameEngineRef.current.resize(canvas.width, canvas.height);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
    };
  }, [gameState, handleGameOver, handleVictory, handleScoreUpdate, handleLivesUpdate]);

  // Handle game state changes
  useEffect(() => {
    if (gameState === 'playing' && !gameEngineRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        gameEngineRef.current = new GameEngine(
          canvasRef.current,
          ctx,
          handleGameOver,
          handleVictory,
          handleScoreUpdate,
          handleLivesUpdate
        );
        gameEngineRef.current.start();
      }
    } else if (gameState !== 'playing' && gameEngineRef.current) {
      gameEngineRef.current.destroy();
      gameEngineRef.current = null;
    }
  }, [gameState, handleGameOver, handleVictory, handleScoreUpdate, handleLivesUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full bg-black"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
