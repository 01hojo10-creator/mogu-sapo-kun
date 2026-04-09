# もぐサポ君

高齢者施設向けの昼食献立アプリです。`index.html` を開くだけで動作し、GitHub Pages でもそのまま公開できます。

## GitHub Pages で公開する手順

1. このフォルダの中身を GitHub リポジトリのルートにアップロードします。
2. GitHub で対象リポジトリを開きます。
3. `Settings` を開きます。
4. 左メニューの `Pages` を開きます。
5. `Build and deployment` の `Source` で `Deploy from a branch` を選びます。
6. `Branch` で `main` を選び、フォルダは `/ (root)` を選びます。
7. `Save` を押します。
8. 数分待つと、GitHub Pages の公開 URL が表示されます。

公開 URL の例:

- `https://<GitHubユーザー名>.github.io/<リポジトリ名>/`

## アップロードするファイル

GitHub Pages 公開に最低限必要なファイル:

- `index.html`
- `enhancements.js`
- `.nojekyll`

同梱しておくとよいファイル:

- `README.md`

`AGENTS.md` はアプリ動作には不要です。

## 配置ルール

- `index.html` はリポジトリのルートに置きます
- `enhancements.js` も同じ階層に置きます
- `index.html` から `./enhancements.js` を相対参照しているため、別フォルダに分けないでください

## 公開後の確認方法

1. GitHub Pages の公開 URL を開きます。
2. トップ画面が表示されることを確認します。
3. `利用者向け献立表`、`調理室向け指示書`、`管理画面` の切り替えができることを確認します。
4. 利用者向け献立表に、その週の献立内容が表示されることを確認します。
5. 調理室向け指示書に、同じ週の内容が表示されることを確認します。

## localStorage について

このアプリは `localStorage` でブラウザごとに保存します。

- 見る人ごとに保存内容は別です
- 同じ URL でも、別の PC・別のブラウザでは保存内容は共有されません
- GitHub Pages 公開は「見られる状態」にするための段階です
- 複数人で同じデータを共有保存するには、将来的にサーバーやデータベース対応が必要です

## 補足

- ビルドは不要です
- `npm install` や `npm run dev` は不要です
- GitHub Pages では静的ファイルとしてそのまま動作します
