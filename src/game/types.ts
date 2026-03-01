// 棋盘配置
export const BOARD_SIZE = 15;
export const CELL_SIZE = 40;
export const PADDING = 20;

// 玩家类型
export const enum Player {
  None = 0,
  Black = 1, // 人类玩家
  White = 2, // AI
}

// 坐标
export interface Position {
  x: number;
  y: number;
}

// 移动记录
export interface Move extends Position {
  player: Player;
}

// 游戏状态
export const enum GameStatus {
  Playing,
  PlayerWin,
  AIWin,
}

// 方向向量
export const DIRECTIONS: Position[] = [
  { x: 1, y: 0 },  // 水平
  { x: 0, y: 1 },  // 垂直
  { x: 1, y: 1 },  // 对角线 \
  { x: 1, y: -1 }, // 对角线 /
];

// 评估结果
export interface EvalResult {
  score: number;
  count: number;
  openEnds: number;
}
