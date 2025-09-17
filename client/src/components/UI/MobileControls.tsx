import { useEffect, useRef } from "react";
import { useGameState } from "@/lib/stores/useGameState";

export default function MobileControls() {
  const { gameState } = useGameState();
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleTouch = (event: TouchEvent) => {
      event.preventDefault();
    };

    const controls = controlsRef.current;
    if (controls) {
      controls.addEventListener('touchstart', handleTouch, { passive: false });
      controls.addEventListener('touchmove', handleTouch, { passive: false });
      controls.addEventListener('touchend', handleTouch, { passive: false });
    }

    return () => {
      if (controls) {
        controls.removeEventListener('touchstart', handleTouch);
        controls.removeEventListener('touchmove', handleTouch);
        controls.removeEventListener('touchend', handleTouch);
      }
    };
  }, [gameState]);

  if (gameState !== 'playing') return null;

  const buttonClass = "w-16 h-16 bg-gray-800 bg-opacity-70 border-2 border-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-lg active:bg-gray-700 select-none";
  const shootButtonClass = "w-20 h-20 bg-red-800 bg-opacity-70 border-2 border-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl active:bg-red-700 select-none";

  return (
    <div ref={controlsRef} className="absolute inset-0 pointer-events-none">
      {/* Movement Controls */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div className="relative w-48 h-48">
          {/* Up */}
          <button
            className={`${buttonClass} absolute top-0 left-16`}
            data-direction="up"
            onTouchStart={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowUp' }));
            }}
          >
            ↑
          </button>
          
          {/* Left */}
          <button
            className={`${buttonClass} absolute top-16 left-0`}
            data-direction="left"
            onTouchStart={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft' }));
            }}
          >
            ←
          </button>
          
          {/* Right */}
          <button
            className={`${buttonClass} absolute top-16 right-0`}
            data-direction="right"
            onTouchStart={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
            }}
          >
            →
          </button>
          
          {/* Down */}
          <button
            className={`${buttonClass} absolute bottom-0 left-16`}
            data-direction="down"
            onTouchStart={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowDown' }));
            }}
          >
            ↓
          </button>
        </div>
      </div>

      {/* Shoot Button */}
      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <button
          className={shootButtonClass}
          onTouchStart={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
          }}
        >
          🔥
        </button>
      </div>
    </div>
  );
}
