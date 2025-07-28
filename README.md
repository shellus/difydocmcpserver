# Dify Doc MCP Server

一个用于集成Dify知识库的MCP (Model Context Protocol) Server，允许AI助手直接访问和检索Dify知识库中的内容。

## 技术选型

- **语言**: TypeScript
- **运行环境**: Node.js v18+
- **MCP框架**: @modelcontextprotocol/sdk
- **HTTP客户端**: axios
- **数据验证**: zod
- **传输方式**: StdioServerTransport (标准输入输出)

## 主要架构

本项目实现了三个核心工具：
1. **dify_retrieve_knowledge** - 知识库检索
2. **dify_list_datasets** - 获取知识库列表
3. **dify_get_dataset_detail** - 获取知识库详情

通过MCP协议与Dify REST API集成，支持语义检索、关键字检索、全文检索和混合检索等多种检索方式。

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
# Dify API基础URL（默认: http://localhost:8031）
export DIFY_BASE_URL="http://localhost:8031"

# Dify API密钥（必需）
export DIFY_API_KEY="your-dify-api-key"
```

### 3. 构建和运行
```bash
# 构建项目
npm run build

# 开发模式
npm run dev

# 生产模式
npm start
```

## 可用工具

### dify_retrieve_knowledge
从Dify知识库中检索相关内容
- `dataset_id` (必需): 知识库ID
- `query` (必需): 检索查询内容
- `search_method` (可选): 检索方法 (semantic_search/keyword_search/full_text_search/hybrid_search)
- `top_k` (可选): 返回结果数量 (1-20，默认3)
- `score_threshold` (可选): 相似度阈值 (0-1，默认0.5)

### dify_list_datasets
获取Dify知识库列表
- `keyword` (可选): 搜索关键词
- `limit` (可选): 返回条数 (1-100，默认20)

### dify_get_dataset_detail
获取Dify知识库详细信息
- `dataset_id` (必需): 知识库ID

## MCP客户端配置

### Claude Desktop
在Claude Desktop配置文件中添加：
```json
{
  "mcpServers": {
    "dify-doc": {
      "command": "node",
      "args": ["/path/to/difydocmcpserver/dist/index.js"],
      "env": {
        "DIFY_BASE_URL": "http://localhost:8031",
        "DIFY_API_KEY": "your-dify-api-key"
      }
    }
  }
}
```

## API密钥获取
1. 登录Dify控制台
2. 进入"设置" → "API密钥"
3. 创建新的API密钥
4. 复制密钥并设置到环境变量中

## 项目结构
```
difydocmcpserver/
├── src/
│   └── index.ts          # MCP Server主文件
├── dist/                 # 编译输出目录
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
└── README.md            # 项目文档
```

## 相关链接
- [Dify官方文档](https://docs.dify.ai/)
- [MCP协议规范](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
