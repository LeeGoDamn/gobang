import { BOARD_SIZE, Player, Position, DIRECTIONS } from './types';

export class AI {
  private grid: Player[][];

  constructor(grid: Player[][]) {
    this.grid = grid;
  }

  // 获取最佳移动
  getBestMove(): Position | null {
    const moves = this.getAvailableMoves();
    if (moves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      const score = this.evaluatePosition(move.x, move.y, Player.White);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // 获取可用移动位置
  private getAvailableMoves(): Position[] {
    const moves: Position[] = [];

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (this.grid[x][y] === Player.None && this.hasNeighbor(x, y, 2)) {
          moves.push({ x, y });
        }
      }
    }

    // 如果没有可用位置，下在中心
    if (moves.length === 0) {
      const center = Math.floor(BOARD_SIZE / 2);
      if (this.grid[center][center] === Player.None) {
        moves.push({ x: center, y: center });
      }
    }

    return moves;
  }

  // 检查周围是否有棋子
  private hasNeighbor(x: number, y: number, dist: number): boolean {
    for (let dx = -dist; dx <= dist; dx++) {
      for (let dy = -dist; dy <= dist; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          if (this.grid[nx][ny] !== Player.None) return true;
        }
      }
    }
    return false;
  }

  // 评估位置分数
  private evaluatePosition(x: number, y: number, player: Player): number {
    let score = 0;
    const opponent = player === Player.White ? Player.Black : Player.White;

    // 检查 AI 是否能赢
    this.grid[x][y] = player;
    if (this.checkWin(x, y, player)) {
      this.grid[x][y] = Player.None;
      return 100000;
    }

    // 检查对手是否能赢（需要阻挡）
    this.grid[x][y] = opponent;
    if (this.checkWin(x, y, opponent)) {
      this.grid[x][y] = Player.None;
      return 90000;
    }

    // 恢复 AI 棋子进行详细评估
    this.grid[x][y] = player;

    // 评估各方向
    for (const { x: dx, y: dy } of DIRECTIONS) {
      const { count, openEnds } = this.countLine(x, y, dx, dy, player);
      score += this.getPatternScore(count, openEnds);
    }

    // 清理
    this.grid[x][y] = Player.None;
    return score;
  }

  // 计算某方向的连子数和开放端数
  private countLine(
    x: number, y: number,
    dx: number, dy: number,
    player: Player
  ): { count: number; openEnds: number } {
    let count = 1;
    let openEnds = 0;

    // 正向
    for (let i = 1; i < 5; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        if (this.grid[nx][ny] === player) count++;
        else if (this.grid[nx][ny] === Player.None) {
          openEnds++;
          break;
        } else break;
      } else break;
    }

    // 反向
    for (let i = 1; i < 5; i++) {
      const nx = x - dx * i;
      const ny = y - dy * i;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        if (this.grid[nx][ny] === player) count++;
        else if (this.grid[nx][ny] === Player.None) {
          openEnds++;
          break;
        } else break;
      } else break;
    }

    return { count, openEnds };
  }

  // 根据连子数和开放端数计算分数
  private getPatternScore(count: number, openEnds: number): number {
    if (count >= 5) return 100000;
    if (count === 4 && openEnds >= 2) return 50000;  // 活四
    if (count === 4 && openEnds === 1) return 10000; // 冲四
    if (count === 3 && openEnds >= 2) return 5000;   // 活三
    if (count === 3 && openEnds === 1) return 500;   // 眠三
    if (count === 2 && openEnds >= 2) return 100;    // 活二
    return 0;
  }

  // 检查是否获胜
  private checkWin(x: number, y: number, player: Player): boolean {
    for (const { x: dx, y: dy } of DIRECTIONS) {
      let count = 1;

      // 正向
      for (let i = 1; i < 5; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          if (this.grid[nx][ny] === player) count++;
          else break;
        } else break;
      }

      // 反向
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
}
