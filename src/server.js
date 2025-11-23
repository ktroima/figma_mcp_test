const express = require('express');
const path = require('path');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Store for demo data
let cartData = [];
let eventLogs = [];
let designTokens = {
    colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: '#f5f5f5',
        text: '#333333'
    },
    spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '2rem'
    },
    borderRadius: {
        small: '5px',
        medium: '8px',
        large: '10px'
    }
};

// API Routes for Figma MCP Integration
app.get('/api/figma/status', (req, res) => {
    res.json({
        connected: true,
        mcpVersion: '1.0.0',
        figmaIntegration: 'active',
        timestamp: Date.now()
    });
});

app.get('/api/figma/design-tokens', (req, res) => {
    res.json(designTokens);
});

app.post('/api/figma/design-tokens', (req, res) => {
    designTokens = { ...designTokens, ...req.body };
    res.json({ success: true, tokens: designTokens });
});

app.post('/api/figma/sync', (req, res) => {
    cartData = req.body.cart || [];
    console.log('Cart synced with Figma MCP:', cartData);
    res.json({ success: true, synced: true });
});

app.post('/api/figma/log', (req, res) => {
    const log = {
        ...req.body,
        id: eventLogs.length + 1,
        timestamp: Date.now()
    };
    eventLogs.push(log);
    console.log('Event logged to Figma MCP:', log);
    res.json({ success: true });
});

app.get('/api/figma/logs', (req, res) => {
    res.json(eventLogs);
});

app.get('/api/figma/cart', (req, res) => {
    res.json(cartData);
});

// MCP Server Setup
class FigmaMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'figma-ec-demo-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
        
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'get_design_tokens',
                    description: 'Figmaからデザイントークン（色、スペーシング、ボーダー半径など）を取得します',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'update_design_tokens',
                    description: 'デザイントークンを更新します',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tokens: {
                                type: 'object',
                                description: 'Design tokens to update',
                            },
                        },
                        required: ['tokens'],
                    },
                },
                {
                    name: 'get_cart_data',
                    description: 'ECサイトの現在のカートデータを取得します',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_event_logs',
                    description: 'ECサイトのイベントログを取得します',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            limit: {
                                type: 'number',
                                description: 'Number of logs to return',
                                default: 10,
                            },
                        },
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case 'get_design_tokens':
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(designTokens, null, 2),
                            },
                        ],
                    };

                case 'update_design_tokens':
                    designTokens = { ...designTokens, ...args.tokens };
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `デザイントークンが更新されました: ${JSON.stringify(designTokens, null, 2)}`,
                            },
                        ],
                    };

                case 'get_cart_data':
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(cartData, null, 2),
                            },
                        ],
                    };

                case 'get_event_logs':
                    const limit = args?.limit || 10;
                    const logs = eventLogs.slice(-limit);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(logs, null, 2),
                            },
                        ],
                    };

                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Figma EC Demo MCP server running on stdio');
    }
}

// Start Express server
app.listen(PORT, () => {
    console.log(`EC Demo Server running at http://localhost:${PORT}`);
    console.log(`Figma MCP integration enabled`);
    console.log('\n📦 ECサイトデモが起動しました！');
    console.log(`🌐 ブラウザで http://localhost:${PORT} にアクセスしてください`);
    console.log('🎨 Figma MCPサーバーと連携しています\n');
});

// Export for MCP server mode
if (require.main === module && process.argv.includes('--mcp')) {
    const mcpServer = new FigmaMCPServer();
    mcpServer.run().catch(console.error);
} else if (require.main === module) {
    // Just run the Express server
    console.log('Running in web server mode');
}

module.exports = { app, FigmaMCPServer };
