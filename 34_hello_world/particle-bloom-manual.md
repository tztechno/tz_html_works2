# Particle Bloom — User Manual
# 「Particle Bloom」使用マニュアル

*A bilingual (English / Japanese) guide to `particle-bloom.html`.*
*`particle-bloom.html` の英和バイリンガル・ガイドです。*

---

## 1. Overview

**Particle Bloom** takes any picture you choose and dissolves it into a mosaic of small square tiles, each colored from the image itself. While the particles are still moving, you're looking at a particle field; once they settle, the app quietly swaps in the real image at full resolution, so the resting picture is visually indistinguishable from the original photo. Dragging your cursor (or finger) through it — or clicking/tapping — pushes the particles aside and reveals the mosaic doing the disturbing. Until you load a picture, it shows a "Hello, World" particle demo.

## 1. 概要

**Particle Bloom** は、選んだ画像を、その画像自身の色をまとった小さな正方形タイルのモザイクへと分解するアプリです。粒子が動いている間はモザイクとして見えていますが、静止すると裏でこっそり元画像をフル解像度で重ねるため、静止した状態は元の写真と見た目上区別がつきません。カーソル（またはスマホでは指）でなぞったり、クリック／タップしたりすると、その場所の粒子が押しのけられ、動いているモザイクの姿が現れます。画像を読み込むまでは「Hello, World」の粒子デモが表示されます。

---

## 2. What you'll see

- The same deep indigo, starfield backdrop throughout.
- By default: the "Hello, World" particle text.
- After choosing an image: the particles reassemble into that image's shapes and colors, then — once they stop moving — the real photo quietly fades in on top, pixel for pixel.
- A "Choose image" button, top-right.
- A footer status line showing either the demo's rotating print-statement, or the loaded file's name and particle count.
- Moving the cursor (or dragging a finger) opens a soft "window" that always shows the particles actually being disturbed, wherever it is on the image — even while the rest of the picture is sitting fully resolved.

## 2. 表示される内容

- 深いインディゴ色の星空背景は一貫しています。
- 初期状態では「Hello, World」の粒子テキスト。
- 画像を選択すると、まずその画像の形と色で粒子が再構成され、動きが止まると裏で元の写真がピクセル単位でそのままフェードインします。
- 右上に「Choose image」ボタン。
- 左下のステータス行には、デモ中は言語別のprint文が、画像読み込み後はファイル名と粒子数が表示されます。
- カーソル（スマホでは指）を動かすと、その場所にだけ柔らかい「窓」が開き、静止した部分がどれだけ完成していても、触れている場所の粒子の動きは常にはっきり見えます。

---

## 3. Controls

| Action (desktop) | Action (touch) | Effect |
|---|---|---|
| Click "Choose image" | Tap "Choose image" | Opens a picker to select any image (JPEG, PNG, WebP, etc.) — on phones this also offers the camera |
| Drag an image file onto the page | — | Drops it in the same way as choosing one (desktop only) |
| Move the cursor | Drag a finger | Nearby particles are pushed aside; a window opens there showing the mosaic in motion |
| Click anywhere | Tap anywhere | Scatters all particles outward, then springs them back into formation |
| Load a new image at any time | Same | The current particles morph into the new image instead of resetting |

## 3. 操作方法

| 操作（PC） | 操作（タッチ） | 効果 |
|---|---|---|
| 「Choose image」をクリック | 「Choose image」をタップ | 画像（JPEG・PNG・WebPなど）を選ぶピッカーが開きます。スマホではカメラも選べます |
| 画像ファイルをページにドラッグ＆ドロップ | ー（PCのみ） | 選択した場合と同様に読み込まれます |
| カーソルを動かす | 指でドラッグする | 近くの粒子が押しのけられ、その場所にモザイクが動く様子を映す窓が開きます |
| どこかをクリックする | どこかをタップする | 全ての粒子が一度外側へ飛び散り、その後元の形に戻ります |
| 別の画像をいつでも読み込み直せる | 同上 | 今表示されている粒子が、リセットされずにそのまま新しい画像の形へ変形します |

---

## 4. Technical notes

