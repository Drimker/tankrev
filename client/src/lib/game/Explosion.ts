import { Position } from './types';

interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
}

export type ExplosionType = 'tank_enemy' | 'wall_destructible' | 'wall_border';

export class Explosion {
  public position: Position;
  public type: ExplosionType;
  private particles: Particle[] = [];
  private duration = 1500; // 1.5 seconds
  private elapsedTime = 0;
  private isActive = true;
  
  // Animation phases
  private expansionPhase = 400; // 0-400ms: expansion
  private flashPhase = 200; // 400-600ms: bright flash
  private fadePhase = 900; // 600-1500ms: fade out

  constructor(position: Position, type: ExplosionType = 'wall_destructible') {
    this.position = { ...position };
    this.type = type;
    this.createParticles();
  }

  private createParticles() {
    const particleCount = this.type === 'tank_enemy' ? 25 : (this.type === 'wall_destructible' ? 15 : 8);
    const maxSpeed = this.type === 'tank_enemy' ? 4 : (this.type === 'wall_destructible' ? 2.5 : 1.5);
    // Different colors for different explosion types
    let colors: string[];
    if (this.type === 'tank_enemy') {
      colors = ['#FF4500', '#FF6347', '#FFD700', '#FF8C00', '#DC143C']; // Fire colors
    } else if (this.type === 'wall_destructible') {
      colors = ['#8B4513', '#CD853F', '#A0522D', '#D2691E', '#696969']; // Dust/debris colors
    } else { // wall_border
      colors = ['#708090', '#87CEEB', '#B0C4DE', '#778899', '#ADD8E6']; // Concrete/sparks colors
    }

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * maxSpeed + 1;
      const size = Math.random() * (this.type === 'tank_enemy' ? 2.7 : (this.type === 'wall_destructible' ? 1.7 : 1.0)) + 0.7;
      const life = Math.random() * 800 + 400; // 400-1200ms particle life
      
      this.particles.push({
        x: this.position.x,
        y: this.position.y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: size,
        life: life,
        maxLife: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0
      });
    }

    // Add central explosion particles
    const centralCount = this.type === 'tank_enemy' ? 10 : (this.type === 'wall_destructible' ? 6 : 3);
    for (let i = 0; i < centralCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5;
      const size = Math.random() * (this.type === 'tank_enemy' ? 4 : (this.type === 'wall_destructible' ? 2.7 : 1.5)) + 1.3;
      
      this.particles.push({
        x: this.position.x,
        y: this.position.y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: size,
        life: this.duration * 0.8, // Live longer for central particles
        maxLife: this.duration * 0.8,
        color: '#FFFFFF', // White for central flash
        alpha: 1.0
      });
    }
  }

  update(deltaTime: number): boolean {
    if (!this.isActive) return false;

    this.elapsedTime += deltaTime;
    
    if (this.elapsedTime >= this.duration) {
      this.isActive = false;
      return false;
    }

    // Update particles
    this.particles = this.particles.filter(particle => {
      // Update position
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      
      // Apply friction
      particle.velocityX *= 0.98;
      particle.velocityY *= 0.98;
      
      // Update life and alpha
      particle.life -= deltaTime;
      
      if (particle.life <= 0) {
        return false;
      }
      
      // Calculate alpha based on life and phase
      const lifeRatio = particle.life / particle.maxLife;
      const timeRatio = this.elapsedTime / this.duration;
      
      if (this.elapsedTime < this.expansionPhase) {
        // Expansion phase: particles appear and expand
        particle.alpha = Math.min(1.0, (this.elapsedTime / this.expansionPhase) * 1.2);
      } else if (this.elapsedTime < this.expansionPhase + this.flashPhase) {
        // Flash phase: bright flash
        particle.alpha = 1.0;
        // Increase size temporarily for flash effect
        if (particle.color === '#FFFFFF') {
          particle.size = particle.size * 1.2;
        }
      } else {
        // Fade phase: particles fade out
        const fadeStart = this.expansionPhase + this.flashPhase;
        const fadeProgress = (this.elapsedTime - fadeStart) / this.fadePhase;
        particle.alpha = Math.max(0, 1.0 - fadeProgress) * lifeRatio;
      }
      
      return true;
    });

    return this.isActive;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.isActive) return;

    ctx.save();
    
    // Render main explosion flash during flash phase
    if (this.elapsedTime >= this.expansionPhase && 
        this.elapsedTime < this.expansionPhase + this.flashPhase) {
      
      const flashProgress = (this.elapsedTime - this.expansionPhase) / this.flashPhase;
      const flashRadius = (this.type === 'tank_enemy' ? 8.3 : (this.type === 'wall_destructible' ? 5 : 3)) * (1 + flashProgress);
      
      // Create radial gradient for flash
      const gradient = ctx.createRadialGradient(
        this.position.x, this.position.y, 0,
        this.position.x, this.position.y, flashRadius
      );
      
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.6)');
      gradient.addColorStop(0.6, 'rgba(255, 69, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, flashRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Render particles
    this.particles.forEach(particle => {
      if (particle.alpha <= 0) return;
      
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      
      // Set particle color
      ctx.fillStyle = particle.color;
      
      // Add glow effect for central particles
      if (particle.color === '#FFFFFF') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 0.5;
      }
      
      // Draw particle as circle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Add smaller inner bright core
      if (particle.size > 4) {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = particle.alpha * 0.7;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
    
    ctx.restore();
  }

  isFinished(): boolean {
    return !this.isActive;
  }

  getPosition(): Position {
    return this.position;
  }

  getDuration(): number {
    return this.duration;
  }

  getElapsedTime(): number {
    return this.elapsedTime;
  }
}