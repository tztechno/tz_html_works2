**Local Storage Inspector** を `localstorage-inspector/` に用意しました。

## 機能

- **一覧表示** — キー・値のプレビュー・サイズ
- **詳細パネル** — JSON のシンタックスハイライト、型判定（string / number / boolean / object / array）
- **検索・並び替え** — キー・値での絞り込み、キー名・サイズ順
- **統計** — エントリ数、合計サイズ、オリジン、ストレージ使用量（対応ブラウザ）
- **操作** — コピー、個別削除、全削除、JSON エクスポート／インポート

## 使い方

ローカルサーバーを起動してブラウザで開いてください。

```bash
cd /Users/shun_ishii/Projects/08_cursor/localstorage-inspector
python3 -m http.server 8765
```

ブラウザで [http://localhost:8765](http://localhost:8765) を開きます。

**注意:** `localStorage` は **オリジン（プロトコル + ホスト + ポート）ごと** に分かれます。このツールで見えるのは、**ツールを開いている URL と同じオリジン** のデータだけです。別サイト（例: `https://example.com`）のデータを見るには、そのサイト上でこのツールを動かす必要があります（同じサーバーに置く、ブックマークレット化する、など）。

テスト用に DevTools のコンソールで次を実行すると、サンプルデータが入ります。

```javascript
localStorage.setItem("user", JSON.stringify({ name: "太郎", id: 1 }));
localStorage.setItem("theme", "dark");
localStorage.setItem("visitCount", "42");
```

ファイル構成:

- `localstorage-inspector/index.html` — UI
- `localstorage-inspector/styles.css` — スタイル
- `localstorage-inspector/app.js` — ロジック

編集機能やブックマークレット版が必要なら、その旨を伝えてください。
