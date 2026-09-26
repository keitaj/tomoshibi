# ともしび洞くつ

ブラウザで遊べるローグライクのプロトタイプ。地下10階の出口をめざす。

## 遊び方

`index.html` をブラウザで開くだけで動く（ビルド不要・依存ライブラリなし）。
ローカルサーバーで開く場合は、たとえば:

```sh
python3 -m http.server 8000
# http://localhost:8000 を開く
```

## 操作

| 操作 | キー |
|---|---|
| 移動 | 矢印キー / WASD / テンキー |
| 斜め移動 | Q E Z C |
| 向きだけ変える | Shift + 方向 |
| 攻撃 | Space / Enter / F |
| 足踏み | R / . |
| 道具 | I |
| 地図 | M |
| 最高記録 | V |
| 階段を降りる | G |

スマホでは画面下の十字パッドとボタンで操作する。

## ファイル構成

- `index.html` — 画面の骨組み（HUD、キャンバス、ボタン、モーダル）
- `style.css` — 見た目（ライト／ダークテーマ対応）
- `game.js` — ゲーム本体

## game.js の主な場所

- データ定義: `GRASS` `SCROLL` `WEAPONS` `SHIELDS` `STAFFS` `FOODS`（アイテム）、`MON`（敵）、`SPAWN`（階ごとの出現表）、`NEXT`（経験値テーブル）
- マップ生成: `genMap()`（3×3区画に部屋を置いて通路でつなぐ）
- ターン処理: `act()` → `endTurn()` → `worldTurn()` → `monstersAct()`
- 敵AI: `monsterStep()`（BFSで追跡・徘徊）
- 描画: `draw()`（毎フレーム、requestAnimationFrame）

## メモ

- 最高記録は localStorage（キー: `tomoshibi.best`）に保存。`V` キーか「記録」ボタンで参照でき、同じ画面の「記録を消す」から消去もできる（確認あり）。

## ライセンス

[MIT License](LICENSE)
