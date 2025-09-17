import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from './types';

export type TileType = 'empty' | 'brick' | 'steel' | 'base';

export class GameMap {
  private tiles: TileType[][];
  private baseDestroyed = false;

  constructor() {
    this.tiles = this.generateMap();
  }

  private generateMap(): TileType[][] {
    const map: TileType[][] = [];
    
    // Initialize empty map
    for (let y = 0; y < MAP_HEIGHT; y++) {
      map[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        map[y][x] = 'empty';
      }
    }

    // Add border walls
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[0][x] = 'steel';
      map[MAP_HEIGHT - 1][x] = 'steel';
    }
    for (let y = 0; y < MAP_HEIGHT; y++) {
      map[y][0] = 'steel';
      map[y][MAP_WIDTH - 1] = 'steel';
    }

    // Add some brick walls for cover
    this.addBrickStructures(map);
    
    // Add player base at bottom center
    const baseX = Math.floor(MAP_WIDTH / 2);
    const baseY = MAP_HEIGHT - 3;
    map[baseY][baseX] = 'base';
    
    // Add steel protection around base
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = baseX + dx;
        const y = baseY + dy;
        if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && map[y][x] === 'empty') {
          if (dx === 0 && dy === 0) continue; // Don't overwrite base
          map[y][x] = 'steel';
        }
      }
    }

    return map;
  }

  private addBrickStructures(map: TileType[][]) {
    // Add some strategic brick walls
    const structures = [
      // Left side structures
      { x: 3, y: 3, width: 2, height: 3 },
      { x: 6, y: 7, width: 3, height: 2 },
      
      // Right side structures
      { x: 19, y: 3, width: 2, height: 3 },
      { x: 16, y: 7, width: 3, height: 2 },
      
      // Center structures
      { x: 11, y: 5, width: 3, height: 2 },
      { x: 8, y: 12, width: 2, height: 2 },
      { x: 15, y: 12, width: 2, height: 2 },
    ];

    structures.forEach(struct => {
      for (let y = struct.y; y < struct.y + struct.height; y++) {
        for (let x = struct.x; x < struct.x + struct.width; x++) {
          if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
            map[y][x] = 'brick';
          }
        }
      }
    });
  }

  getTile(x: number, y: number): TileType {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
      return 'steel'; // Treat out of bounds as solid
    }
    
    return this.tiles[tileY][tileX];
  }

  destroyTile(x: number, y: number): boolean {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
      return false;
    }
    
    const tile = this.tiles[tileY][tileX];
    
    if (tile === 'brick') {
      this.tiles[tileY][tileX] = 'empty';
      console.log('Brick destroyed at:', tileX, tileY);
      return true;
    } else if (tile === 'base') {
      this.baseDestroyed = true;
      console.log('Base destroyed!');
      return true;
    }
    
    return false;
  }

  isBaseDestroyed(): boolean {
    return this.baseDestroyed;
  }

  isSolid(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile === 'brick' || tile === 'steel' || tile === 'base';
  }

  private renderBrick(ctx: CanvasRenderingContext2D, drawX: number, drawY: number) {
    // Brick dimensions
    const brickWidth = 14;
    const brickHeight = 6;
    const mortarWidth = 1;
    
    // Brick colors for texture variation
    const brickColors = ['#A0522D', '#8B4513', '#CD853F', '#D2691E'];
    const mortarColor = '#696969';
    const shadowColor = '#5D4E37';
    const highlightColor = '#DEB887';
    
    // Fill background with mortar
    ctx.fillStyle = mortarColor;
    ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
    
    // Draw brick rows
    for (let row = 0; row < 5; row++) {
      const rowY = drawY + row * (brickHeight + mortarWidth);
      if (rowY >= drawY + TILE_SIZE) break;
      
      // Stagger every other row for realistic brick pattern
      const offset = (row % 2) * (brickWidth / 2);
      
      for (let col = 0; col < 3; col++) {
        const brickX = drawX + col * (brickWidth + mortarWidth) - offset;
        
        // Skip if brick is completely outside the tile
        if (brickX >= drawX + TILE_SIZE || brickX + brickWidth <= drawX) continue;
        
        // Clip brick to tile boundaries
        const clippedX = Math.max(brickX, drawX);
        const clippedWidth = Math.min(brickX + brickWidth, drawX + TILE_SIZE) - clippedX;
        const clippedHeight = Math.min(rowY + brickHeight, drawY + TILE_SIZE) - rowY;
        
        if (clippedWidth > 0 && clippedHeight > 0) {
          // Select brick color based on position for consistent variation
          const colorIndex = (row + col) % brickColors.length;
          const mainColor = brickColors[colorIndex];
          
          // Draw main brick
          ctx.fillStyle = mainColor;
          ctx.fillRect(clippedX, rowY, clippedWidth, clippedHeight);
          
          // Add highlight on top edge
          ctx.fillStyle = highlightColor;
          ctx.fillRect(clippedX, rowY, clippedWidth, 1);
          
          // Add shadow on bottom and right edges
          ctx.fillStyle = shadowColor;
          if (rowY + clippedHeight < drawY + TILE_SIZE) {
            ctx.fillRect(clippedX, rowY + clippedHeight - 1, clippedWidth, 1);
          }
          if (clippedX + clippedWidth < drawX + TILE_SIZE) {
            ctx.fillRect(clippedX + clippedWidth - 1, rowY, 1, clippedHeight);
          }
          
          // Add subtle texture lines within brick
          ctx.fillStyle = shadowColor;
          ctx.globalAlpha = 0.3;
          for (let texLine = 2; texLine < clippedHeight - 2; texLine += 2) {
            ctx.fillRect(clippedX + 1, rowY + texLine, clippedWidth - 2, 1);
          }
          ctx.globalAlpha = 1.0;
        }
      }
    }
  }

  private renderConcrete(ctx: CanvasRenderingContext2D, drawX: number, drawY: number) {
    // Concrete base colors
    const baseGray = '#808080';
    const lightGray = '#A0A0A0';
    const darkGray = '#606060';
    const shadowGray = '#404040';
    const highlightGray = '#B8B8B8';
    const crackColor = '#505050';
    
    // Fill base concrete color with slight variation
    const grayVariations = ['#7A7A7A', '#808080', '#858585', '#7F7F7F'];
    const baseIndex = (drawX + drawY) % grayVariations.length;
    ctx.fillStyle = grayVariations[baseIndex];
    ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
    
    // Add concrete texture with random speckles and aggregate
    ctx.fillStyle = lightGray;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 15; i++) {
      // Use position-based pseudo-random for consistent texture
      const seedX = (drawX * 7 + drawY * 11 + i * 13) % 100;
      const seedY = (drawX * 17 + drawY * 19 + i * 23) % 100;
      const speckleX = drawX + (seedX * TILE_SIZE) / 100;
      const speckleY = drawY + (seedY * TILE_SIZE) / 100;
      const size = 1 + (seedX % 3);
      ctx.fillRect(speckleX, speckleY, size, size);
    }
    ctx.globalAlpha = 1.0;
    
    // Add darker aggregate spots
    ctx.fillStyle = darkGray;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 8; i++) {
      const seedX = (drawX * 31 + drawY * 37 + i * 41) % 100;
      const seedY = (drawX * 43 + drawY * 47 + i * 53) % 100;
      const aggregateX = drawX + (seedX * TILE_SIZE) / 100;
      const aggregateY = drawY + (seedY * TILE_SIZE) / 100;
      const size = 2 + (seedX % 2);
      ctx.fillRect(aggregateX, aggregateY, size, size);
    }
    ctx.globalAlpha = 1.0;
    
    // Add depth effects with beveled edges
    ctx.fillStyle = highlightGray;
    // Top highlight
    ctx.fillRect(drawX, drawY, TILE_SIZE, 2);
    // Left highlight
    ctx.fillRect(drawX, drawY, 2, TILE_SIZE);
    
    ctx.fillStyle = shadowGray;
    // Bottom shadow
    ctx.fillRect(drawX, drawY + TILE_SIZE - 2, TILE_SIZE, 2);
    // Right shadow
    ctx.fillRect(drawX + TILE_SIZE - 2, drawY, 2, TILE_SIZE);
    
    // Add realistic cracks using position-based patterns
    ctx.strokeStyle = crackColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    
    // Vertical cracks
    for (let i = 0; i < 3; i++) {
      const crackSeed = (drawX * 61 + drawY * 67 + i * 71) % 100;
      if (crackSeed < 25) { // 25% chance for each crack
        const crackX = drawX + 6 + (crackSeed * (TILE_SIZE - 12)) / 100;
        const crackLength = 8 + (crackSeed % 12);
        const crackStartY = drawY + 4 + (crackSeed % 8);
        
        ctx.beginPath();
        ctx.moveTo(crackX, crackStartY);
        // Add slight jaggedness to the crack
        const segments = 3;
        for (let s = 1; s <= segments; s++) {
          const segmentY = crackStartY + (crackLength * s) / segments;
          const wiggle = ((crackSeed * s * 7) % 3) - 1; // -1, 0, or 1
          ctx.lineTo(crackX + wiggle, segmentY);
        }
        ctx.stroke();
      }
    }
    
    // Horizontal cracks
    for (let i = 0; i < 2; i++) {
      const crackSeed = (drawX * 73 + drawY * 79 + i * 83) % 100;
      if (crackSeed < 20) { // 20% chance for each crack
        const crackY = drawY + 8 + (crackSeed * (TILE_SIZE - 16)) / 100;
        const crackLength = 10 + (crackSeed % 10);
        const crackStartX = drawX + 4 + (crackSeed % 6);
        
        ctx.beginPath();
        ctx.moveTo(crackStartX, crackY);
        // Add slight jaggedness to the crack
        const segments = 3;
        for (let s = 1; s <= segments; s++) {
          const segmentX = crackStartX + (crackLength * s) / segments;
          const wiggle = ((crackSeed * s * 11) % 3) - 1; // -1, 0, or 1
          ctx.lineTo(segmentX, crackY + wiggle);
        }
        ctx.stroke();
      }
    }
    
    ctx.globalAlpha = 1.0;
    
    // Add border to make it more prominent as indestructible barrier
    ctx.strokeStyle = shadowGray;
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
    
    // Add inner border for more definition
    ctx.strokeStyle = darkGray;
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX + 1, drawY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
  }

  render(ctx: CanvasRenderingContext2D) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.tiles[y][x];
        const drawX = x * TILE_SIZE;
        const drawY = y * TILE_SIZE;
        
        switch (tile) {
          case 'brick':
            this.renderBrick(ctx, drawX, drawY);
            break;
            
          case 'steel':
            this.renderConcrete(ctx, drawX, drawY);
            break;
            
          case 'base':
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
            
            // Draw flag symbol
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(drawX + 8, drawY + 4, 16, 10);
            ctx.fillStyle = '#000000';
            ctx.fillRect(drawX + 12, drawY + 4, 2, 24);
            break;
        }
      }
    }
  }
}
