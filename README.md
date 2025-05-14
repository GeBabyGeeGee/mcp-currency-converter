# MCP Currency Converter Tool

这是一个用于 MCP (Model Context Protocol) 的汇率转换工具，它使用 [exchangerate-api.com](https://www.exchangerate-api.com/) 提供的汇率数据。

## 安装

如果你想在你的 MCP 服务器项目中使用这个工具，可以通过 npm 安装：

```bash
npm install GeBabyGeeGee/mcp-currency-converter
```

或者，如果你已经将仓库克隆到本地，可以在你的 MCP 服务器项目的 `package.json` 中添加本地依赖：

```json
"dependencies": {
  "mcp-currency-converter": "file:../path/to/currency-converter-npm"
}
```

然后运行 `npm install`。

## 使用

这个 npm 包提供了一个名为 `ConvertCurrencyTool` 的类。你需要在一个 MCP 服务器环境中实例化并注册这个工具。

### API Key 配置

这个工具需要一个来自 [exchangerate-api.com](https://www.exchangerate-api.com/) 的 API Key。请通过设置 `EXCHANGERATE_API_KEY` 环境变量来提供你的 API Key。

### 在 MCP 服务器中集成

具体的集成方式取决于你使用的 MCP 服务器框架或实现。以下是一个概念性的示例：

```javascript
// 假设你的 MCP 服务器入口文件
const ConvertCurrencyTool = require('mcp-currency-converter');
const mcpServer = require('your-mcp-server-framework'); // 替换为你的 MCP 服务器框架

// 确保 EXCHANGERATE_API_KEY 环境变量已设置
if (!process.env.EXCHANGERATE_API_KEY) {
    console.warn("WARNING: EXCHANGERATE_API_KEY environment variable is not set. The currency converter tool will not work.");
}

const currencyConverter = new ConvertCurrencyTool();

// 注册工具到 MCP 服务器
mcpServer.registerTool(currencyConverter);

console.log("Currency Converter Tool registered with MCP server.");

// 启动你的 MCP 服务器
mcpServer.start();
```

### 通过 MCP 调用工具

一旦工具在 MCP 服务器中注册并运行，你就可以通过 MCP 客户端（如 Roo）调用它。使用 `use_mcp_tool` 工具，指定你的 MCP 服务器名称、工具名称 (`convert_currency`) 和参数：

```xml
<use_mcp_tool>
<server_name>你的MCP服务器名称</server_name>
<tool_name>convert_currency</tool_name>
<arguments>
  {
    "amount": 100,
    "from_currency": "USD",
    "to_currency": "EUR"
  }
</arguments>
</use_mcp_tool>
```

替换 `你的MCP服务器名称` 为你在 MCP 客户端中配置的实际服务器名称。

### `execute` 方法参数

`ConvertCurrencyTool` 类的 `execute` 方法接受以下参数：

-   `amount` (number): 要转换的金额。
-   `from_currency` (string): 原始金额的货币代码 (例如, 'USD')。
-   `to_currency` (string): 要转换成的货币代码 (例如, 'EUR')。

### `execute` 方法返回值

`execute` 方法返回一个 Promise，解析为一个包含转换结果或错误信息的对象。

成功示例：

```json
{
  "original_amount": 100,
  "from_currency": "USD",
  "to_currency": "EUR",
  "converted_amount": 92.00,
  "exchange_rate": 0.92,
  "last_updated_utc": "YYYY-MM-DDTHH:MM:SSZ"
}
```

错误示例：

```json
{
  "error": "Error message description"
}
```

## 开发

如果你想对工具进行修改或贡献，可以克隆仓库并在本地进行开发。

1.  克隆仓库：
    ```bash
    git clone https://github.com/GeBabyGeeGee/mcp-currency-converter.git
    cd mcp-currency-converter
    ```
2.  安装依赖：
    ```bash
    npm install
    ```
3.  运行测试（如果包含）：
    ```bash
    npm test
    ```

## 许可证

本项目采用 ISC 许可证。