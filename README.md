# 🎮 五子棋 - 人机对战

一个纯静态的五子棋游戏，支持人机对战。

## 功能特性

- **15x15 标准棋盘** - 带星位标记
- **AI 对战** - 使用 Minimax + Alpha-Beta 剪枝算法
- **三档难度** - 简单 / 中等 / 困难
- **悔棋功能** - 撤销最近一步
- **战绩统计** - 自动保存到 localStorage
- **精美 UI** - 渐变背景、玻璃态面板

## 如何游玩

直接在浏览器中打开 `index.html` 即可开始游戏。

黑方（玩家）先手，白方（AI）后手。

## AI 算法

使用经典的 **Minimax** 算法配合 **Alpha-Beta 剪枝**：

- 简单模式：搜索深度 2
- 中等模式：搜索深度 3  
- 困难模式：搜索深度 4

## 技术栈

- 纯 HTML + CSS + JavaScript
- 无需任何依赖
- 响应式设计

## 部署

本项目使用 GitHub Pages 托管，访问 https://leegodamn.github.io/gobang 即可在线游玩。

## License

MIT
