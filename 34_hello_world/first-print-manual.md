# First Print — User Manual
# 「First Print」ユーザーマニュアル

*A bilingual (English / Japanese) guide to the `first-print.html` particle artwork.*
*`first-print.html`（パーティクル・アートワーク）の英和バイリンガル・ガイドです。*

---

## 1. Overview

**First Print** renders the phrase *"Hello, World"* — the first thing almost every program ever prints — as a living field of particles drifting against a starfield. The particles continuously spring toward the shape of the text, so the word stays legible while never sitting still.

## 1. 概要

**First Print** は、ほとんどのプログラムが最初に出力する一文 *"Hello, World"* を、星空を背景に漂う無数の粒子として描く作品です。粒子は常に文字の形へと引き寄せられるように動くため、単語としての可読性を保ちながらも、静止することなく揺らぎ続けます。

---

## 2. What you'll see

- A deep indigo background with a faint, slowly twinkling starfield.
- The words **"Hello, World"** formed out of small glowing dots (mostly warm amber/gold, with a scattering of cool teal).
- A soft warm glow behind the text, like a light source just switched on.
- A slow "breathing" pulse in brightness — a nod to a program's first heartbeat.
- A footer line, bottom-left, showing how `Hello, World` is printed in a different programming language each time you click.

## 2. 表示される内容

- 深いインディゴ色の背景に、かすかに瞬く星々。
- 小さな発光する点（暖色のアンバー／ゴールドが中心で、寒色のティールが少量混ざる）で形作られた **"Hello, World"** の文字。
- 文字の背後にある、灯りがついた瞬間のような柔らかい暖色の光。
- 明るさがゆっくりと「呼吸」するように脈打つ演出（プログラムの最初の鼓動をイメージしています）。
- 左下のフッターには、クリックするたびに別のプログラミング言語での `Hello, World` の出力コードが表示されます。

---

## 3. Controls

| Action | Effect |
|---|---|
| Move the cursor | Particles near the cursor are gently pushed away, rippling the text |
| Click anywhere | Triggers a small "supernova" — particles scatter outward, then spring back into formation, and the footer's code line switches to the next language |
| Do nothing | The text stays formed, twinkling and breathing on its own |

## 3. 操作方法

| 操作 | 効果 |
|---|---|
| カーソルを動かす | カーソル付近の粒子が軽く弾かれ、文字が波打つように揺れます |
| どこかをクリックする | 小さな「超新星」が発生し、粒子が一度外側へ飛び散ってから文字の形に戻ります。同時にフッターのコード行が次の言語に切り替わります |
| 何もしない | 文字はそのままの形を保ちながら、瞬きと呼吸のような明滅を続けます |

---

## 4. Technical notes

- Built as a single self-contained HTML file — no installation, no external app required. Just open it in any modern browser.
- The text is sampled onto a hidden canvas to find which pixels are "lit"; those pixel coordinates become the particles' target positions.
- Particle motion is a simple spring simulation (pull toward target + damping), not a physics library — kept deliberately lightweight.
- If your operating system has "reduce motion" turned on, the animation automatically simplifies: less twinkle, a stiffer spring, and no supernova on click.
- Fonts used: **Fraunces** (the display serif used to shape the text) and **JetBrains Mono** (the footer/caption text), both loaded from Google Fonts.

## 4. 技術的な仕組み

- 単一の自己完結型HTMLファイルとして作られており、インストールや専用アプリは不要です。最新のブラウザで開くだけで動作します。
- 文字は非表示のキャンバス上に一度描画され、「点灯している」ピクセルの座標を抽出することで、各粒子の目標位置として使われています。
- 粒子の動きは、物理演算ライブラリではなく、目標位置に引き寄せられる力と減衰を組み合わせた簡易的なばね(スプリング)シミュレーションです。意図的に軽量な実装にしています。
- OS側で「視差効果を減らす（reduce motion）」設定が有効な場合、演出は自動的に簡略化されます（瞬きが減り、動きが硬くなり、クリックしても超新星は発生しません）。
- 使用フォントは **Fraunces**（文字の形を作る大きなセリフ体）と **JetBrains Mono**（フッター・キャプション用）で、いずれもGoogle Fontsから読み込まれています。

---

## 5. File

`first-print.html` — open directly in a browser (double-click, or drag it into a browser window). No build step, no server needed.

## 5. ファイルについて

`first-print.html` — ブラウザで直接開いてください（ダブルクリック、またはブラウザウィンドウへのドラッグ＆ドロップ）。ビルド作業もサーバーも不要です。
