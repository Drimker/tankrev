import { Position, Direction, TankClass, TANK_CONFIGS, TILE_SIZE } from './types';
import { Bullet } from './Bullet';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
}

export class Tank {
  public position: Position;
  public previousPosition: Position;
  public direction: Direction;
  public tankClass: TankClass;
  public isPlayer: boolean;
  public size = TILE_SIZE;
  
  private config: typeof TANK_CONFIGS[TankClass];
  private lastShot = 0;
  private isAI = false;
  private aiTimer = 0;
  private aiDirection: Direction = 'down';
  private samuraiReflectTimer = 0;
  private samuraiReflectCooldown = 5000; // 5 seconds

  constructor(position: Position, tankClass: TankClass, isPlayer: boolean, direction: Direction = 'up') {
    this.position = { ...position };
    this.previousPosition = { ...position };
    this.tankClass = tankClass;
    this.isPlayer = isPlayer;
    this.direction = direction;
    this.config = TANK_CONFIGS[tankClass];
    
    console.log(`Tank created - Class: ${tankClass}, Player: ${isPlayer}, Position:`, position);
  }

  setAI(enabled: boolean) {
    this.isAI = enabled;
  }

  update(deltaTime: number, input: InputState | null) {
    if (this.isAI) {
      this.updateAI(deltaTime);
    } else if (input) {
      this.updatePlayer(deltaTime, input);
    }

    // Update samurai reflect timer
    if (this.tankClass === 'samurai') {
      this.samuraiReflectTimer += deltaTime;
    }
  }

  private updatePlayer(deltaTime: number, input: InputState) {
    const speed = this.config.speed;
    // Save previous position before moving
    this.previousPosition = { ...this.position };

    if (input.up) {
      this.direction = 'up';
      this.position.y -= speed;
    } else if (input.down) {
      this.direction = 'down';
      this.position.y += speed;
    } else if (input.left) {
      this.direction = 'left';
      this.position.x -= speed;
    } else if (input.right) {
      this.direction = 'right';
      this.position.x += speed;
    }

    // Keep tank in bounds
    this.position.x = Math.max(0, Math.min(this.position.x, (25 * TILE_SIZE) - this.size));
    this.position.y = Math.max(0, Math.min(this.position.y, (19 * TILE_SIZE) - this.size));
  }

  private updateAI(deltaTime: number) {
    this.aiTimer += deltaTime;
    
    // Change direction every 2-4 seconds
    if (this.aiTimer > 2000 + Math.random() * 2000) {
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      this.aiDirection = directions[Math.floor(Math.random() * directions.length)];
      this.aiTimer = 0;
    }

    // Save previous position before moving
    this.previousPosition = { ...this.position };
    
    // Move in AI direction
    const speed = this.config.speed * 0.7; // AI moves slightly slower
    this.direction = this.aiDirection;

    switch (this.aiDirection) {
      case 'up':
        this.position.y -= speed;
        break;
      case 'down':
        this.position.y += speed;
        break;
      case 'left':
        this.position.x -= speed;
        break;
      case 'right':
        this.position.x += speed;
        break;
    }

    // Keep tank in bounds
    this.position.x = Math.max(0, Math.min(this.position.x, (25 * TILE_SIZE) - this.size));
    this.position.y = Math.max(0, Math.min(this.position.y, (19 * TILE_SIZE) - this.size));
  }

  canShoot(): boolean {
    const now = Date.now();
    return now - this.lastShot >= this.config.fireRate;
  }

  shoot(): Bullet | null {
    if (!this.canShoot()) return null;

    this.lastShot = Date.now();
    
    // Calculate bullet starting position based on tank direction
    let bulletX = this.position.x + this.size / 2;
    let bulletY = this.position.y + this.size / 2;

    switch (this.direction) {
      case 'up':
        bulletY = this.position.y;
        break;
      case 'down':
        bulletY = this.position.y + this.size;
        break;
      case 'left':
        bulletX = this.position.x;
        break;
      case 'right':
        bulletX = this.position.x + this.size;
        break;
    }

    return new Bullet(
      { x: bulletX, y: bulletY },
      this.direction,
      this.config.bulletSpeed,
      this.tankClass,
      this
    );
  }

  canReflect(): boolean {
    return this.tankClass === 'samurai' && this.samuraiReflectTimer >= this.samuraiReflectCooldown;
  }

  reflect(): boolean {
    if (!this.canReflect()) return false;
    
    this.samuraiReflectTimer = 0;
    console.log('Samurai reflected bullet!');
    return true;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Set tank colors based on class and player status
    let primaryColor = '#00FF00'; // Default green
    let secondaryColor = '#008800';
    let trackColor = '#444444';
    let turretColor = '#333333';
    
    if (this.isPlayer) {
      switch (this.tankClass) {
        case 'ranger':
          primaryColor = '#10B981'; // Green
          secondaryColor = '#059669';
          break;
        case 'sniper':
          primaryColor = '#F59E0B'; // Yellow
          secondaryColor = '#D97706';
          break;
        case 'samurai':
          primaryColor = '#EF4444'; // Red
          secondaryColor = '#DC2626';
          break;
      }
    } else {
      primaryColor = '#FF4444'; // Red for enemies
      secondaryColor = '#CC2222';
    }

    const centerX = this.position.x + this.size / 2;
    const centerY = this.position.y + this.size / 2;
    const tankWidth = this.size * 0.9;
    const tankHeight = this.size * 0.9;
    const tankX = this.position.x + (this.size - tankWidth) / 2;
    const tankY = this.position.y + (this.size - tankHeight) / 2;

    // Draw tank tracks (treads)
    this.drawTracks(ctx, tankX, tankY, tankWidth, tankHeight, trackColor);
    
    // Draw main tank body
    this.drawTankBody(ctx, tankX, tankY, tankWidth, tankHeight, primaryColor, secondaryColor);
    
    // Draw turret
    this.drawTurret(ctx, centerX, centerY, turretColor, primaryColor);
    
    // Draw barrel based on direction and tank class
    this.drawBarrel(ctx, centerX, centerY);
    
    // Draw class-specific details
    this.drawClassDetails(ctx, tankX, tankY, tankWidth, tankHeight, primaryColor);
    
    // Draw tank outline
    ctx.strokeStyle = this.isPlayer ? '#FFFFFF' : '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tankX, tankY, tankWidth, tankHeight);

    // Draw special ability indicator for player
    if (this.isPlayer && this.tankClass === 'samurai' && this.canReflect()) {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(this.position.x - 2, this.position.y - 2, this.size + 4, 3);
      ctx.fillRect(this.position.x - 2, this.position.y + this.size - 1, this.size + 4, 3);
    }
    
    ctx.restore();
  }

