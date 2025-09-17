import { Position, Direction, TankClass } from './types';
import { Tank } from './Tank';

export class Bullet {
  public position: Position;
  public direction: Direction;
  public speed: number;
  public tankClass: TankClass;
  public owner: Tank;
  public size = 4;
  public piercing = 0; // For sniper bullets

  constructor(position: Position, direction: Direction, speed: number, tankClass: TankClass, owner: Tank) {
    this.position = { ...position };
    this.direction = direction;
    this.speed = speed;
    this.tankClass = tankClass;
    this.owner = owner;
    
    // Sniper bullets can pierce 2 layers
    if (tankClass === 'sniper') {
      this.piercing = 2;
    }
  }

  update(deltaTime: number) {
    const moveDistance = this.speed;
    
    switch (this.direction) {
      case 'up':
        this.position.y -= moveDistance;
        break;
      case 'down':
        this.position.y += moveDistance;
        break;
      case 'left':
        this.position.x -= moveDistance;
        break;
      case 'right':
        this.position.x += moveDistance;
        break;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Set bullet color based on tank class
    let color = '#FFFF00'; // Default yellow
    
    switch (this.tankClass) {
      case 'ranger':
        color = '#00FF00'; // Green
        break;
      case 'sniper':
        color = '#FF8800'; // Orange
        break;
      case 'samurai':
        color = '#FF0000'; // Red
        break;
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(
      this.position.x - this.size / 2, 
      this.position.y - this.size / 2, 
      this.size, 
      this.size
    );
    
    // Add glow effect for special bullets
    if (this.piercing > 0) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillRect(
        this.position.x - this.size / 2, 
        this.position.y - this.size / 2, 
        this.size, 
        this.size
      );
    }
    
    ctx.restore();
  }
}
