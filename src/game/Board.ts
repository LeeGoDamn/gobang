import { BOARD_SIZE, CELL_SIZE, PADDING, Player, Position } from './types';

export class Board {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
  }

  // 绘制棋盘
  draw(grid: Player[][], lastMove?: Position): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBoard();
    this.drawPieces(grid);
    if (lastMove) {
      this.drawLastMoveMarker(lastMove);
    }
  }

  // 绘制棋盘底板和网格
  private drawBoard(): void {
    const ctx = this.ctx;

    // 背景
    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 网格线
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
      // 横线
      ctx.beginPath();
      ctx.moveTo(PADDING, PADDING + i * CELL_SIZE);
      ctx.lineTo(PADDING + (BOARD_SIZE - 1) * CELL_SIZE, PADDING + i * CELL_SIZE);
      ctx.stroke();

      // 竖线
      ctx.beginPath();
      ctx.moveTo(PADDING + i * CELL_SIZE, PADDING);
      ctx.lineTo(PADDING + i * CELL_SIZE, PADDING + (BOARD_SIZE - 1) * CELL_SIZE);
      ctx.stroke();
    }

    // 星位点
    const starPoints: Position[] = [
      { x: 3, y: 3 }, { x: 3, y: 11 },
      { x: 11, y: 3 }, { x: 11, y: 11 },
      { x: 7, y: 7 },
    ];

    ctx.fillStyle = '#8b4513';
    for (const point of starPoints) {
      ctx.beginPath();
      ctx.arc(
        PADDING + point.x * CELL_SIZE,
        PADDING + point.y * CELL_SIZE,
        4, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  // 绘制所有棋子
  private drawPieces(grid: Player[][]): void {
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (grid[x][y] !== Player.None) {
          this.drawPiece(x, y, grid[x][y]);
        }
      }
    }
  }

  // 绘制单个棋子
  private drawPiece(x: number, y: number, player: Player): void {
    const centerX = PADDING + x * CELL_SIZE;
    const centerY = PADDING + y * CELL_SIZE;
    const radius = CELL_SIZE / 2 - 2;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

    // 渐变效果
    const gradient = this.ctx.createRadialGradient(
      centerX - 5, centerY - 5, 0,
      centerX, centerY, radius
    );

    if (player === Player.Black) {
      gradient.addColorStop(0, '#444');
      gradient.addColorStop(1, '#000');
    } else {
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(1, '#ddd');
    }

    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  // 绘制最后一步标记
  private drawLastMoveMarker(pos: Position): void {
    const centerX = PADDING + pos.x * CELL_SIZE;
    const centerY = PADDING + pos.y * CELL_SIZE;

    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  // 绘制悬停预览
  drawHover(x: number, y: number): void {
    const centerX = PADDING + x * CELL_SIZE;
    const centerY = PADDING + y * CELL_SIZE;
    const radius = CELL_SIZE / 2 - 2;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fill();
  }

  // 从点击事件获取棋盘坐标
  getPositionFromEvent(e: MouseEvent): Position | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left - PADDING) / CELL_SIZE);
    const y = Math.round((e.clientY - rect.top - PADDING) / CELL_SIZE);

    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      return { x, y };
    }
    return null;
  }
}
