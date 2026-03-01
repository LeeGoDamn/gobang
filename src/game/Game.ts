import { BOARD_SIZE, Player, Position, GameStatus } from './types';
import { Board } from './Board';
import { AI } from './AI';

export class Game {
  private grid: Player[][];
  private currentPlayer: Player;
  private gameOver: boolean;
  private moveHistory: Position[];
  private hoverPos: Position | null;

  private board: Board;
  private statusEl: HTMLElement;
  private undoBtn: HTMLButtonElement;

  private ai: AI;

  constructor() {
    this.grid = this.createEmptyGrid();
    this.currentPlayer = Player.Black;
    this.gameOver = false;
    this.moveHistory = [];
    this.hoverPos = null;

    this.board = new Board('gameCanvas');
    this.statusEl = document.getElementById('status')!;
    this.undoBtn = document.getElementById('undoBtn') as HTMLButtonElement;

    this.ai = new AI(this.grid);

    this.bindEvents();
    this.render();
  }

  private createEmptyGrid(): Player[][] {
    return Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(Player.None));
  }

  reset(): void {
    this.grid = this.createEmptyGrid();
    this.currentPlayer = Player.Black;
    this.gameOver = false;
    this.moveHistory = [];
    this.hoverPos = null;
    this.ai = new AI(this.grid);
    this.updateStatus();
    this.render();
  }

  private bindEvents(): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    canvas.addEventListener('mousemove', (e) => {
      if (this.gameOver || this.currentPlayer !== Player.Black) return;

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

    canvas.addEventListener('mouseleave', () => {
      if (this.hoverPos) {
        this.hoverPos = null;
        this.render();
      }
    });

    canvas.addEventListener('click', (e) => {
      if (this.gameOver || this.currentPlayer !== Player.Black) return;

      const pos = this.board.getPositionFromEvent(e);
      if (pos && this.grid[pos.x][pos.y] === Player.None) {
        this.makeMove(pos.x, pos.y, Player.Black);
      }
    });

    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.reset();
    });

    this.undoBtn.addEventListener('click', () => {
      this.undo();
    });
  }

  private makeMove(x: number, y: number, player: Player): void {
    this.grid[x][y] = player;
    this.moveHistory.push({ x, y });
    this.hoverPos = null;

    if (this.checkWin(x, y, player)) {
      this.endGame(player === Player.Black ? GameStatus.PlayerWin : GameStatus.AIWin);
      this.render();
      return;
    }

    if (player === Player.Black) {
      this.currentPlayer = Player.White;
      this.updateStatus();
      this.render();
      setTimeout(() => this.aiMove(), 100);
    } else {
      this.currentPlayer = Player.Black;
      this.updateStatus();
      this.render();
    }
  }

  private aiMove(): void {
    const move = this.ai.getBestMove();
    if (move) {
      this.makeMove(move.x, move.y, Player.White);
    }
  }

  private undo(): void {
    if (this.moveHistory.length < 2 || this.gameOver) return;

    const aiMove = this.moveHistory.pop()!;
    this.grid[aiMove.x][aiMove.y] = Player.None;

    const playerMove = this.moveHistory.pop()!;
    this.grid[playerMove.x][playerMove.y] = Player.None;

    this.currentPlayer = Player.Black;
    this.gameOver = false;
    this.ai = new AI(this.grid);
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
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          if (this.grid[nx][ny] === player) count++;
          else break;
        } else break;
      }

      for (let i = 1; i < 5; i++) {
        const nx = x - dx * i;
        const ny = y - dy * i;
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
    if (this.currentPlayer === Player.Black) {
      this.statusEl.textContent = '⚫ 轮到你了';
    } else {
      this.statusEl.textContent = '⚪ AI 思考中...';
    }
    this.undoBtn.disabled = this.moveHistory.length === 0;
  }

  private render(): void {
    const lastMove = this.moveHistory.length > 0
      ? this.moveHistory[this.moveHistory.length - 1]
      : undefined;

    this.board.draw(this.grid, lastMove);

    if (this.hoverPos && !this.gameOver && this.currentPlayer === Player.Black) {
      this.board.drawHover(this.hoverPos.x, this.hoverPos.y);
    }
  }
}
