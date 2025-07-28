#!/usr/bin/env node

// 导入 McpServer 类，用于创建 MCP Server 的实例
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// 导入 StdioServerTransport 类，用于实现 Client 和 Server 的标准通信
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// 从 zod 模块导入 z 对象，用于数据验证
import { z } from "zod";
import axios from "axios";

// Dify API 配置接口
interface DifyConfig {
  baseUrl: string;
  apiKey: string;
}

// 知识库检索响应接口
interface DifyRetrievalResponse {
  query: {
    content: string;
  };
  records: Array<{
    segment: {
      id: string;
      content: string;
      document: {
        name: string;
      };
    };
    score: number;
  }>;
}

// 知识库列表响应接口
interface DifyDatasetListResponse {
  data: Array<{
    id: string;
    name: string;
    description: string;
    document_count: number;
    word_count: number;
  }>;
}

// 从环境变量获取配置
const getDifyConfig = (): DifyConfig => {
  const baseUrl = process.env.DIFY_BASE_URL || "http://localhost:8031";
  const apiKey = process.env.DIFY_API_KEY;
  
  if (!apiKey) {
    throw new Error("DIFY_API_KEY environment variable is required");
  }
  
  return { baseUrl, apiKey };
};

// 创建 MCP Server 实例
const server = new McpServer({
  name: "dify-doc-mcp-server",
  version: "1.0.0",
});

// 注册知识库检索工具
server.registerTool(
  "dify_retrieve_knowledge",
  {
    title: "Dify知识库检索",
    description: "从Dify知识库中检索相关内容",
    inputSchema: {
      dataset_id: z.string().describe("知识库ID"),
      query: z.string().describe("检索查询内容"),
      search_method: z.enum(["semantic_search", "keyword_search", "full_text_search", "hybrid_search"])
        .default("semantic_search")
        .describe("检索方法"),
      top_k: z.number().min(1).max(20).default(3).describe("返回结果数量"),
      score_threshold: z.number().min(0).max(1).default(0.5).describe("相似度阈值"),
    }
  },
  async ({ dataset_id, query, search_method = "semantic_search", top_k = 3, score_threshold = 0.5 }) => {
    try {
      const config = getDifyConfig();

      const response = await axios.post<DifyRetrievalResponse>(
        `${config.baseUrl}/v1/datasets/${dataset_id}/retrieve`,
        {
          query: query,
          retrieval_model: {
            search_method: search_method,
            reranking_enable: false,
            reranking_mode: null,
            reranking_model: {
              reranking_provider_name: "",
              reranking_model_name: ""
            },
            weights: null,
            top_k: top_k,
            score_threshold_enabled: score_threshold > 0,
            score_threshold: score_threshold > 0 ? score_threshold : null,
          },
        },
        {
          headers: {
            "Authorization": `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const results = response.data.records.map(record => ({
        content: record.segment.content,
        document_name: record.segment.document.name,
        score: record.score,
        segment_id: record.segment.id,
      }));

      return {
        content: [
          {
            type: "text",
            text: `检索到 ${results.length} 条相关内容：\n\n${results.map((result, index) =>
              `${index + 1}. 【${result.document_name}】(相似度: ${result.score.toFixed(4)})\n${result.content}\n`
            ).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        return {
          content: [
            {
              type: "text",
              text: `API调用失败: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `执行失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 注册知识库列表工具
server.registerTool(
  "dify_list_datasets",
  {
    title: "Dify知识库列表",
    description: "获取Dify知识库列表",
    inputSchema: {
      keyword: z.string().optional().describe("搜索关键词"),
      limit: z.number().min(1).max(100).default(20).describe("返回条数"),
    }
  },
  async ({ keyword, limit = 20 }) => {
    try {
      const config = getDifyConfig();

      const params = new URLSearchParams();
      if (keyword) {
        params.append('keyword', keyword);
      }
      params.append('limit', limit.toString());

      // 注意：此API需要管理员权限，暂时返回提示信息
      return {
        content: [
          {
            type: "text",
            text: `知识库列表功能需要管理员API密钥。当前使用的是数据集API密钥，只能访问特定知识库。\n\n如需获取知识库列表，请使用管理员权限的API密钥。`,
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        return {
          content: [
            {
              type: "text",
              text: `API调用失败: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `执行失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 注册知识库详情工具
server.registerTool(
  "dify_get_dataset_detail",
  {
    title: "Dify知识库详情",
    description: "获取Dify知识库详细信息",
    inputSchema: {
      dataset_id: z.string().describe("知识库ID"),
    }
  },
  async ({ dataset_id }) => {
    try {
      const config = getDifyConfig();

      const response = await axios.get(
        `${config.baseUrl}/console/api/datasets/${dataset_id}`,
        {
          headers: {
            "Authorization": `Bearer ${config.apiKey}`,
          },
        }
      );

      const dataset = response.data;

      return {
        content: [
          {
            type: "text",
            text: `知识库详情：\n\n名称: ${dataset.name}\nID: ${dataset.id}\n描述: ${dataset.description || "无描述"}\n文档数量: ${dataset.document_count}\n字数统计: ${dataset.word_count}\n创建时间: ${new Date(dataset.created_at * 1000).toLocaleString()}\n索引技术: ${dataset.indexing_technique || "未设置"}\n嵌入模型: ${dataset.embedding_model || "未设置"}\n检索方法: ${dataset.retrieval_model_dict?.search_method || "未设置"}`,
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        return {
          content: [
            {
              type: "text",
              text: `API调用失败: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `执行失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dify Doc MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
