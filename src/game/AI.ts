import { BOARD_SIZE, Player, Position, DIRECTIONS } from './types';

const SEARCH_DEPTH = 4;

const SCORES = {
  FIVE: 1000000,
  LIVE_FOUR: 100000,
  RUSH_FOUR: 10000,
  LIVE_THREE: 5000,
  SLEEP_THREE: 500,
  LIVE_TWO: 200,
  SLEEP_TWO: 50,
};

export class AI {
  private grid: Player[][];
  private aiColor: Player = Player.White;

  constructor(grid: Player[][]) {
    this.grid = grid;
  }

  setAiColor(color: Player): void {
    this.aiColor = color;
  }

  getBestMove(): Position | null {
    const playerColor = this.aiColor === Player.White ? Player.Black : Player.White;

    // AI 能赢就直接赢
    const winMove = this.findWinningMove(this.aiColor);
    if (winMove) return winMove;

    // 玩家要赢了必须挡
    const blockMove = this.findWinningMove(playerColor);
    if (blockMove) return blockMove;

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
      this.grid[move.x][move.y] = this.aiColor;
      const score = this.minimax(SEARCH_DEPTH - 1, -Infinity, Infinity, false);
      this.grid[move.x][move.y] = Player.None;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0) {
      return this.evaluateBoard();
    }

    const moves = this.getSortedMoves();
    if (moves.length === 0) {
      return this.evaluateBoard();
    }

    const playerColor = this.aiColor === Player.White ? Player.Black : Player.White;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        this.grid[move.x][move.y] = this.aiColor;
        
        if (this.checkWin(move.x, move.y, this.aiColor)) {
          this.grid[move.x][move.y] = Player.None;
          return SCORES.FIVE * depth;
        }

        const score = this.minimax(depth - 1, alpha, beta, false);
        this.grid[move.x][move.y] = Player.None;

        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        this.grid[move.x][move.y] = playerColor;
        
        if (this.checkWin(move.x, move.y, playerColor)) {
          this.grid[move.x][move.y] = Player.None;
          return -SCORES.FIVE * depth;
        }

        const score = this.minimax(depth - 1, alpha, beta, true);
        this.grid[move.x][move.y] = Player.None;

        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

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

    moves.sort((a, b) => b.score - a.score);
    return moves.slice(0, 15).map(m => m.pos);
  }

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

  private evaluatePosition(x: number, y: number): number {
    let score = 0;
    const playerColor = this.aiColor === Player.White ? Player.Black : Player.White;
    
    this.grid[x][y] = this.aiColor;
    score += this.evaluatePoint(x, y, this.aiColor) * 1.1;
    
    this.grid[x][y] = playerColor;
    score += this.evaluatePoint(x, y, playerColor);
    
    this.grid[x][y] = Player.None;
    return score;
  }

  private evaluatePoint(x: number, y: number, player: Player): number {
    let score = 0;
    
    for (const { x: dx, y: dy } of DIRECTIONS) {
      const { count, openEnds } = this.analyzeLine(x, y, dx, dy, player);
      score += this.getPatternScore(count, openEnds);
    }
    
    return score;
  }

  private analyzeLine(x: number, y: number, dx: number, dy: number, player: Player): { count: number; openEnds: number } {
    let count = 1;
    let openEnds = 0;

    for (let i = 1; i < 5; i++) {
      const nx = x + dx * i, ny = y + dy * i;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        if (this.grid[nx][ny] === player) count++;
        else if (this.grid[nx][ny] === Player.None) { openEnds++; break; }
        else break;
      } else break;
    }

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

  private evaluateBoard(): number {
    let score = 0;
    const playerColor = this.aiColor === Player.White ? Player.Black : Player.White;

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (this.grid[x][y] === this.aiColor) {
          score += this.evaluatePoint(x, y, this.aiColor);
        } else if (this.grid[x][y] === playerColor) {
          score -= this.evaluatePoint(x, y, playerColor);
        }
      }
    }

    return score;
  }

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
