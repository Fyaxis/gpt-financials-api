// api/financials.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { symbol, type } = req.query;
  if (!symbol || !type) {
    return res.status(400).json({ error: "symbol and type are required" });
  }

  // 根据输入市场前缀调整股票代码格式
  let yahooSymbol;
  if (symbol.startsWith("US:")) {
    yahooSymbol = symbol.replace("US:", "");
  } else if (symbol.startsWith("HK:")) {
    yahooSymbol = symbol.replace("HK:", "") + ".HK";
  } else if (symbol.startsWith("SH:")) {
    yahooSymbol = symbol.replace("SH:", "") + ".SS";
  } else if (symbol.startsWith("SZ:")) {
    yahooSymbol = symbol.replace("SZ:", "") + ".SZ";
  } else if (symbol.startsWith("TW:")) {
    yahooSymbol = symbol.replace("TW:", "") + ".TW";
  } else if (symbol.startsWith("EU:")) {
    yahooSymbol = symbol.replace("EU:", "");
  } else {
    yahooSymbol = symbol;
  }

  // 使用年度数据的模块映射（Yahoo Finance 年度报表数据）
  const typeMap = {
    income: "incomeStatementHistory",
    balance: "balanceSheetHistory",
    cashflow: "cashflowStatementHistory"
  };

  const moduleName = typeMap[type];
  if (!moduleName) {
    return res.status(400).json({ error: "type must be one of income, balance, cashflow" });
  }

  // 构造 Yahoo Finance 查询 URL
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=${moduleName}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // 提取财报数据
    const report = data?.quoteSummary?.result?.[0]?.[moduleName];
    if (!report) {
      return res.status(404).json({ error: "no report found", rawData: data });
    }

    return res.status(200).json({
      symbol,
      type,
      report
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
