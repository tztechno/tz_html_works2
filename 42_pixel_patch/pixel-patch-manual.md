# Pixel Patch — User Manual

Pixel Patch is a browser-based tool for erasing small unwanted regions in a
photo — dust specks, stray objects, blemishes — by filling the selected area
with a color sampled from the image itself, instead of a plain black or
white box.

This manual covers both languages: English first, 日本語 below.

---

## English

### 1. Opening the app

- **Published version**: open the Artifact link. It runs inside the Claude
  artifact viewer, so the **Download PNG** button saves through a proper
  save dialog.
- **Standalone file** (`pixel-patch.html`): open it directly in any browser
  — double-click the file, or serve it from `localhost`. Everything works
  the same way, except Download PNG uses a normal browser download instead
  of the artifact save dialog.

The app opens with a small example scene already loaded (a sky, a sun, a
bird, and a couple of dust specks) so you can try every tool immediately,
before loading your own photo.

### 2. Loading your photo

Click **Load image**, or drag and drop an image file onto the canvas. Large
images are automatically scaled down (to a maximum of 1600 px on the long
edge) to keep the app responsive; this does not affect the quality of what
you see on screen, only very large source files are resized.

### 3. Choosing a tool

The **Tool** group switches between three modes:

| Tool | What it does |
|---|---|
| **Rectangle** | Drag a box over the area to erase. |
| **Lasso** | Draw a freehand outline around the area to erase. |
| **Eyedropper** | Click anywhere on the image to sample that pixel's color as the fill color. Hovering shows a live color preview near the cursor before you click. |

The hint line under the toolbar always describes what the current tool
does.

### 4. Picking the fill color

The **Fill color** group shows the color that will be used to erase the
next selection:

- The swatch and hex code show the current color.
- The small caption under the hex code says where it came from
  (*auto-detected background*, *picked from image*, or *custom*).
- **Auto** samples several points around the edges of the photo (the four
  corners plus the top and left mid-points) and picks the most common
  color among them — a quick way to match a plain background.
- The small color swatch next to Auto opens your browser's native color
  picker if you want to fine-tune the color manually.
- Switching to the **Eyedropper** tool and clicking the photo is the most
  direct way to pick an exact color that already exists in the image.

### 5. Erasing a region

With **Rectangle** or **Lasso** selected, drag across the area you want to
remove. As soon as you release the mouse (or lift your finger), that area
is immediately filled with the current fill color — there is no separate
"confirm" step. Selections smaller than a few pixels are ignored, so an
accidental click does nothing.

### 6. Undo, Reset, and Export

- **Undo** (or **Ctrl/Cmd+Z**) reverts the last erase, up to 20 steps back.
- **Reset** restores the image exactly as it was when it was first loaded,
  discarding all edits.
- **Download PNG** saves the current canvas as a PNG file, named after the
  original file plus `-erased`.

### 7. Switching languages

The **EN / 日本語** switch in the top-right corner changes every label,
hint, and status message in the app. Your choice is remembered for next
time (when the browser allows it); otherwise the app guesses from your
browser's language setting.

### 8. Good to know

- The fill is a flat, solid color — this tool is best for small blemishes
  on a fairly uniform background (sky, sand, a plain wall, sensor dust),
  not for removing objects from busy or textured areas.
- Nothing you do here is uploaded anywhere; all editing happens locally in
  your browser.

---

## 日本語

### 1. アプリを開く

- **公開版(Artifact)**: Artifactのリンクを開きます。Claudeのビューア内で動作するため、
  「Download PNG」ボタンは正式な保存ダイアログ経由で保存されます。
- **スタンドアロン版**(`pixel-patch.html`): ファイルをダブルクリックするか、
  localhostなどのサーバーで配信して、任意のブラウザで直接開けます。動作は同じですが、
  Download PNGはArtifactの保存ダイアログではなく、通常のブラウザのダウンロード機能を
  使います。

起動時にはサンプルの風景(空・太陽・鳥・ほこりの点)がすでに読み込まれているので、
自分の写真を読み込む前に、すべてのツールをすぐに試せます。

### 2. 写真を読み込む

「画像を読み込む」をクリックするか、画像ファイルをキャンバスにドラッグ&ドロップします。
大きな画像は自動的に縮小されます(長辺が最大1600px)。これはアプリを快適に動かすためで、
画面上の見た目には影響しません。非常に大きい元画像のみリサイズされます。

### 3. ツールを選ぶ

「ツール」グループで3つのモードを切り替えられます。

| ツール | できること |
|---|---|
| **矩形選択** | 消したい範囲を四角くドラッグして選択します。 |
| **なげなわ** | 消したい範囲を自由な線でなぞって選択します。 |
| **スポイト** | 画像上をクリックすると、その位置のピクセルの色を塗りつぶし色として採取します。クリック前にカーソル付近にプレビューが表示されます。 |

ツールバーの下のヒント文には、選択中のツールの操作方法が常に表示されます。

### 4. 塗りつぶす色を決める

「塗りつぶす色」グループには、次に選択した範囲を消すときに使う色が表示されます。

- スワッチとHEXコードが現在の色を示します。
- HEXコードの下の小さな文字は、その色の出どころ(「背景から自動検出」「画像から採取」
  「手動設定」)を表します。
- **自動**ボタンは、写真の端の数か所(四隅と上・左の中点)をサンプリングし、
  最も多かった色を採用します。単色に近い背景に素早く合わせたいときに便利です。
- 自動ボタンの隣の小さなスワッチをクリックすると、ブラウザ標準のカラーピッカーが開き、
  手動で色を微調整できます。
- 画像に実際に存在する色を正確に採りたい場合は、「スポイト」ツールに切り替えて
  写真をクリックするのが最も確実です。

### 5. 範囲を消す

「矩形選択」または「なげなわ」を選んだ状態で、消したい範囲をドラッグします。
マウスを離す(または指を離す)と同時に、その範囲は現在の塗りつぶし色で即座に
塗りつぶされます。別途「確定」ボタンを押す必要はありません。数ピクセルより小さい
選択は無視されるため、誤クリックしても何も起きません。

### 6. 元に戻す・リセット・書き出し

- **元に戻す**(または **Ctrl/Cmd+Z**)は、直前の消去を取り消します。最大20手順まで
  さかのぼれます。
- **リセット**は、最初に読み込んだ状態まで画像を復元し、すべての編集を破棄します。
- **PNGをダウンロード**は、現在のキャンバスをPNGファイルとして保存します。
  ファイル名は元のファイル名に `-erased` を付けたものになります。

### 7. 言語を切り替える

右上の「EN / 日本語」スイッチで、アプリ内のすべてのラベル・ヒント・ステータス表示を
切り替えられます。選んだ言語はブラウザが許す範囲で記憶され、次回開いたときもそのまま
使われます。記憶できない場合は、ブラウザの言語設定から自動判定されます。

### 8. 知っておくと良いこと

- 塗りつぶしは単色(ベタ塗り)です。空・砂浜・無地の壁・センサーのほこりなど、
  比較的均一な背景にある小さな汚れを消すのに向いています。模様や質感のある
  複雑な背景から物体を消すのには向いていません。
- ここでの操作はどこにもアップロードされません。編集はすべてブラウザ内で
  ローカルに行われます。
