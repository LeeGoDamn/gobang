import { BOARD_SIZE, Player, Position, GameStatus } from './types';
import { Board } from './Board';
import { AI } from './AI';

export class Game {
  private grid: Player[][];
  private currentPlayer: Player;
  private gameOver: boolean;
  private moveHistory: Position[];
  private hoverPos: Position | null;
  private gameStarted: boolean;
  private playerColor: Player;

  private board: Board;
  private canvas: HTMLCanvasElement;
  private statusEl: HTMLElement;
  private undoBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;
  private blackBtn: HTMLButtonElement;
  private whiteBtn: HTMLButtonElement;

  private ai: AI;

  constructor() {
    this.grid = this.createEmptyGrid();
    this.currentPlayer = Player.Black;
    this.gameOver = false;
    this.moveHistory = [];
    this.hoverPos = null;
    this.gameStarted = false;
    this.playerColor = Player.Black;

    this.board = new Board('gameCanvas');
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.statusEl = document.getElementById('status')!;
    this.undoBtn = document.getElementById('undoBtn') as HTMLButtonElement;
    this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
    this.blackBtn = document.getElementById('blackBtn') as HTMLButtonElement;
    this.whiteBtn = document.getElementById('whiteBtn') as HTMLButtonElement;

    this.ai = new AI(this.grid);

    this.bindEvents();
    this.render();
  }

