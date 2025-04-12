import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { symbol, type } = req.query;
  if (!symbol || !type) {
    return res.status(400).json({ error: "symbol and type are required" });
  }

  const yahooSymbol = symbol
    .replace("US:", "")
    .replace("HK:", ".HK")
    .replace("SH:", ".SS")
    .replace("EU:", "");

  const typeMap = {
    income: "incomeStatementHistory",
    balance: "balanceSheetHistory",
    cashflow: "cashflowStatementHistory"
  };

  const module = typeMap[type];
  if (!module) {
    return res.status(400).json({ error: "type must be one of income, balance, cashflow" });
  }

  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=${module}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const report = data?.quoteSummary?.result?.[0]?.[module];
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
