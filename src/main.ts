import './style.css';
import { Game } from './game/Game';

// 创建应用 HTML 结构
const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="min-h-screen bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 flex flex-col items-center justify-center gap-6 p-4">
    <h1 class="text-4xl md:text-5xl font-bold text-amber-400 drop-shadow-lg">🎮 五子棋</h1>
    <div id="status" class="text-center text-slate-900 text-xl font-bold min-h-12 bg-amber-200 px-8 py-3 rounded-xl shadow-lg border-2 border-amber-400">⚫ 黑棋先手（你）</div>
    <canvas id="gameCanvas" width="600" height="600" class="bg-amber-100 border-4 border-amber-700 rounded-xl shadow-2xl"></canvas>
    <div class="flex gap-4">
      <button id="resetBtn" class="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">🔄 新游戏</button>
      <button id="undoBtn" class="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">↩️ 悔棋</button>
    </div>
    <div class="text-slate-300 text-sm mt-2 bg-slate-700/50 px-4 py-2 rounded-lg">AI 使用启发式评估算法</div>
  </div>
`;

// 初始化游戏
new Game();