  private drawTracks(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, trackColor: string) {
    const trackWidth = width * 0.15;
    const trackHeight = height * 0.95;
    const trackY = y + (height - trackHeight) / 2;
    
    // Left track
    ctx.fillStyle = trackColor;
    ctx.fillRect(x - trackWidth * 0.3, trackY, trackWidth, trackHeight);
    
    // Right track  
    ctx.fillRect(x + width - trackWidth * 0.7, trackY, trackWidth, trackHeight);
    
    // Draw track details (road wheels)
    ctx.fillStyle = '#666666';
    const wheelSize = trackWidth * 0.4;
    const wheelSpacing = trackHeight / 5;
    
    for (let i = 0; i < 4; i++) {
      const wheelY = trackY + wheelSpacing + (i * wheelSpacing);
      // Left track wheels
      ctx.fillRect(x - trackWidth * 0.1 - wheelSize / 2, wheelY - wheelSize / 2, wheelSize, wheelSize);
      // Right track wheels
      ctx.fillRect(x + width - trackWidth * 0.4 - wheelSize / 2, wheelY - wheelSize / 2, wheelSize, wheelSize);
    }
  }

  private drawTankBody(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, primaryColor: string, secondaryColor: string) {
    // Main hull
    ctx.fillStyle = primaryColor;
    const hullWidth = width * 0.8;
    const hullHeight = height * 0.8;
    const hullX = x + (width - hullWidth) / 2;
    const hullY = y + (height - hullHeight) / 2;
    
    ctx.fillRect(hullX, hullY, hullWidth, hullHeight);
    
    // Hull details (front armor sloping)
    ctx.fillStyle = secondaryColor;
    const frontHeight = hullHeight * 0.3;
    ctx.fillRect(hullX, hullY, hullWidth, frontHeight);
    
    // Side armor panels
    const sideWidth = hullWidth * 0.1;
    ctx.fillRect(hullX, hullY + frontHeight, sideWidth, hullHeight - frontHeight);
    ctx.fillRect(hullX + hullWidth - sideWidth, hullY + frontHeight, sideWidth, hullHeight - frontHeight);
  }

  private drawTurret(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, turretColor: string, primaryColor: string) {
    const turretRadius = this.size * 0.25;
    
    // Turret ring
    ctx.fillStyle = turretColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, turretRadius + 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Main turret
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, turretRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Turret outline
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawBarrel(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
    ctx.fillStyle = '#555555';
    
    // Barrel dimensions vary by class
    let barrelLength = this.size * 0.7;
    let barrelWidth = 3;
    
    switch (this.tankClass) {
      case 'sniper':
        barrelLength = this.size * 0.9; // Longer barrel for sniper
        barrelWidth = 2;
        break;
      case 'ranger':
        barrelLength = this.size * 0.6; // Shorter, wider barrel
        barrelWidth = 4;
        break;
      case 'samurai':
        barrelLength = this.size * 0.65;
        barrelWidth = 3.5;
        break;
    }
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Rotate based on direction
    switch (this.direction) {
      case 'up':
        ctx.rotate(-Math.PI / 2);
        break;
      case 'down':
        ctx.rotate(Math.PI / 2);
        break;
      case 'left':
        ctx.rotate(Math.PI);
        break;
      case 'right':
        // No rotation needed
        break;
    }
    
    // Draw barrel
    ctx.fillRect(0, -barrelWidth / 2, barrelLength, barrelWidth);
    
    // Barrel tip
    ctx.fillStyle = '#333333';
    ctx.fillRect(barrelLength - 2, -barrelWidth / 2 - 1, 4, barrelWidth + 2);
    
    ctx.restore();
  }

  private drawClassDetails(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, primaryColor: string) {
    ctx.fillStyle = '#FFD700'; // Gold details
    
    switch (this.tankClass) {
      case 'ranger':
        // Speed stripes
        const stripeHeight = 2;
        for (let i = 0; i < 3; i++) {
          const stripeY = y + height * 0.2 + (i * 6);
          ctx.fillRect(x + width * 0.1, stripeY, width * 0.3, stripeHeight);
        }
        break;
        
      case 'sniper':
        // Scope/targeting system
        ctx.fillRect(x + width * 0.4, y + height * 0.1, width * 0.2, 3);
        ctx.fillRect(x + width * 0.45, y + height * 0.05, width * 0.1, 8);
        break;
        
      case 'samurai':
        // Samurai emblems
        if (this.isPlayer) {
          ctx.fillStyle = '#FFD700';
          // Draw simple samurai symbol
          ctx.fillRect(x + width * 0.2, y + height * 0.15, width * 0.1, 3);
          ctx.fillRect(x + width * 0.7, y + height * 0.15, width * 0.1, 3);
        }
        break;
    }
  }
}
