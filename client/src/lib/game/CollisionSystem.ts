import { Rectangle, Position } from './types';
import { Tank } from './Tank';
import { Bullet } from './Bullet';
import { GameMap } from './Map';

export class CollisionSystem {
  private gameMap: GameMap;

  constructor(gameMap: GameMap) {
    this.gameMap = gameMap;
  }

  checkRectangleCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  checkTankCollision(tankRect: Rectangle, otherTanks: Tank[]): Tank | null {
    for (const tank of otherTanks) {
      const otherRect = {
        x: tank.position.x,
        y: tank.position.y,
        width: tank.size,
        height: tank.size
      };
      
      if (this.checkRectangleCollision(tankRect, otherRect)) {
        return tank;
      }
    }
    return null;
  }

  checkWallCollision(rect: Rectangle): boolean {
    // Check all four corners of the rectangle
    const corners = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x, y: rect.y + rect.height },
      { x: rect.x + rect.width, y: rect.y + rect.height }
    ];

    return corners.some(corner => this.gameMap.isSolid(corner.x, corner.y));
  }

  resolveTankCollision(tank: Tank, allTanks: Tank[]): Position {
    const tankRect = {
      x: tank.position.x,
      y: tank.position.y,
      width: tank.size,
      height: tank.size
    };

    // Check wall collision
    if (this.checkWallCollision(tankRect)) {
      console.log('Tank collision with wall - reverting to previous position');
      return tank.previousPosition;
    }

    // Check tank collision
    const otherTanks = allTanks.filter(t => t !== tank);
    if (this.checkTankCollision(tankRect, otherTanks)) {
      console.log('Tank collision with other tank - reverting to previous position');
      return tank.previousPosition;
    }

    return tank.position;
  }

  checkBulletWallCollision(bullet: Bullet): boolean {
    const bulletRect = {
      x: bullet.position.x - bullet.size / 2,
      y: bullet.position.y - bullet.size / 2,
      width: bullet.size,
      height: bullet.size
    };

    // Check if bullet hits a solid tile
    if (this.checkWallCollision(bulletRect)) {
      // For sniper bullets, try to destroy the wall
      if (bullet.piercing > 0) {
        const destroyed = this.gameMap.destroyTile(bullet.position.x, bullet.position.y);
        if (destroyed) {
          bullet.piercing--;
          return bullet.piercing <= 0; // Continue if still has piercing
        }
      } else {
        // Regular bullet, try to destroy brick
        this.gameMap.destroyTile(bullet.position.x, bullet.position.y);
      }
      return true;
    }

    return false;
  }

  checkBulletTankCollision(bullet: Bullet, tank: Tank): boolean {
    const bulletRect = {
      x: bullet.position.x - bullet.size / 2,
      y: bullet.position.y - bullet.size / 2,
      width: bullet.size,
      height: bullet.size
    };

    const tankRect = {
      x: tank.position.x,
      y: tank.position.y,
      width: tank.size,
      height: tank.size
    };

    if (this.checkRectangleCollision(bulletRect, tankRect)) {
      // Check for samurai reflection
      if (tank.tankClass === 'samurai' && tank.canReflect() && tank.isPlayer) {
        if (tank.reflect()) {
          // Reflect the bullet (reverse direction)
          switch (bullet.direction) {
            case 'up':
              bullet.direction = 'down';
              break;
            case 'down':
              bullet.direction = 'up';
              break;
            case 'left':
              bullet.direction = 'right';
              break;
            case 'right':
              bullet.direction = 'left';
              break;
          }
          bullet.owner = tank; // Change ownership
          return false; // Don't destroy bullet
        }
      }
      
      return true;
    }

    return false;
  }
}
