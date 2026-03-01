import './style.css';
import { Game } from './game/Game';

// 创建应用 HTML 结构
const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="flex flex-col items-center gap-6 p-4">
    <h1 class="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">🎮 五子棋</h1>
    <div id="status" class="text-center text-white text-xl font-semibold min-h-12 bg-white/10 px-6 py-2 rounded-lg backdrop-blur-sm">⚫ 黑棋先手（你）</div>
    <canvas id="gameCanvas" width="600" height="600" class="bg-amber-100 border-4 border-amber-900 rounded-lg shadow-2xl"></canvas>
    <div class="flex gap-4">
      <button id="resetBtn" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105">🔄 新游戏</button>
      <button id="undoBtn" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">↩️ 悔棋</button>
    </div>
    <div class="text-white/60 text-sm mt-4">AI 使用 Minimax + Alpha-Beta 剪枝算法</div>
  </div>
`;

// 初始化游戏
new Game();
