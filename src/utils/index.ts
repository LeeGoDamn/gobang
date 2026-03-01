import { GameState, Position } from '../types';

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getMoveNumber(state: GameState, pos: Position): number {
  const index = state.moveHistory.findIndex((p) => p.row === pos.row && p.col === pos.col);
  return index >= 0 ? index + 1 : 0;
}

export function formatPlayer(player: 'black' | 'white' | 'draw' | null): string {
  if (player === 'black') return '黑棋';
  if (player === 'white') return '白棋';
  if (player === 'draw') return '平局';
  return '';
}
