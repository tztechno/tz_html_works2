# Cutting Room — 取扱説明書 / User Manual

Cutting Room は、ブラウザだけで動画のトリミング（カット）と結合（コンカット）ができるツールです。サーバーには一切アップロードされず、すべての処理はこのタブの中で完結します。

Cutting Room is a browser-only tool for trimming (cutting) and concatenating video clips. Nothing is uploaded to a server — everything runs inside this browser tab.

---

## 日本語

### 1. 画面構成

- **Media Bin（左）**: 読み込んだクリップの一覧。並び替え・削除・編集対象の選択を行います。
- **Monitor（右上）**: 選択中のクリップのプレビューと、カット（切断）操作を行うエリアです。
- **Combine（下部）**: 全クリップの「残す部分」を合計した長さを表示し、結合（書き出し）を実行します。

Media Bin に並んだ順番が、そのまま最終的な結合順になります。別途「シーケンス」のような概念はありません。

### 2. クリップを読み込む

- 右上の「+ Add clips」または左側の破線エリアをクリックしてファイルを選択するか、動画ファイルをドラッグ＆ドロップします。
- 複数ファイルを一度に追加できます。
- 追加した直後は自動的に1本目がMonitorで開きます。

### 3. クリップを切断する（2段階方式）

1. Media Bin でクリップの「Cut」（または行自体）をクリックし、Monitorに読み込みます。
2. Monitorの下にある**ルーラー**（横長の帯）をクリックすると、その位置にオレンジ色の点滅マーカーが表示され、Monitorの映像もその時刻にシークします。この時点ではまだ何も切れていません（プレビューのみ）。
3. マーカーの位置でよければ、表示された「**Confirm cut**」ボタンを押すと、実際にその位置でクリップが2つに分割されます（赤い印になり、ピースの帯が分かれます）。
4. やめる場合は「**Cancel**」を押してください。位置を変えたい場合は、確定前にルーラーの別の場所をもう一度クリックすればマーカーが移動します（重複して増えることはありません）。

### 4. 不要な部分を捨てる

- 切断すると、下に「ピース（区間）」が横並びで表示されます。
- 残したいピースはそのまま、**不要なピースはクリック**すると斜線パターンになり「✕ removed」と表示され、結合対象から除外されます。
- もう一度クリックすると元に戻せます（復活）。
- 「Undo all cuts」ボタンで、そのクリップのすべての切断を取り消し、1本の状態に戻せます。

### 5. クリップの順番を変える

- Media Bin の各クリップ右側にある ▲ / ▼ ボタンで、結合時の順番を入れ替えられます。

### 6. 結合して書き出す

- 画面下部の「**Combine kept clips**」を押すと、Media Bin の順番どおりに、残したピースだけをつなげて1本の動画に書き出します。
- 書き出し中は進捗バーが表示されます（元の再生時間とほぼ同じだけ時間がかかります）。
- 完了すると「Save file」「Preview」ボタンが表示されます。「Preview」で結果を確認できます。

### 7. 保存する（Save file）

「Save file」を押すと、次の順番で保存を試みます。

1. **ブラウザの「名前を付けて保存」ダイアログ**（Chrome / Edge などChromium系ブラウザのみ）が開き、保存先フォルダとファイル名を自分で選べます。
2. これが使えない環境（アプリ埋め込み表示など）では、Cowork/Claude側の保存機能にフォールバックします。
3. どちらも使えない場合は、その旨のメッセージが表示されます。その場合は、このArtifactのリンクを通常のブラウザタブで開いて試してください。

**ヒント**: 埋め込み表示だと保存が正しく完了しない場合があるため、うまく保存できないときはブラウザで直接開くことをおすすめします。

### 8. 注意点

- 最初の切断を行うと、Monitorのプレビュー音声は聞こえなくなります（内部で音声を録音用に取り込むため）。ただし**書き出される動画の音声には影響ありません**。
- 書き出し（MP4/WebM生成）にはブラウザの `MediaRecorder` 機能を使用しています。Chrome/Edgeなど主要なChromium系ブラウザでの利用を推奨します。
- 動画ファイルはこのタブのメモリ上でのみ扱われます。タブを閉じると読み込んだクリップは失われるため、作業前にファイルを手元に用意しておいてください。

---

## English

### 1. Layout

- **Media Bin (left)**: the list of loaded clips. Reorder, remove, or pick which clip to edit here.
- **Monitor (top right)**: preview and cut the currently selected clip.
- **Combine (bottom)**: shows the total kept duration across all clips and runs the final combine/export.

The order of clips in the Media Bin is exactly the order they'll be combined in — there's no separate "sequence" concept to manage.

### 2. Adding clips

- Click "+ Add clips" (top right) or the dashed drop area (left) to browse, or drag and drop video files directly.
- You can add multiple files at once.
- The first clip added opens automatically in the Monitor.

### 3. Cutting a clip (two-stage: preview, then confirm)

1. In the Media Bin, click "Cut" (or the row itself) to load a clip into the Monitor.
2. Click the **ruler** strip below the Monitor. This shows a pulsing orange marker at that position and seeks the Monitor's video to that exact frame — nothing is cut yet, it's just a preview.
3. If the position looks right, click the **"Confirm cut"** button that appears — this actually splits the clip there (the marker turns solid red and the piece row splits).
4. Click **"Cancel"** to discard the pending marker instead. Clicking the ruler again before confirming just moves the pending marker — it never stacks multiple pending cuts.

### 4. Discarding unwanted parts

- After a cut, the "pieces" (segments) appear side by side below the ruler.
- Keep a piece as-is, or **click a piece to discard it** — it turns into a diagonal-striped block labeled "✕ removed" and is excluded from the combined output.
- Click it again to bring it back.
- "Undo all cuts" resets that clip back to a single, fully-kept piece.

### 5. Reordering clips

- Use the ▲ / ▼ buttons next to each clip in the Media Bin to change the combine order.

### 6. Combining and exporting

- Click **"Combine kept clips"** at the bottom to stitch together only the kept pieces, in Media Bin order, into a single video.
- A progress bar shows while exporting (it takes roughly as long as the combined video's own runtime, since it plays each segment through in real time).
- When done, "Save file" and "Preview" buttons appear. Use "Preview" to check the result before saving.

### 7. Saving the result

Clicking **"Save file"** tries, in order:

1. A native browser **"Save As" dialog** (Chromium browsers — Chrome, Edge, etc.) letting you pick the exact folder and filename yourself.
2. If that's unavailable (e.g. viewed embedded inside the chat panel), it falls back to the built-in Cowork/Claude save capability.
3. If neither works, you'll see a message saying so — in that case, open this Artifact's link in a regular browser tab and try again from there.

**Tip**: saving can sometimes silently fail to land on disk when viewed embedded in an app panel. If "Save file" doesn't produce a file where you expect, open the Artifact link directly in your browser and save from there.

### 8. Notes and limitations

- Once you make your first cut, the Monitor's live preview audio goes silent (its audio is being routed internally for recording instead). **This does not affect the audio in the exported file.**
- Export (producing the MP4/WebM) uses the browser's `MediaRecorder` API. A modern Chromium-based browser (Chrome, Edge) is recommended.
- All video data lives only in this tab's memory. Closing the tab discards loaded clips, so keep your original files handy.