  private createEmptyGrid(): Player[][] {
    return Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(Player.None));
  }

  private getAiColor(): Player {
    return this.playerColor === Player.Black ? Player.White : Player.Black;
  }

  private bindEvents(): void {
    this.blackBtn.addEventListener('click', () => {
      this.startGame(Player.Black);
    });

    this.whiteBtn.addEventListener('click', () => {
      this.startGame(Player.White);
    });

    this.resetBtn.addEventListener('click', () => {
      this.reset();
    });

    this.undoBtn.addEventListener('click', () => {
      this.undo();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.gameStarted || this.gameOver || this.currentPlayer !== this.playerColor) return;

      const pos = this.board.getPositionFromEvent(e);
      if (pos && this.grid[pos.x][pos.y] === Player.None) {
        if (!this.hoverPos || this.hoverPos.x !== pos.x || this.hoverPos.y !== pos.y) {
          this.hoverPos = pos;
          this.render();
        }
      } else if (this.hoverPos) {
        this.hoverPos = null;
        this.render();
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      if (this.hoverPos) {
        this.hoverPos = null;
        this.render();
      }
    });

    this.canvas.addEventListener('click', (e) => {
      if (!this.gameStarted || this.gameOver || this.currentPlayer !== this.playerColor) return;

      const pos = this.board.getPositionFromEvent(e);
      if (pos && this.grid[pos.x][pos.y] === Player.None) {
        this.makeMove(pos.x, pos.y, this.playerColor);
      }
    });
  }

  private startGame(playerColor: Player): void {
    this.playerColor = playerColor;
    this.gameStarted = true;
    this.grid = this.createEmptyGrid();
    this.moveHistory = [];
    this.gameOver = false;
    
    this.ai = new AI(this.grid);
    this.ai.setAiColor(this.getAiColor());

    this.blackBtn.classList.add('hidden');
    this.whiteBtn.classList.add('hidden');
    this.resetBtn.classList.remove('hidden');
    this.undoBtn.classList.remove('hidden');

    this.updateCursor();
    this.updateStatus();
    this.render();

    if (playerColor === Player.White) {
      this.currentPlayer = Player.Black;
      setTimeout(() => this.aiMove(), 300);
    } else {
      this.currentPlayer = Player.Black;
    }
  }

  private updateCursor(): void {
    this.canvas.classList.remove('cursor-black', 'cursor-white');
    this.canvas.classList.add(this.playerColor === Player.Black ? 'cursor-black' : 'cursor-white');
  }

  reset(): void {
    this.grid = this.createEmptyGrid();
    this.currentPlayer = Player.Black;
    this.gameOver = false;
    this.moveHistory = [];
    this.hoverPos = null;
    this.gameStarted = false;

    this.blackBtn.classList.remove('hidden');
    this.whiteBtn.classList.remove('hidden');
    this.resetBtn.classList.add('hidden');
    this.undoBtn.classList.add('hidden');

    this.canvas.classList.remove('cursor-black', 'cursor-white');

    this.statusEl.textContent = '选择先后手';
    this.statusEl.className = 'text-center text-slate-900 text-xl font-bold min-h-12 bg-amber-200 px-8 py-3 rounded-xl shadow-lg border-2 border-amber-400';
    this.render();
  }

  private makeMove(x: number, y: number, player: Player): void {
    this.grid[x][y] = player;
    this.moveHistory.push({ x, y });
    this.hoverPos = null;

    if (this.checkWin(x, y, player)) {
      this.endGame(player === this.playerColor ? GameStatus.PlayerWin : GameStatus.AIWin);
      this.render();
      return;
    }

    this.currentPlayer = player === Player.Black ? Player.White : Player.Black;
    this.updateStatus();
    this.render();

    if (this.currentPlayer !== this.playerColor) {
      setTimeout(() => this.aiMove(), 100);
    }
  }

  private aiMove(): void {
    if (this.gameOver) return;
    
    const move = this.ai.getBestMove();
    if (move) {
      this.makeMove(move.x, move.y, this.getAiColor());
    }
  }

  private undo(): void {
    if (!this.gameStarted || this.gameOver) return;
    if (this.moveHistory.length < 2) return;

    for (let i = 0; i < 2; i++) {
      const move = this.moveHistory.pop()!;
      this.grid[move.x][move.y] = Player.None;
    }

    this.currentPlayer = this.playerColor;
    this.ai = new AI(this.grid);
    this.ai.setAiColor(this.getAiColor());
    this.updateStatus();
    this.render();
  }

  private checkWin(x: number, y: number, player: Player): boolean {
    const directions = [
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
    ];

    for (const { dx, dy } of directions) {
      let count = 1;

      for (let i = 1; i < 5; i++) {
        const nx = x + dx * i, ny = y + dy * i;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          if (this.grid[nx][ny] === player) count++;
          else break;
        } else break;
      }

      for (let i = 1; i < 5; i++) {
        const nx = x - dx * i, ny = y - dy * i;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          if (this.grid[nx][ny] === player) count++;
          else break;
        } else break;
      }

      if (count >= 5) return true;
    }

    return false;
  }

  private endGame(status: GameStatus): void {
    this.gameOver = true;
    if (status === GameStatus.PlayerWin) {
      this.statusEl.textContent = '🎉 恭喜你赢了！';
      this.statusEl.className = 'text-center text-xl font-bold min-h-12 bg-green-400 text-green-900 px-8 py-3 rounded-xl shadow-lg border-2 border-green-500 animate-pulse';
    } else {
      this.statusEl.textContent = '💀 AI 赢了！再来一局？';
      this.statusEl.className = 'text-center text-xl font-bold min-h-12 bg-red-400 text-red-900 px-8 py-3 rounded-xl shadow-lg border-2 border-red-500';
    }
  }

  private updateStatus(): void {
    this.statusEl.className = 'text-center text-slate-900 text-xl font-bold min-h-12 bg-amber-200 px-8 py-3 rounded-xl shadow-lg border-2 border-amber-400';
    
    if (this.currentPlayer === this.playerColor) {
      this.statusEl.textContent = this.playerColor === Player.Black ? '⚫ 轮到你了（黑棋）' : '⚪ 轮到你了（白棋）';
    } else {
      this.statusEl.textContent = this.playerColor === Player.Black ? '⚪ AI 思考中（白棋）...' : '⚫ AI 思考中（黑棋）...';
    }
    
    this.undoBtn.disabled = this.moveHistory.length < 2;
  }

  private render(): void {
    const lastMove = this.moveHistory.length > 0
      ? this.moveHistory[this.moveHistory.length - 1]
      : undefined;

    this.board.draw(this.grid, lastMove);

    if (this.hoverPos && this.gameStarted && !this.gameOver && this.currentPlayer === this.playerColor) {
      this.board.drawHover(this.hoverPos.x, this.hoverPos.y, this.playerColor);
    }
  }
}
