# Maison Cadran — 操作マニュアル / Operation Manual

架空のアンティーク時計店「Maison Cadran」のショーウィンドウを再現した、3Dプロダクトショーケースです。Three.jsで作られており、ブラウザ上でそのまま動作します。

*A 3D product showcase recreating the shop window of a fictional antique watchmaker, "Maison Cadran." Built with Three.js — it runs directly in the browser, no installation required.*

---

## 日本語

### 開くには

`maison-cadran.html` を、パソコン・スマホどちらの最新ブラウザ(Chrome、Safari、Edge、Firefoxなど)でも開けます。初回読み込み時のみ、Three.jsライブラリとGoogleフォントを取得するためにインターネット接続が必要です。それ以降のシーンの生成(テクスチャや照明など)はすべてローカルで行われます。

「Winding the display…(展示を巻き上げています)」という短いローディング画面のあと、ショーウィンドウが表示されます。

### 操作方法

| 操作 | 入力方法 |
|---|---|
| 視点を少し寄せる | ドラッグ(マウス)またはスワイプ(タッチ) |
| ズームイン・アウト | マウスホイール、またはピンチ操作(タッチ) |

このシーンは「街から店のショーウィンドウを覗き込む」という設定のため、視点の可動域はあえて制限されています。左右・上下に少し首を傾けたり、ガラスに顔を近づけたりするような感覚で操作できますが、ウィンドウの裏側に回り込むことはできません。触れずにいると、展示台がゆっくり自動で首を振るような演出が入ります(ドラッグすると解除されます)。

### シーンの内容

- 中央のターンテーブル上で、金無垢の腕時計と懐中時計がゆっくり回転
- 腕時計は「10時10分」のクラシックな広告用の針の配置で、秒針だけがなめらかに動き続ける
- ビロード張りのクッション、革ストラップ、サブダイヤルなどのディテール
- ガラス面に金箔風で描かれた店名「Maison Cadran」のロゴと、街灯の反射のような演出
- 木枠のウィンドウフレーム、値札プレート、ルーペなどの小道具

### ファイルの共有・再利用について

`maison-cadran.html` は単体で完結したファイルです。名前を変えたり、メールに添付したり、静的なWebホスティングに置いたりして問題ありません。読み込み時に外部から取得するのはThree.jsとGoogleフォントの2点のみで、それらのホストにアクセスできる環境であれば、どこに置いても動作します。

### うまく表示されないとき

- **暗い画面のまま何も表示されない**: インターネット接続を確認してください。Three.jsの取得に失敗している可能性があります。
- **視点の動きが不自然に感じる**: これは仕様です。あくまで「窓の外から覗き込む」視点に固定されるよう、意図的に可動域を制限しています。

---

## English

### Opening the file

Open `maison-cadran.html` in any modern desktop or mobile browser (Chrome, Safari, Edge, or Firefox). An internet connection is needed on first load only, to fetch the Three.js library and the Google Fonts used for the signage lettering. Everything else — textures, lighting, geometry — is generated locally afterward.

A short "Winding the display…" loading screen appears before the window comes into view.

### Controls

| Action | Input |
|---|---|
| Lean in / look around slightly | Drag with the mouse, or swipe with a finger |
| Zoom in / out | Mouse wheel, or pinch on a touchscreen |

The viewing angle is deliberately limited, since the premise is that you're looking in from the street through a shop window — you can shift your view side to side or lean closer, but you can never swing around to the back of the display. A gentle idle sway plays automatically until you first interact, after which it stops.

### What's in the scene

- A gold wristwatch and a pocket watch, turning slowly together on a central velvet turntable
- The wristwatch is set to the classic "ten past ten" advertising pose, with only the seconds hand sweeping continuously
- Detail work: a velvet cushion, a leather strap, and a sub-dial
- Gold-leaf "Maison Cadran" signage painted on the glass, along with a faint reflection of streetlights
- A wood-framed window, a gilded price plaque, and a jeweler's loupe as supporting props

### Sharing or reusing the file

`maison-cadran.html` is a single, self-contained file — rename it, attach it to an email, or drop it into any static web host. It only depends on two things fetched over the network (Three.js and the Google Fonts stylesheet), so it will keep working anywhere those two hosts are reachable.

### Troubleshooting

- **Blank dark screen with nothing appearing:** check your internet connection — the page likely couldn't download Three.js.
- **The view feels restricted:** this is intentional. The camera is deliberately held to a narrow arc, as though you're standing in front of a real shop window rather than walking around the display.