- Everything happens locally in your browser. The chosen image is never uploaded anywhere.
- **Mosaic sampling**: the image is fitted into a box on screen, then divided into a fine grid (roughly 17,000–22,000 tiles depending on image shape). Each tile's color is the *average* of every source pixel inside it — not a single sampled point — so edges and gradients stay smooth instead of noisy. Tiles are square, not round, so they tile edge-to-edge like a real mosaic.
- **"Indistinguishable from the original"**: once a tile's particles are within a few pixels of their target position, the app fades in the actual source image at full resolution on top of the mosaic. This is a crossfade driven by how settled the particles currently are — so the picture you see at rest isn't limited by the particle count at all.
- **Local disturbance window**: moving the cursor doesn't just nudge particles — it also cuts a soft, cursor-sized hole into that crisp overlay (on its own off-screen layer, so it reveals the real particle motion underneath rather than the page background). That's what keeps the "avoiding the cursor" effect visible even when the rest of the image has already resolved to full sharpness.
- Pixels that are mostly transparent (a PNG with a cut-out background) are skipped, so a logo or sticker keeps its silhouette.
- Particle motion is a lightweight spring simulation (pull toward target + damping) — no physics library involved.
- If your OS has "reduce motion" turned on, the animation simplifies automatically.
- **Mobile**: the page includes a proper viewport tag, disables pinch-zoom/pull-to-refresh so touch gestures control the particles instead of the browser, adds safe-area padding for notches, and re-fits itself on rotation. Touch has no hover, so the hint text and interaction switch to "drag to disturb · tap to reform" automatically.
- Fonts: **Fraunces** (the default "Hello, World" demo only) and **JetBrains Mono** (UI text), both from Google Fonts.

## 4. 技術的な仕組み

- 処理はすべてブラウザ内で完結します。選んだ画像はどこにもアップロードされません。
- **モザイクのサンプリング**：画像は画面上の枠に収められた後、細かい格子（画像の形によりおよそ17,000〜22,000タイル）に分割されます。各タイルの色は、その範囲内の全ピクセルの「平均値」であり、1点だけのサンプリングではありません。そのため輪郭やグラデーションがノイズっぽくならず滑らかになります。タイルは丸ではなく正方形なので、本物のモザイクのように隙間なく敷き詰められます。
- **「元画像と見分けがつかない」仕組み**：各タイルの粒子が目標位置の数ピクセル以内に収まると、モザイクの上に元画像をフル解像度でフェード表示します。これは粒子がどれだけ静止しているかに応じたクロスフェードなので、静止時に見える画質は粒子数に一切左右されません。
- **局所的な「乱れの窓」**：カーソルを動かすと、粒子を物理的に押しのけるだけでなく、その場所に合わせてクリスプなオーバーレイ側にも柔らかい穴を開けています（別レイヤーで処理しているため、ページの背景ではなく実際に動いている粒子が見えます）。これにより、画像の他の部分が完全に元画像へ収束していても、カーソルを避ける動きは常にはっきり見えます。
- 背景が透過されたPNG画像などで、ほぼ透明なピクセルはスキップされるため、ロゴやステッカー画像はシルエットの形を保ちます。
- 粒子の動きは軽量なばねシミュレーション（目標位置への引力＋減衰）で、物理演算ライブラリは使用していません。
- OS側で「視差効果を減らす」設定が有効な場合、演出は自動的に簡略化されます。
- **スマホ対応**：正しいviewport指定、ピンチズームや引っ張って更新の無効化（タッチ操作がブラウザではなく粒子を操作するように）、ノッチ部分を避ける余白調整、画面回転時の再レイアウトに対応しています。タッチにはホバーの概念がないため、ヒント文言と操作は自動的に「drag to disturb（指でドラッグ）・tap to reform（タップで再結晶）」に切り替わります。
- 使用フォントは **Fraunces**（デフォルトの "Hello, World" デモにのみ使用）と **JetBrains Mono**（UI全般）で、いずれもGoogle Fontsから読み込まれています。

---

## 5. File

`particle-bloom.html` — open directly in a browser (double-click, or drag it into a browser window) on desktop or mobile. No build step, no server, and no account needed.

## 5. ファイルについて

`particle-bloom.html` — PC・スマホ問わず、ブラウザで直接開いてください（ダブルクリック、またはブラウザウィンドウへのドラッグ＆ドロップ）。ビルド作業もサーバーもアカウントも不要です。
