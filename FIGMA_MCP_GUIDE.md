# Figma MCP連携ガイド

このドキュメントでは、ECサイトデモをFigma MCPサーバーと連携させる方法を説明します。

## 🎯 概要

このプロジェクトは、Figma MCPサーバーと統合されたECサイトのデモです。MCPサーバーを使用して、Figmaからデザイントークンやスタイルガイドをリアルタイムで取得・適用できます。

## 🔧 セットアップ

### 1. 基本インストール

```bash
# リポジトリをクローン
git clone https://github.com/ktroima/figma_mcp_test.git
cd figma_mcp_test

# 依存関係をインストール
npm install
```

### 2. 使用モード

#### Webサーバーモード（開発・デモ用）

```bash
npm start
```

ブラウザで `http://localhost:3000` にアクセスしてECサイトを確認できます。

#### MCPサーバーモード（AI統合用）

```bash
npm run mcp
```

このモードでは、Claude DesktopやCursor等のMCPクライアントから接続できます。

## 🤖 MCPクライアントとの統合

### Claude Desktopでの設定

Claude Desktopの設定ファイル（`claude_desktop_config.json`）に以下を追加：

```json
{
  "mcpServers": {
    "figma-ec-demo": {
      "command": "node",
      "args": [
        "/absolute/path/to/figma_mcp_test/src/server.js",
        "--mcp"
      ]
    }
  }
}
```

**注意:** `/absolute/path/to/figma_mcp_test` を実際のプロジェクトパスに置き換えてください。

### Cursorでの設定

Cursorの設定ファイルに同様の設定を追加します：

```json
{
  "mcpServers": {
    "figma-ec-demo": {
      "command": "node",
      "args": [
        "/absolute/path/to/figma_mcp_test/src/server.js",
        "--mcp"
      ]
    }
  }
}
```

## 🛠️ 利用可能なMCPツール

MCPサーバーは以下の4つのツールを提供します：

### 1. get_design_tokens

Figmaからデザイントークンを取得します。

**使用例（Claude）:**
```
get_design_tokensツールを使って、現在のデザイントークンを確認してください
```

**返り値:**
```json
{
  "colors": {
    "primary": "#667eea",
    "secondary": "#764ba2",
    "accent": "#f093fb"
  },
  "spacing": {
    "small": "0.5rem",
    "medium": "1rem",
    "large": "2rem"
  },
  "borderRadius": {
    "small": "5px",
    "medium": "8px",
    "large": "10px"
  }
}
```

### 2. update_design_tokens

デザイントークンを更新します。

**使用例（Claude）:**
```
update_design_tokensツールを使って、プライマリカラーを#FF5733に変更してください
```

### 3. get_cart_data

ECサイトの現在のカートデータを取得します。

**使用例（Claude）:**
```
get_cart_dataツールで、現在のショッピングカートの内容を確認してください
```

### 4. get_event_logs

ECサイトのイベントログを取得します。

**使用例（Claude）:**
```
get_event_logsツールで、最新の10件のイベントを表示してください
```

**パラメータ:**
- `limit` (オプション): 取得するログの数（デフォルト: 10）

## 🔌 REST API エンドポイント

Webサーバーモードで動作している場合、以下のAPIエンドポイントが利用可能です：

### GET /api/figma/status
Figma MCP接続状態を確認

```bash
curl http://localhost:3000/api/figma/status
```

### GET /api/figma/design-tokens
デザイントークンを取得

```bash
curl http://localhost:3000/api/figma/design-tokens
```

### POST /api/figma/design-tokens
デザイントークンを更新

```bash
curl -X POST http://localhost:3000/api/figma/design-tokens \
  -H "Content-Type: application/json" \
  -d '{"colors": {"primary": "#FF5733"}}'
```

### POST /api/figma/sync
カートデータを同期

```bash
curl -X POST http://localhost:3000/api/figma/sync \
  -H "Content-Type: application/json" \
  -d '{"cart": [...]}'
```

### POST /api/figma/log
イベントをログに記録

```bash
curl -X POST http://localhost:3000/api/figma/log \
  -H "Content-Type: application/json" \
  -d '{"event": "purchase", "data": {"amount": 29800}}'
```

### GET /api/figma/logs
イベントログを取得

```bash
curl http://localhost:3000/api/figma/logs
```

### GET /api/figma/cart
カートデータを取得

```bash
curl http://localhost:3000/api/figma/cart
```

## 💡 使用例

### Claude Desktopでの対話例

```
ユーザー: ECサイトのデザイントークンを確認して、現在のカラースキームを教えてください

Claude: get_design_tokensツールを使用して確認します...
現在のカラースキームは以下の通りです：
- プライマリカラー: #667eea（青紫）
- セカンダリカラー: #764ba2（濃い紫）
- アクセントカラー: #f093fb（ピンク）
```

### Figmaデザインとの同期

1. Figmaでデザインを更新
2. MCPツールを使用してデザイントークンを更新
3. ECサイトが自動的に新しいデザインを適用

## 📝 開発のヒント

### デザイントークンのカスタマイズ

`src/server.js`の`designTokens`オブジェクトを編集して、デフォルトのデザイントークンをカスタマイズできます：

```javascript
let designTokens = {
    colors: {
        primary: '#YOUR_COLOR',
        secondary: '#YOUR_COLOR',
        // ...
    },
    // ...
};
```

### 新しいAPIエンドポイントの追加

新しい機能を追加する場合は、`src/server.js`にExpressルートとMCPツールの両方を追加してください。

## 🔒 セキュリティ

- すべてのPOSTエンドポイントには入力検証が実装されています
- イベントログは最大1000件まで保存され、自動的にローテーションされます
- MCPサーバーモードでは、不要なHTTPサーバーは起動しません

## 🐛 トラブルシューティング

### MCPサーバーが起動しない

1. Node.jsのバージョンを確認（v14以上が必要）
2. 依存関係が正しくインストールされているか確認: `npm install`
3. ポート3000が使用可能か確認

### Claude Desktopで認識されない

1. 設定ファイルのパスが絶対パスになっているか確認
2. Claude Desktopを再起動
3. ログで接続エラーを確認

## 📚 参考資料

- [Model Context Protocol (MCP) Documentation](https://modelcontextprotocol.io/)
- [Express.js Documentation](https://expressjs.com/)
- [Figma API Documentation](https://www.figma.com/developers/api)

## 🤝 貢献

バグ報告や機能リクエストは、GitHubのIssuesでお願いします。
プルリクエストも歓迎します！
