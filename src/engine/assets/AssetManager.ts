import { Vector2 } from '../math/Vector2';

export interface SpriteFrame {
  image: HTMLImageElement;
  duration?: number;
}

export class SpriteFrames {
  frames: SpriteFrame[] = [];
  loop: boolean = true;

  addFrame(image: HTMLImageElement, duration: number = 0.1): void {
    this.frames.push({ image, duration });
  }

  getFrame(index: number): SpriteFrame | undefined {
    if (index < 0 || index >= this.frames.length) return undefined;
    return this.frames[index];
  }

  get length(): number {
    return this.frames.length;
  }
}

export interface AssetManifest {
  sprites: Record<string, string>;
  spriteSheets?: Record<string, { frames: string[]; frameDuration?: number }>;
}

export class AssetManager {
  private images: Map<string, HTMLImageElement> = new Map();
  private spriteFrames: Map<string, SpriteFrames> = new Map();
  private loadedCount: number = 0;
  private totalCount: number = 0;

  async loadSprite(path: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        this.loadedCount++;
        resolve();
      };
      img.onerror = reject;
      img.src = path;
      this.totalCount++;
    });
  }

  async loadSpriteSheet(
    basePath: string,
    key: string,
    frameNames: string[],
    frameDuration: number = 0.1
  ): Promise<void> {
    const spriteFrames = new SpriteFrames();
    spriteFrames.loop = true;

    for (const frameName of frameNames) {
      const path = `${basePath}${frameName}.png`;
      await this.loadSprite(path, `${key}_${frameName}`);
      const img = this.images.get(`${key}_${frameName}`);
      if (img) {
        spriteFrames.addFrame(img, frameDuration);
      }
    }

    this.spriteFrames.set(key, spriteFrames);
  }

  getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  getSpriteFrames(key: string): SpriteFrames | undefined {
    return this.spriteFrames.get(key);
  }

  getProgress(): number {
    if (this.totalCount === 0) return 1;
    return this.loadedCount / this.totalCount;
  }

  isLoaded(): boolean {
    return this.loadedCount >= this.totalCount && this.totalCount > 0;
  }

  clear(): void {
    this.images.clear();
    this.spriteFrames.clear();
    this.loadedCount = 0;
    this.totalCount = 0;
  }
}
