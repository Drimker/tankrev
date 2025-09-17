import { Position, TILE_SIZE } from './types';

export class FogOfWar {
  private width: number;
  private height: number;
  private tileSize: number;
  private visibilityMap: boolean[][];
  private visibilityRadius = 4; // tiles

  constructor(mapWidth: number, mapHeight: number, tileSize: number) {
    this.width = mapWidth;
    this.height = mapHeight;
    this.tileSize = tileSize;
    this.visibilityMap = this.createVisibilityMap();
  }

  private createVisibilityMap(): boolean[][] {
    const map: boolean[][] = [];
    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        map[y][x] = false; // All tiles start hidden
      }
    }
    return map;
  }

  update(playerPosition: Position) {
    // Reset visibility
    this.visibilityMap = this.createVisibilityMap();
    
    const playerTileX = Math.floor(playerPosition.x / this.tileSize);
    const playerTileY = Math.floor(playerPosition.y / this.tileSize);
    
    // Make tiles visible around player
    for (let dy = -this.visibilityRadius; dy <= this.visibilityRadius; dy++) {
      for (let dx = -this.visibilityRadius; dx <= this.visibilityRadius; dx++) {
        const tileX = playerTileX + dx;
        const tileY = playerTileY + dy;
        
        // Check if tile is within map bounds
        if (tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= this.visibilityRadius) {
            this.visibilityMap[tileY][tileX] = true;
          }
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, screenWidth: number, screenHeight: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    
    // Calculate which tiles are visible on screen
    const startTileX = Math.max(0, Math.floor(cameraX / this.tileSize));
    const endTileX = Math.min(this.width, Math.ceil((cameraX + screenWidth) / this.tileSize));
    const startTileY = Math.max(0, Math.floor(cameraY / this.tileSize));
    const endTileY = Math.min(this.height, Math.ceil((cameraY + screenHeight) / this.tileSize));
    
    // Render fog for non-visible tiles
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        if (!this.visibilityMap[y][x]) {
          ctx.fillRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
      }
    }
    
    ctx.restore();
  }

  isVisible(position: Position): boolean {
    const tileX = Math.floor(position.x / this.tileSize);
    const tileY = Math.floor(position.y / this.tileSize);
    
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return false;
    }
    
    return this.visibilityMap[tileY][tileX];
  }
}
