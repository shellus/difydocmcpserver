#!/usr/bin/env node

// MCP客户端测试脚本
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 开始测试Dify MCP Server...');

async function testMCPServer() {
  let client;
  let transport;
  
  try {
    // 创建传输层，启动我们的MCP服务器
    transport = new StdioClientTransport({
      command: "npx",
      args: ["dify-doc-mcp-server"],
      env: {
        ...process.env,
        DIFY_BASE_URL: process.env.DIFY_BASE_URL,
        DIFY_API_KEY: process.env.DIFY_API_KEY
      }
    });

    // 创建客户端
    client = new Client({
      name: "test-client",
      version: "1.0.0"
    });

    console.log('🔌 连接到MCP服务器...');
    await client.connect(transport);
    console.log('✅ 连接成功！');

    // 测试1: 列出可用工具
    console.log('\n1️⃣ 测试工具列表...');
    const tools = await client.listTools();
    console.log('✅ 可用工具:', tools.tools.map(t => t.name));

    // 测试2: 获取知识库列表
    console.log('\n2️⃣ 测试知识库列表...');
    const listResult = await client.callTool({
      name: "dify_list_datasets",
      arguments: {
        keyword: process.env.DATASET || "",
        limit: 10
      }
    });
    console.log('✅ 知识库列表结果:', listResult.content[0].text);

    // 从列表结果中提取dataset_id（如果指定了DATASET名称）
    let targetDatasetId = process.env.DATASET_ID;
    if (!targetDatasetId && process.env.DATASET) {
      const listText = listResult.content[0].text;
      const match = listText.match(new RegExp(`\\d+\\. ${process.env.DATASET}.*?\\(ID: ([^)]+)\\)`));
      if (match) {
        targetDatasetId = match[1];
        console.log(`📍 找到知识库"${process.env.DATASET}"的ID: ${targetDatasetId}`);
      }
    }
    if (!targetDatasetId) {
      targetDatasetId = "your-dataset-id";
    }

    // 测试3: 获取知识库详情
    console.log('\n3️⃣ 测试知识库详情...');
    const detailResult = await client.callTool({
      name: "dify_get_dataset_detail",
      arguments: {
        dataset_id: targetDatasetId
      }
    });
    console.log('✅ 知识库详情结果:', detailResult.content[0].text);

    // 测试4: 知识库检索
    console.log('\n4️⃣ 测试知识库检索...');
    const retrieveResult = await client.callTool({
      name: "dify_retrieve_knowledge",
      arguments: {
        dataset_id: targetDatasetId,
        query: process.env.QUERY,
        search_method: "semantic_search",
        top_k: 3
      }
    });
    console.log('✅ 知识库检索结果:', retrieveResult.content[0].text);

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('📊 响应状态:', error.response.status);
      console.error('📋 响应数据:', error.response.data);
    }
  } finally {
    // 清理资源
    if (client) {
      try {
        await client.close();
      } catch (e) {
        console.error('关闭客户端时出错:', e.message);
      }
    }
    if (transport) {
      try {
        await transport.close();
      } catch (e) {
        console.error('关闭传输层时出错:', e.message);
      }
    }
  }
}

testMCPServer();
