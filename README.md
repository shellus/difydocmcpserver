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

## 安装

### 全局安装
```bash
npm install -g dify-doc-mcp-server
```

### 或使用npx（无需安装）
```bash
npx dify-doc-mcp-server
```

## 快速开始

### 方式一：使用npx（推荐）
```bash
# 直接运行，无需安装
DIFY_BASE_URL="http://your-dify-host:8031" DIFY_API_KEY="your-api-key" npx dify-doc-mcp-server
```

### 方式二：本地开发
```bash
# 1. 克隆项目
git clone <repository-url>
cd difydocmcpserver

# 2. 安装依赖
npm install

# 3. 配置环境变量
export DIFY_BASE_URL="http://localhost:8031"
export DIFY_API_KEY="your-dify-api-key"

# 4. 构建和运行
npm run build
npm start
```

## 可用工具

### dify_list_datasets
获取Dify知识库列表
- `keyword` (可选): 搜索关键词
- `limit` (可选): 返回条数 (1-100，默认20)

### dify_get_dataset_detail
获取Dify知识库详细信息
- `dataset_id` (必需): 知识库ID

### dify_retrieve_knowledge
从Dify知识库中检索相关内容
- `dataset_id` (必需): 知识库ID
- `query` (必需): 检索查询内容
- `search_method` (可选): 检索方法 (semantic_search/keyword_search/full_text_search/hybrid_search)
- `top_k` (可选): 返回结果数量 (1-20，默认3)
- `score_threshold` (可选): 相似度阈值 (0-1，默认0)

## MCP客户端配置

```json
{
  "mcpServers": {
    "dify-doc": {
      "command": "npx",
      "args": ["dify-doc-mcp-server"],
      "env": {
        "DIFY_BASE_URL": "http://your-dify-host:8031",
        "DIFY_API_KEY": "your-dify-api-key"
      }
    }
  }
}
```


## API密钥获取
1. 登录Dify控制台
2. 进入"设置" → "知识库" → "API" → "API密钥"
3. 创建新的API密钥
4. 复制密钥并设置到环境变量中

## 测试

```bash
# 设置环境变量并运行测试
DIFY_BASE_URL="http://your-dify-host:8031" DIFY_API_KEY="your-api-key" DATASET="your-dataset-name" QUERY="引导" node test-mcp.js
```

测试脚本会验证：
- MCP Server连接
- 工具列表获取
- 知识库列表、详情和检索功能

## 相关链接
- [Dify官方文档](https://docs.dify.ai/)
- [MCP协议规范](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
