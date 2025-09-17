export type TankClass = 'ranger' | 'sniper' | 'samurai';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameState = 'menu' | 'playing' | 'gameOver' | 'victory';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Position, Size {}

export interface TankConfig {
  speed: number;
  fireRate: number;
  bulletSpeed: number;
  specialAbility?: string;
}

export const TANK_CONFIGS: Record<TankClass, TankConfig> = {
  ranger: {
    speed: 3,
    fireRate: 500,
    bulletSpeed: 6,
    specialAbility: 'high_speed'
  },
  sniper: {
    speed: 2,
    fireRate: 800,
    bulletSpeed: 8,
    specialAbility: 'pierce_armor'
  },
  samurai: {
    speed: 2.5,
    fireRate: 600,
    bulletSpeed: 5,
    specialAbility: 'reflect_bullets'
  }
};

export const TILE_SIZE = 32;
export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 19;
