import { useGameState } from "@/lib/stores/useGameState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MainMenu() {
  const { setGameState, setSelectedTankClass, selectedTankClass } = useGameState();

  const tankClasses = [
    {
      id: 'ranger' as const,
      name: 'Ranger',
      description: 'High speed tank with enhanced mobility',
      color: '#10B981'
    },
    {
      id: 'sniper' as const,
      name: 'Sniper',
      description: 'Can pierce through 2 shield layers',
      color: '#F59E0B'
    },
    {
      id: 'samurai' as const,
      name: 'Samurai',
      description: 'Can reflect bullets every 5 seconds',
      color: '#EF4444'
    }
  ];

  const startGame = () => {
    setGameState('playing');
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Battle City 2D
          </CardTitle>
          <p className="text-gray-300">Choose your tank class</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {tankClasses.map((tankClass) => (
              <button
                key={tankClass.id}
                onClick={() => setSelectedTankClass(tankClass.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedTankClass === tankClass.id
                    ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tankClass.color }}
                  />
                  <div>
                    <h3 className="text-white font-semibold">{tankClass.name}</h3>
                    <p className="text-gray-400 text-sm">{tankClass.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <Button
            onClick={startGame}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            disabled={!selectedTankClass}
          >
            Start Game
          </Button>
          
          <div className="text-center text-sm text-gray-400 space-y-1">
            <p>Controls: WASD or Arrow Keys to move</p>
            <p>Space to shoot</p>
            <p>Protect your base from enemies!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
