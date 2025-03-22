import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://www.findrepo.work";

type TrendItem = {
  id: number;
  language: string;
  repo_url: string;
  repo_name: string;
  description: string;
  reviews: string;
  stargazers_count: number;
  created_at: string;
};

// Create server instance
const server = new McpServer({
  name: "findrepo",
  version: "1.0.0",
});

// Register tools
server.tool(
  "get-today-trends",
  "Get today's github trends",
  {
    language: z.string().optional().describe("Programming language"),
  },
  async ({ language }) => {
    let url = `${API_BASE}/api/get-today-trends`;
    if (language) {
      url += `?language=${language}`;
    }

    try {
      const response = await fetch(url);
      const body = await response.json();
      const list = body?.data || [];

      return {
        content: [
          {
            type: "text",
            text: list.map((item: TrendItem, index: number) => `${index + 1}. ${item.repo_name}: ${item.repo_url}`).join("\n"),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: "Failed to retrieve trends data" }],
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Findrepo MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
