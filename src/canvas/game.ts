import { BOARD_SIZE, createInitialState, makeMove, checkWin } from '../game';
import { GameState, Position } from '../types';

interface GameOptions {
  onStatusChange?: (status: string) => void;
  onUndoStateChange?: (canUndo: boolean) => void;
}

export class CanvasGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private winningPositions: Position[] = [];
  private cellSize: number;
  private padding: number;
  private options: GameOptions;
  private hoveredCell: { row: number; col: number } | null = null;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement, options: GameOptions = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.options = options;
    this.state = createInitialState();
    
    this.padding = 30;
    this.cellSize = (canvas.width - 2 * this.padding) / (BOARD_SIZE - 1);

    this.setupEventListeners();
    this.updateStatus();
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredCell = null;
      this.render();
    });
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cell = this.getCell(x, y);
    
    if (!cell || (this.hoveredCell && this.hoveredCell.row === cell.row && this.hoveredCell.col === cell.col)) {
      return;
    }

    this.hoveredCell = cell;
    this.render();
  }

  private handleClick(e: MouseEvent) {
    if (this.state.gameOver) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cell = this.getCell(x, y);
    if (!cell) return;

    const { row, col } = cell;
    if (this.state.board[row][col] !== null) return;

    this.state = makeMove(this.state, row, col);

    const winResult = checkWin(this.state.board, row, col);
    if (winResult) {
      this.winningPositions = winResult.positions;
    }

    this.hoveredCell = null;
    this.updateStatus();
    this.render();
  }

  private getCell(x: number, y: number): { row: number; col: number } | null {
    const col = Math.round((x - this.padding) / this.cellSize);
    const row = Math.round((y - this.padding) / this.cellSize);

    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
      return { row, col };
    }
    return null;
  }

  private updateStatus() {
    let status = '';
    if (this.state.gameOver) {
      if (this.state.winner === 'draw') {
        status = '平局';
      } else {
        status = `${this.state.winner === 'black' ? '黑棋' : '白棋'} 获胜`;
      }
    } else {
      status = `${this.state.currentPlayer === 'black' ? '黑棋' : '白棋'} 先手`;
    }
    this.options.onStatusChange?.(status);
    this.options.onUndoStateChange?.(this.state.moveHistory.length > 0 && !this.state.gameOver);
  }

  public reset() {
    this.state = createInitialState();
    this.winningPositions = [];
    this.hoveredCell = null;
    this.updateStatus();
    this.render();
  }

  public undo() {
    if (this.state.moveHistory.length === 0 || this.state.gameOver) return;

    const lastMove = this.state.moveHistory[this.state.moveHistory.length - 1];
    const newBoard = this.state.board.map((row) => [...row]);
    newBoard[lastMove.row][lastMove.col] = null;

    const previousPlayer = this.state.currentPlayer === 'black' ? 'white' : 'black';

    this.state = {
      ...this.state,
      board: newBoard,
      currentPlayer: previousPlayer,
      moveHistory: this.state.moveHistory.slice(0, -1),
    };

    this.winningPositions = [];
    this.hoveredCell = null;
    this.updateStatus();
    this.render();
  }

  public render() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      this.drawBoard();
      this.drawPieces();
      this.drawHoverEffect();
      this.animationFrameId = null;
    });
  }

  private drawBoard() {
    this.ctx.fillStyle = '#DCB88A';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = this.padding + i * this.cellSize;

      this.ctx.beginPath();
      this.ctx.moveTo(pos, this.padding);
      this.ctx.lineTo(pos, this.canvas.height - this.padding);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, pos);
      this.ctx.lineTo(this.canvas.width - this.padding, pos);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = '#333';
    const dotSize = 3;
    const dotPositions = [3, 7, 11];
    for (const row of dotPositions) {
      for (const col of dotPositions) {
        const x = this.padding + col * this.cellSize;
        const y = this.padding + row * this.cellSize;
        this.ctx.beginPath();
        this.ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  private drawPieces() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = this.state.board[row][col];
        if (!piece) continue;

        const x = this.padding + col * this.cellSize;
        const y = this.padding + row * this.cellSize;
        const radius = this.cellSize * 0.45;

        const isWinning = this.winningPositions.some((p) => p.row === row && p.col === col);

        this.ctx.fillStyle = piece === 'black' ? '#000' : '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        if (piece === 'white') {
          this.ctx.strokeStyle = '#000';
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }

        if (isWinning) {
          this.ctx.strokeStyle = '#FF0000';
          this.ctx.lineWidth = 3;
          this.ctx.stroke();
        }
      }
    }
  }

  private drawHoverEffect() {
    if (!this.hoveredCell || this.state.gameOver) return;

    const { row, col } = this.hoveredCell;
    if (this.state.board[row][col] !== null) return;

    const x = this.padding + col * this.cellSize;
    const y = this.padding + row * this.cellSize;
    const radius = this.cellSize * 0.45;

    this.ctx.fillStyle = this.state.currentPlayer === 'black' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = this.state.currentPlayer === 'black' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
}
