# ECサイトデモ - Figma MCP連携

Figma MCPサーバーと連携したECサイト（電子商取引サイト）のデモアプリケーションです。

## 🎨 特徴

- **ECサイト機能**
  - 商品一覧表示
  - ショッピングカート
  - 商品の追加・削除
  - 購入機能
  
- **Figma MCP連携**
  - デザイントークンの取得と適用
  - カートデータの同期
  - イベントログの記録
  - MCPサーバーとの双方向通信

## 📦 必要な環境

- Node.js (v14以上)
- npm または yarn

## 🚀 インストール

```bash
# リポジトリをクローン
git clone https://github.com/ktroima/figma_mcp_test.git
cd figma_mcp_test

# 依存関係をインストール
npm install
```

## 💻 使い方

### Webサーバーモードで起動

```bash
npm start
```

ブラウザで `http://localhost:3000` にアクセスしてください。

### MCPサーバーモードで起動

```bash
npm run mcp
```

このモードでは、MCPクライアント（Claude DesktopやCursor等）から接続できます。

## 🔧 MCP設定

Claude DesktopやCursorなどのMCPクライアントで使用する場合は、設定ファイルに以下を追加してください：

```json
{
  "mcpServers": {
    "figma-ec-demo": {
      "command": "node",
      "args": [
        "/path/to/figma_mcp_test/src/server.js",
        "--mcp"
      ]
    }
  }
}
```

## 🛠️ 利用可能なMCPツール

1. **get_design_tokens** - Figmaからデザイントークンを取得
2. **update_design_tokens** - デザイントークンを更新
3. **get_cart_data** - 現在のカートデータを取得
4. **get_event_logs** - イベントログを取得

## 📁 プロジェクト構造

```
figma_mcp_test/
├── public/              # フロントエンドファイル
│   ├── index.html      # メインHTML
│   ├── styles.css      # スタイルシート
│   └── app.js          # フロントエンドJavaScript
├── src/
│   └── server.js       # ExpressサーバーとMCPサーバー
├── mcp-config.json     # MCP設定ファイル
├── package.json        # プロジェクト設定
└── README.md           # このファイル
```

## 🎯 API エンドポイント

- `GET /api/figma/status` - Figma MCP接続状態を取得
- `GET /api/figma/design-tokens` - デザイントークンを取得
- `POST /api/figma/design-tokens` - デザイントークンを更新
- `POST /api/figma/sync` - カートデータを同期
- `POST /api/figma/log` - イベントログを記録
- `GET /api/figma/logs` - イベントログを取得
- `GET /api/figma/cart` - カートデータを取得

## 🧪 開発

```bash
# 開発サーバーを起動
npm run dev
```

## 📝 ライセンス

ISC

## 🤝 貢献

プルリクエストを歓迎します！
