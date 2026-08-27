/**
 * Главная точка входа игры
 */

import { Game } from './engine/core/Game';
import { GameState } from './game/states/GameState';
import { AssetManager } from './engine/assets/AssetManager';
import './engine/ui/styles.css';

// Точка входа при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  
  // Создаем игру
  const game = new Game(canvas);
  
  // Регистрируем состояние игры
  game.registerState('game', () => 
    new GameState(game)
  );
  
  // Загружаем ассеты и запускаем игру
  loadAssets(game.assets).then(() => {
    console.log('All assets loaded');
    game.setState('game');
    game.start();
  });
});

async function loadAssets(assets: AssetManager): Promise<void> {
  // Загружаем спрайты из папки assets
  // Игрок - используем рыцаря
  await assets.loadImage('player', 'assets/characters/knight_m_idle_anim_f0.png');
  
  // Враги - используем демонов и зомби
  await assets.loadImage('enemy_basic', 'assets/enemies/big_zombie_run_anim_f0.png');
  await assets.loadImage('enemy_fast', 'assets/enemies/chort_idle_anim_f0.png');
  await assets.loadImage('enemy_tank', 'assets/enemies/big_demon_run_anim_f0.png');
  await assets.loadImage('enemy_boss', 'assets/enemies/big_demon_idle_anim_f0.png');
  
  // Башня - используем колонну
  await assets.loadImage('tower', 'assets/environment/column.png');
  
  // Снаряд - используем стрелу
  await assets.loadImage('projectile', 'assets/weapons/weapon_arrow.png');
  
  // Подбираемые предметы
  await assets.loadImage('pickup_gold', 'assets/items/coin_anim_f0.png');
  await assets.loadImage('pickup_health', 'assets/items/flask_red.png');
  await assets.loadImage('pickup_upgrade', 'assets/items/flask_yellow.png');
}
