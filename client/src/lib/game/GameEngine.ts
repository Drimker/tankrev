import { Tank } from './Tank';
import { Bullet } from './Bullet';
import { GameMap } from './Map';
import { FogOfWar } from './FogOfWar';
import { CollisionSystem } from './CollisionSystem';
import { InputManager } from './InputManager';
import { Explosion } from './Explosion';
import { TankClass, Position, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from './types';
import { useGameState } from '../stores/useGameState';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;
  private lastTime = 0;
  
  private player: Tank;
  private enemies: Tank[] = [];
  private bullets: Bullet[] = [];
  private explosions: Explosion[] = [];
  private gameMap: GameMap;
  private fogOfWar: FogOfWar;
  private collisionSystem: CollisionSystem;
  private inputManager: InputManager;
  
  private onGameOver: () => void;
  private onVictory: () => void;
  private onScoreUpdate: (score: number) => void;
  private onLivesUpdate: (lives: number) => void;
  
  private score = 0;
  private lives = 3;
  private enemySpawnTimer = 0;
  private enemySpawnDelay = 3000; // 3 seconds
  private maxEnemies = 4;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    onGameOver: () => void,
    onVictory: () => void,
    onScoreUpdate: (score: number) => void,
    onLivesUpdate: (lives: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.onGameOver = onGameOver;
    this.onVictory = onVictory;
    this.onScoreUpdate = onScoreUpdate;
    this.onLivesUpdate = onLivesUpdate;
    
    this.gameMap = new GameMap();
    this.collisionSystem = new CollisionSystem(this.gameMap);
    this.inputManager = new InputManager();
    
    // Get selected tank class from store
    const selectedClass = useGameState.getState().selectedTankClass || 'ranger';
    
    // Create player tank
    this.player = new Tank(
      { x: TILE_SIZE * 4, y: TILE_SIZE * (MAP_HEIGHT - 4) },
      selectedClass,
      true,
      'up'
    );
    
    this.fogOfWar = new FogOfWar(MAP_WIDTH, MAP_HEIGHT, TILE_SIZE);
    
    console.log('GameEngine initialized with player class:', selectedClass);
  }

  start() {
    this.running = true;
    this.spawnInitialEnemies();
    this.gameLoop(0);
    console.log('Game started');
  }

  stop() {
    this.running = false;
  }

  destroy() {
    this.stop();
    this.inputManager.destroy();
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private spawnInitialEnemies() {
    const spawnPositions = [
      { x: TILE_SIZE, y: TILE_SIZE },
      { x: TILE_SIZE * 12, y: TILE_SIZE },
      { x: TILE_SIZE * 23, y: TILE_SIZE }
    ];

    spawnPositions.forEach((pos, index) => {
      if (index < 3) {
        const enemy = new Tank(pos, 'ranger', false, 'down');
        enemy.setAI(true);
        this.enemies.push(enemy);
      }
    });
  }

  private spawnEnemy() {
    if (this.enemies.length >= this.maxEnemies) return;

    const spawnPositions = [
      { x: TILE_SIZE, y: TILE_SIZE },
      { x: TILE_SIZE * 12, y: TILE_SIZE },
      { x: TILE_SIZE * 23, y: TILE_SIZE }
    ];

    const availablePositions = spawnPositions.filter(pos => {
      return !this.collisionSystem.checkTankCollision(
        { x: pos.x, y: pos.y, width: TILE_SIZE, height: TILE_SIZE },
        [...this.enemies, this.player]
      );
    });

    if (availablePositions.length > 0) {
      const pos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
      const enemy = new Tank(pos, 'ranger', false, 'down');
      enemy.setAI(true);
      this.enemies.push(enemy);
      console.log('Enemy spawned at:', pos);
    }
  }

  private gameLoop = (currentTime: number) => {
    if (!this.running) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number) {
    // Handle input
    const input = this.inputManager.getInput();
    
    // Update player
    this.player.update(deltaTime, input);
    
    // Handle player shooting
    if (input.shoot && this.player.canShoot()) {
      const bullet = this.player.shoot();
      if (bullet) {
        this.bullets.push(bullet);
        console.log('Player shot bullet');
      }
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, null);
      
      // Enemy AI shooting
      if (enemy.canShoot() && Math.random() < 0.02) {
        const bullet = enemy.shoot();
        if (bullet) {
          this.bullets.push(bullet);
        }
      }
    });

    // Update bullets
    this.bullets = this.bullets.filter(bullet => {
      bullet.update(deltaTime);
      
      // Check if bullet is out of bounds
      if (bullet.position.x < 0 || bullet.position.x > MAP_WIDTH * TILE_SIZE ||
          bullet.position.y < 0 || bullet.position.y > MAP_HEIGHT * TILE_SIZE) {
        return false;
      }

      // Check wall collisions
      if (this.collisionSystem.checkBulletWallCollision(bullet)) {
        console.log('Bullet hit wall');
        // Determine wall type based on position and map tile
        const tileType = this.gameMap.getTile(bullet.position.x, bullet.position.y);
        const explosionType = (tileType === 'brick') ? 'wall_destructible' : 'wall_border';
        this.explosions.push(new Explosion(bullet.position, explosionType));
        return false;
      }

      // Check tank collisions
      const allTanks = [this.player, ...this.enemies];
      for (const tank of allTanks) {
        if (tank !== bullet.owner && this.collisionSystem.checkBulletTankCollision(bullet, tank)) {
          this.handleBulletTankHit(bullet, tank);
          return false;
        }
      }

      return true;
    });

    // Check collisions for tanks
    this.player.position = this.collisionSystem.resolveTankCollision(this.player, [this.player, ...this.enemies]);
    this.enemies.forEach(enemy => {
      enemy.position = this.collisionSystem.resolveTankCollision(enemy, [this.player, ...this.enemies]);
    });

    // Spawn enemies
    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer >= this.enemySpawnDelay) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // Check win condition
    if (this.enemies.length === 0 && this.enemySpawnTimer < this.enemySpawnDelay - 1000) {
      this.onVictory();
    }

    // Update explosions
    this.explosions = this.explosions.filter(explosion => {
      return explosion.update(deltaTime);
    });

    // Check base destruction
    if (this.gameMap.isBaseDestroyed()) {
      this.onGameOver();
    }
  }

  private handleBulletTankHit(bullet: Bullet, tank: Tank) {
    console.log('Bullet hit tank:', tank.isPlayer ? 'player' : 'enemy');
    
    // Create tank explosion at tank position
    const explosionPos = { 
      x: tank.position.x + tank.size / 2, 
      y: tank.position.y + tank.size / 2 
    };
    // Only create explosion for enemy tanks, not player
    if (!tank.isPlayer) {
      this.explosions.push(new Explosion(explosionPos, 'tank_enemy'));
    }
    
    if (tank.isPlayer) {
      // Player hit
      this.lives--;
      this.onLivesUpdate(this.lives);
      
      if (this.lives <= 0) {
        this.onGameOver();
      } else {
        // Respawn player
        this.player.position = { x: TILE_SIZE * 4, y: TILE_SIZE * (MAP_HEIGHT - 4) };
      }
    } else {
      // Enemy hit
      this.score += 100;
      this.onScoreUpdate(this.score);
      
      // Remove enemy
      const enemyIndex = this.enemies.indexOf(tank);
      if (enemyIndex > -1) {
        this.enemies.splice(enemyIndex, 1);
      }
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate camera offset to center on player
    const cameraX = this.player.position.x - this.canvas.width / 2;
    const cameraY = this.player.position.y - this.canvas.height / 2;

    this.ctx.save();
    this.ctx.translate(-cameraX, -cameraY);

    // Render map
    this.gameMap.render(this.ctx);

    // Render tanks
    this.player.render(this.ctx);
    this.enemies.forEach(enemy => enemy.render(this.ctx));

    // Render bullets
    this.bullets.forEach(bullet => bullet.render(this.ctx));

    // Render explosions
    this.explosions.forEach(explosion => explosion.render(this.ctx));

    // Apply fog of war
    this.fogOfWar.update(this.player.position);
    this.fogOfWar.render(this.ctx, cameraX, cameraY, this.canvas.width, this.canvas.height);

    this.ctx.restore();
  }
}
