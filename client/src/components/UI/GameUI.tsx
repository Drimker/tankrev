import { useGameState } from "@/lib/stores/useGameState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GameUI() {
  const { gameState, score, lives, setGameState, restartGame } = useGameState();

  if (gameState === 'playing') {
    return (
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <Card className="bg-black bg-opacity-70 border-gray-600">
          <CardContent className="p-3">
            <div className="text-white space-y-1">
              <div className="flex items-center space-x-4">
                <span className="text-yellow-400 font-semibold">Score: {score}</span>
                <span className="text-red-400 font-semibold">Lives: {lives}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
          <CardContent className="p-6 text-center">
            <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over</h2>
            <p className="text-white mb-2">Final Score: {score}</p>
            <p className="text-gray-400 mb-6">Your base was destroyed!</p>
            <div className="space-y-3">
              <Button
                onClick={restartGame}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Play Again
              </Button>
              <Button
                onClick={() => setGameState('menu')}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Main Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'victory') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
          <CardContent className="p-6 text-center">
            <h2 className="text-3xl font-bold text-green-400 mb-4">Victory!</h2>
            <p className="text-white mb-2">Final Score: {score}</p>
            <p className="text-gray-400 mb-6">All enemies defeated!</p>
            <div className="space-y-3">
              <Button
                onClick={restartGame}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Play Again
              </Button>
              <Button
                onClick={() => setGameState('menu')}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Main Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
