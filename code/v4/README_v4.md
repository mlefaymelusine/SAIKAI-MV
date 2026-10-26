# SAIKAI v4

Remotion 工程，和 v1–v3 共用上一级的 `node_modules`、`package.json`。旧版本的文件一概没动。

## 出片

在 `mv_saikai` 根目录运行：

```
npx remotion render v4/src/index.ts SaikaiV4 v4/out/SAIKAI_v4_1080p.mp4 --public-dir v4/public
```

预览：`npx remotion studio v4/src/index.ts --public-dir v4/public`

## 目录

- `src/cues.ts`：除歌词起点外的所有时间点（m = 由 whisper 或响度曲线测得，e = 估计）。改时间只改这里。
- `src/timeline.ts`：30 个镜头的时间表、唯一一句对白字幕、阿赖耶独白条幅。
- `src/shots/A–D.tsx`：各镜头。`src/comp/`：纸片物件库、条幅、字幕、公用组件。
- `public/seq/`：序列帧。
  - `safe`、`roofA`、`roofB`、`roofBurned`、`bookOpen`、`bookClose`：Blender 渲染。
  - `reunion`：重逢图的局部消散。
  - `webtunnel`：从 v2 复制。
- `public/img4/`：同行与独行两张透明底人物图。`public/img/sword_h.png`、`sheathed_h.png` 来自 v3。
- `blender/`：三个 Blender 场景（保险箱、屋顶、里恩的书）。
  - `common4.py` 是平涂材质加 Freestyle 描边的公用部分。
  - `render_*.sh` 是批量渲染脚本。
  - 只能用 Cycles CPU 在后台渲染。
- `tools/`：人物图合成脚本（`walk_layers.py`、`walk_rgba.py`）和重逢序列脚本（`reunion_seq.py`）。

## 改了文字之后

字体是按用到的字做的子集（`public/fonts/`）。改歌词、条幅或任何画面文字后，要重新生成子集，否则新字会显示成后备字体。
