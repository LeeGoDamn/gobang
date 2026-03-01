import { BOARD_SIZE, Player, Position, DIRECTIONS } from './types';

// 搜索深度（越大越强，但越慢）
const SEARCH_DEPTH = 4;

// 分数定义
const SCORES = {
  FIVE: 1000000,      // 连五
  LIVE_FOUR: 100000,  // 活四
  RUSH_FOUR: 10000,   // 冲四
  LIVE_THREE: 5000,   // 活三
  SLEEP_THREE: 500,   // 眠三
  LIVE_TWO: 200,      // 活二
  SLEEP_TWO: 50,      // 眠二
};

export class AI {
  private grid: Player[][];

  constructor(grid: Player[][]) {
    this.grid = grid;
  }

  getBestMove(): Position | null {
    // 先检查必杀：AI 能赢就直接赢
    const winMove = this.findWinningMove(Player.White);
    if (winMove) return winMove;

    // 检查必须防守：玩家要赢了必须挡
    const blockMove = this.findWinningMove(Player.Black);
    if (blockMove) return blockMove;

    // Minimax 搜索
    const moves = this.getSortedMoves();
    if (moves.length === 0) {
      const center = Math.floor(BOARD_SIZE / 2);
      if (this.grid[center][center] === Player.None) {
        return { x: center, y: center };
      }
      return null;
    }

    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      this.grid[move.x][move.y] = Player.White;
      const score = this.minimax(SEARCH_DEPTH - 1, -Infinity, Infinity, false);
      this.grid[move.x][move.y] = Player.None;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // Minimax + Alpha-Beta 剪枝
  private minimax(depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    // 终止条件
    if (depth === 0) {
      return this.evaluateBoard();
    }

    const moves = this.getSortedMoves();
    if (moves.length === 0) {
      return this.evaluateBoard();
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        this.grid[move.x][move.y] = Player.White;
        
        // 检查是否获胜
        if (this.checkWin(move.x, move.y, Player.White)) {
          this.grid[move.x][move.y] = Player.None;
          return SCORES.FIVE * depth; // 越早赢越好
        }

        const score = this.minimax(depth - 1, alpha, beta, false);
        this.grid[move.x][move.y] = Player.None;

        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // 剪枝
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        this.grid[move.x][move.y] = Player.Black;
        
        // 检查是否获胜
        if (this.checkWin(move.x, move.y, Player.Black)) {
          this.grid[move.x][move.y] = Player.None;
          return -SCORES.FIVE * depth; // 越早输越坏
        }

        const score = this.minimax(depth - 1, alpha, beta, true);
        this.grid[move.x][move.y] = Player.None;

        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // 剪枝
      }
      return minScore;
    }
  }

  // 找必杀位置
  private findWinningMove(player: Player): Position | null {
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (this.grid[x][y] !== Player.None) continue;
        if (!this.hasNeighbor(x, y, 2)) continue;

        this.grid[x][y] = player;
        const wins = this.checkWin(x, y, player);
        this.grid[x][y] = Player.None;

        if (wins) return { x, y };
      }
    }
    return null;
  }

  // 获取按优先级排序的候选位置
  private getSortedMoves(): Position[] {
    const moves: { pos: Position; score: number }[] = [];

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (this.grid[x][y] !== Player.None) continue;
        if (!this.hasNeighbor(x, y, 2)) continue;

        const score = this.evaluatePosition(x, y);
        moves.push({ pos: { x, y }, score });
      }
    }

    // 按分数降序排列，优先搜索好的位置
    moves.sort((a, b) => b.score - a.score);
    
    // 限制搜索宽度，提升性能
    return moves.slice(0, 15).map(m => m.pos);
  }

  // 检查周围是否有棋子
  private hasNeighbor(x: number, y: number, dist: number): boolean {
    for (let dx = -dist; dx <= dist; dx++) {
      for (let dy = -dist; dy <= dist; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          if (this.grid[nx][ny] !== Player.None) return true;
        }
      }
    }
    return false;
  }

  // 评估单个位置
  private evaluatePosition(x: number, y: number): number {
    let score = 0;
    
    // AI 进攻分
    this.grid[x][y] = Player.White;
    score += this.evaluatePoint(x, y, Player.White) * 1.1;
    
    // 防守分
    this.grid[x][y] = Player.Black;
    score += this.evaluatePoint(x, y, Player.Black);
    
    this.grid[x][y] = Player.None;
    return score;
  }

  // 评估某个点对某玩家的价值
  private evaluatePoint(x: number, y: number, player: Player): number {
    let score = 0;
    
    for (const { x: dx, y: dy } of DIRECTIONS) {
      const { count, openEnds } = this.analyzeLine(x, y, dx, dy, player);
      score += this.getPatternScore(count, openEnds);
    }
    
    return score;
  }

  // 分析某方向的连子情况
  private analyzeLine(x: number, y: number, dx: number, dy: number, player: Player): { count: number; openEnds: number } {
    let count = 1;
    let openEnds = 0;

    // 正向
    for (let i = 1; i < 5; i++) {
      const nx = x + dx * i, ny = y + dy * i;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        if (this.grid[nx][ny] === player) count++;
        else if (this.grid[nx][ny] === Player.None) { openEnds++; break; }
        else break;
      } else break;
    }

    // 反向
    for (let i = 1; i < 5; i++) {
      const nx = x - dx * i, ny = y - dy * i;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        if (this.grid[nx][ny] === player) count++;
        else if (this.grid[nx][ny] === Player.None) { openEnds++; break; }
        else break;
      } else break;
    }

    return { count, openEnds };
  }

  // 根据棋型返回分数
  private getPatternScore(count: number, openEnds: number): number {
    if (count >= 5) return SCORES.FIVE;
    if (count === 4) {
      if (openEnds >= 2) return SCORES.LIVE_FOUR;
      if (openEnds === 1) return SCORES.RUSH_FOUR;
    }
    if (count === 3) {
      if (openEnds >= 2) return SCORES.LIVE_THREE;
      if (openEnds === 1) return SCORES.SLEEP_THREE;
    }
    if (count === 2) {
      if (openEnds >= 2) return SCORES.LIVE_TWO;
      if (openEnds === 1) return SCORES.SLEEP_TWO;
    }
    return 0;
  }

  // 评估整个棋盘
  private evaluateBoard(): number {
    let score = 0;

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (this.grid[x][y] === Player.White) {
          score += this.evaluatePoint(x, y, Player.White);
        } else if (this.grid[x][y] === Player.Black) {
          score -= this.evaluatePoint(x, y, Player.Black);
        }
      }
    }

    return score;
  }

  // 检查胜利
  private checkWin(x: number, y: number, player: Player): boolean {
    for (const { x: dx, y: dy } of DIRECTIONS) {
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
}
