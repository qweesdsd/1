import './styles.css';
import { Tetris } from './game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const scoreEl = document.getElementById('score') as HTMLSpanElement;

const game = new Tetris(10, 20, 30, ctx, (score) => {
  scoreEl.textContent = String(score);
});

game.start();

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') game.move(-1);
  if (e.key === 'ArrowRight') game.move(1);
  if (e.key === 'ArrowDown') game.softDrop();
  if (e.key === 'ArrowUp') game.rotate();
  if (e.key === ' ') { e.preventDefault(); game.hardDrop(); }
  if (e.key.toLowerCase() === 'c') game.hold();
});
