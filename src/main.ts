import './style.css';
import { CanvasGame } from './canvas/game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
const undoBtn = document.getElementById('undoBtn') as HTMLButtonElement;

const game = new CanvasGame(canvas, {
  onStatusChange: (status: string) => {
    statusEl.textContent = status;
  },
  onUndoStateChange: (canUndo: boolean) => {
    undoBtn.disabled = !canUndo;
  },
});

resetBtn.addEventListener('click', () => {
  game.reset();
});

undoBtn.addEventListener('click', () => {
  game.undo();
});

game.render();
