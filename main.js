import './style.css';
import { Game } from './pairs';

document.addEventListener('DOMContentLoaded', () => {
  const gameWrap = document.querySelector('#app');
  const game = new Game(gameWrap);
})

