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

  // 创建空棋盘
  private createEmptyGrid(): Player[][] {
    return Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(Player.None));
  }

  // 重置游戏
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

  // 绑定事件
  private bindEvents(): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    // 鼠标移动 - 悬停预览
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

    // 点击 - 落子
    canvas.addEventListener('click', (e) => {
      if (this.gameOver || this.currentPlayer !== Player.Black) return;

      const pos = this.board.getPositionFromEvent(e);
      if (pos && this.grid[pos.x][pos.y] === Player.None) {
        this.makeMove(pos.x, pos.y, Player.Black);
      }
    });

    // 新游戏按钮
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.reset();
    });

    // 悔棋按钮
    this.undoBtn.addEventListener('click', () => {
      this.undo();
    });
  }

  // 落子
  private makeMove(x: number, y: number, player: Player): void {
    this.grid[x][y] = player;
    this.moveHistory.push({ x, y });
    this.hoverPos = null;

    // 检查胜负
    if (this.checkWin(x, y, player)) {
      this.endGame(player === Player.Black ? GameStatus.PlayerWin : GameStatus.AIWin);
      this.render();
      return;
    }

    // 切换玩家
    if (player === Player.Black) {
      this.currentPlayer = Player.White;
      this.updateStatus();
      this.render();

      // AI 回合
      setTimeout(() => this.aiMove(), 100);
    } else {
      this.currentPlayer = Player.Black;
      this.updateStatus();
      this.render();
    }
  }

  // AI 移动
  private aiMove(): void {
    const move = this.ai.getBestMove();
    if (move) {
      this.makeMove(move.x, move.y, Player.White);
    }
  }

  // 悔棋（撤销两步）
  private undo(): void {
    if (this.moveHistory.length < 2 || this.gameOver) return;

    // 撤销 AI 的一步
    const aiMove = this.moveHistory.pop()!;
    this.grid[aiMove.x][aiMove.y] = Player.None;

    // 撤销玩家的一步
    const playerMove = this.moveHistory.pop()!;
    this.grid[playerMove.x][playerMove.y] = Player.None;

    this.currentPlayer = Player.Black;
    this.gameOver = false;
    this.ai = new AI(this.grid);
    this.updateStatus();
    this.render();
  }

  // 检查胜负
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

  // 游戏结束
  private endGame(status: GameStatus): void {
    this.gameOver = true;
    if (status === GameStatus.PlayerWin) {
      this.statusEl.textContent = '🎉 你赢了！';
    } else {
      this.statusEl.textContent = '💀 AI 赢了！再接再厉！';
    }
  }

  // 更新状态显示
  private updateStatus(): void {
    if (this.currentPlayer === Player.Black) {
      this.statusEl.textContent = '⚫ 黑棋先手（你）';
    } else {
      this.statusEl.textContent = '⚪ 白棋思考中（AI）...';
    }
    this.undoBtn.disabled = this.moveHistory.length === 0;
  }

  // 渲染
  private render(): void {
    const lastMove = this.moveHistory.length > 0
      ? this.moveHistory[this.moveHistory.length - 1]
      : undefined;

    this.board.draw(this.grid, lastMove);

    // 绘制悬停预览
    if (this.hoverPos && !this.gameOver && this.currentPlayer === Player.Black) {
      this.board.drawHover(this.hoverPos.x, this.hoverPos.y);
    }
  }
}
