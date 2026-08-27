import { Vector2 } from '../math/Vector2';

export interface Renderable {
  position: Vector2;
  image?: HTMLImageElement;
  frameIndex?: number;
  spriteFramesKey?: string;
  width: number;
  height: number;
  flipX?: boolean;
  layer: number;
  zIndex?: number;
  alpha?: number;
}

export class Renderer2D {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderQueue: Renderable[] = [];
  private camera: import('./Camera2D').Camera2D | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    
    // Pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  setCamera(camera: import('./Camera2D').Camera2D): void {
    this.camera = camera;
  }

  clear(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderQueue = [];
  }

  queue(renderable: Renderable): void {
    this.renderQueue.push(renderable);
  }

  drawImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    width?: number,
    height?: number,
    flipX: boolean = false,
    alpha: number = 1
  ): void {
    const w = width ?? image.width;
    const h = height ?? image.height;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    if (flipX) {
      this.ctx.translate(x + w, y);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(image, 0, 0, w, h);
    } else {
      this.ctx.drawImage(image, Math.round(x), Math.round(y), w, h);
    }

    this.ctx.restore();
  }

  render(): void {
    // Sort by layer, then zIndex, then y position for Y-sorting
    this.renderQueue.sort((a, b) => {
      if (a.layer !== b.layer) return a.layer - b.layer;
      if ((a.zIndex ?? 0) !== (b.zIndex ?? 0)) return (a.zIndex ?? 0) - (b.zIndex ?? 0);
      return a.position.y - b.position.y;
    });

    for (const renderable of this.renderQueue) {
      let screenPos = renderable.position;
      
      if (this.camera) {
        screenPos = this.camera.worldToScreen(renderable.position);
      }

      let image: HTMLImageElement | undefined = renderable.image;
      
      // Handle animated sprites would be done in game layer

      if (image) {
        this.drawImage(
          image,
          screenPos.x,
          screenPos.y,
          renderable.width,
          renderable.height,
          renderable.flipX ?? false,
          renderable.alpha ?? 1
        );
      }
    }

    this.renderQueue = [];
  }

  drawText(
    text: string,
    x: number,
    y: number,
    fontSize: number = 16,
    color: string = '#ffffff',
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.save();
    this.ctx.font = `${fontSize}px monospace`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, Math.round(x), Math.round(y));
    this.ctx.restore();
  }
}
