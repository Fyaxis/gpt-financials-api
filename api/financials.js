import yahooFinance from "yahoo-finance2";

// 处理股票代码前缀，转换为 Yahoo Finance 需要的格式
function convertSymbol(symbol) {
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
  return yahooSymbol;
}

export default async function handler(req, res) {
  const { symbol, type } = req.query;
  if (!symbol || !type) {
    return res.status(400).json({ error: "symbol and type are required" });
  }

  const yahooSymbol = convertSymbol(symbol);

  // 使用年度数据对应的模块名称
  const typeMap = {
    income: "incomeStatementHistory",
    balance: "balanceSheetHistory",
    cashflow: "cashflowStatementHistory"
  };
  const moduleName = typeMap[type];
  if (!moduleName) {
    return res.status(400).json({ error: "type must be one of income, balance, cashflow" });
  }

  try {
    // 调用 yahoo-finance2 库的 quoteSummary 方法，传入模块数组（只取一个模块）
    const result = await yahooFinance.quoteSummary(yahooSymbol, { modules: [moduleName] });
    const report = result?.[moduleName];
    if (!report) {
      return res.status(404).json({ error: "no report found", rawData: result });
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
