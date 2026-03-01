import { Board, CellState, GameState, Player, Position, WinResult } from '../types';

export const BOARD_SIZE = 15;

export const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'black',
    winner: null,
    moveHistory: [],
    gameOver: false,
  };
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getCell(board: Board, row: number, col: number): CellState | undefined {
  if (!isValidPosition(row, col)) return undefined;
  return board[row][col];
}

export function setCell(board: Board, row: number, col: number, value: CellState): Board {
  const newBoard = board.map((r) => [...r]);
  newBoard[row][col] = value;
  return newBoard;
}

export function checkLine(
  board: Board,
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  player: Player
): Position[] {
  const positions: Position[] = [{ row, col }];
  
  for (let i = 1; i < 5; i++) {
    const newRow = row + dRow * i;
    const newCol = col + dCol * i;
    const cell = getCell(board, newRow, newCol);
    if (cell !== player) break;
    positions.push({ row: newRow, col: newCol });
  }
  
  for (let i = 1; i < 5; i++) {
    const newRow = row - dRow * i;
    const newCol = col - dCol * i;
    const cell = getCell(board, newRow, newCol);
    if (cell !== player) break;
    positions.push({ row: newRow, col: newCol });
  }
  
  return positions;
}

export function checkWin(board: Board, row: number, col: number): WinResult | null {
  const player = board[row][col];
  if (!player) return null;
  
  for (const [dRow, dCol] of DIRECTIONS) {
    const positions = checkLine(board, row, col, dRow, dCol, player);
    if (positions.length >= 5) {
      return { winner: player, positions: positions.slice(0, 5) };
    }
  }
  
  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

export function makeMove(state: GameState, row: number, col: number): GameState {
  if (state.gameOver) return state;
  if (!isValidPosition(row, col)) return state;
  if (state.board[row][col] !== null) return state;
  
  const newBoard = setCell(state.board, row, col, state.currentPlayer);
  const winResult = checkWin(newBoard, row, col);
  
  if (winResult) {
    return {
      ...state,
      board: newBoard,
      winner: winResult.winner,
      moveHistory: [...state.moveHistory, { row, col }],
      gameOver: true,
    };
  }
  
  if (isBoardFull(newBoard)) {
    return {
      ...state,
      board: newBoard,
      winner: 'draw',
      moveHistory: [...state.moveHistory, { row, col }],
      gameOver: true,
    };
  }
  
  return {
    ...state,
    board: newBoard,
    currentPlayer: state.currentPlayer === 'black' ? 'white' : 'black',
    moveHistory: [...state.moveHistory, { row, col }],
  };
}

export function getOpponent(player: Player): Player {
  return player === 'black' ? 'white' : 'black';
}

export function resetGame(): GameState {
  return createInitialState();
}
