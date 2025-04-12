import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { symbol, type } = req.query;
  if (!symbol || !type) {
    return res.status(400).json({ error: "symbol and type are required" });
  }

  let yahooSymbol;
  if (symbol.startsWith("US:")) {
    yahooSymbol = symbol.replace("US:", "");
  } else if (symbol.startsWith("HK:")) {
    yahooSymbol = symbol.replace("HK:", "") + ".HK";
  } else if (symbol.startsWith("SH:")) {
    yahooSymbol = symbol.replace("SH:", "") + ".SS";
  } else if (symbol.startsWith("TW:")) {  // 支持台湾股票
    yahooSymbol = symbol.replace("TW:", "") + ".TW";
  } else if (symbol.startsWith("EU:")) {
    yahooSymbol = symbol.replace("EU:", "");
  } else {
    yahooSymbol = symbol;
  }

  const typeMap = {
    income: "incomeStatementHistory",
    balance: "balanceSheetHistory",
    cashflow: "cashflowStatementHistory"
  };

  const mod = typeMap[type];
  if (!mod) {
    return res.status(400).json({ error: "type must be one of income, balance, cashflow" });
  }

  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=${mod}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const report = data?.quoteSummary?.result?.[0]?.[mod];
    if (!report) {
      return res.status(404).json({ error: "no report found" });
    }

    return res.status(200).json({
      symbol,
      type,
      report
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
