export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
}

export class InputManager {
  private keys: Set<string> = new Set();
  private inputState: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false
  };

  constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    this.keys.add(event.code);
    this.updateInputState();
    console.log('Key down:', event.code);
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
    this.updateInputState();
    console.log('Key up:', event.code);
  };

  private updateInputState() {
    this.inputState.up = this.keys.has('KeyW') || this.keys.has('ArrowUp');
    this.inputState.down = this.keys.has('KeyS') || this.keys.has('ArrowDown');
    this.inputState.left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    this.inputState.right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    this.inputState.shoot = this.keys.has('Space');
  }

  getInput(): InputState {
    return { ...this.inputState };
  }
}
