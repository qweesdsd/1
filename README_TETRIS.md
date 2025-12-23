# Tetris MVP

这是一个最小可运行的 Tetris 演示（TypeScript + Vite + HTML5 Canvas）。

运行：

```bash
npm install
npm run dev
```

控制：
- ← → 移动
- ↑ 旋转
- ↓ 软下落
- Space 硬下落
- C Hold

说明：实现了基本方块、旋转、行消除、计分与简单的 Hold。后续可加入影子、T-spin、排行榜等功能。

部署：
- 本项目配置了 GitHub Actions 自动构建并部署到 GitHub Pages（触发条件：推送到 `main` 分支）。
- Vite 已配置为相对 `base`（`./`），以便在 Pages 中正确加载资源。
