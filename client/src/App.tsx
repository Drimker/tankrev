import { useEffect } from "react";
import Game from "./components/Game";
import "./index.css";

function App() {
  useEffect(() => {
    // Prevent zoom on mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  return (
    <div className="w-full h-full overflow-hidden bg-black">
      <Game />
    </div>
  );
}

export default App;
