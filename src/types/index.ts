export type Player = 'black' | 'white';

export type CellState = Player | null;

export type Board = CellState[][];

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  moveHistory: Position[];
  gameOver: boolean;
}

export interface WinResult {
  winner: Player;
  positions: Position[];
}
