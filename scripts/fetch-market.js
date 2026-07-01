import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('src/data/market.json');

const symbols = [
  { secid: 'IMOEX', engine: 'stock', market: 'index', board: 'RTSI', label: 'Индекс Мосбиржи', decimals: 1 },
  { secid: 'USD000UTSTOM', engine: 'currency', market: 'selt', board: 'CETS', label: 'USD/RUB', decimals: 4 },
  { secid: 'EUR_RUB__TOM', engine: 'currency', market: 'selt', board: 'CETS', label: 'EUR/RUB', decimals: 4 },
  { secid: 'SBER', engine: 'stock', market: 'shares', board: 'TQBR', label: 'Сбербанк', decimals: 2 },
  { secid: 'GAZP', engine: 'stock', market: 'shares', board: 'TQBR', label: 'Газпром', decimals: 3 },
  { secid: 'LKOH', engine: 'stock', market: 'shares', board: 'TQBR', label: 'Лукойл', decimals: 2 },
  { secid: 'YDEX', engine: 'stock', market: 'shares', board: 'TQBR', label: 'Яндекс', decimals: 2 },
  { secid: 'BRU5', engine: 'futures', market: 'forts', board: 'SPBFUT', label: 'Brent', decimals: 2 },
];

function fmt(num, decimals) {
  if (num == null) return '—';
  return Number(num).toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function buildUrl(secid, engine, market, board) {
  return `https://iss.moex.com/iss/engines/${engine}/markets/${market}/securities/${secid}.json?iss.json=extended&board=${board}`;
}

function buildHistoryUrl(secid, engine, market, board) {
  return `https://iss.moex.com/iss/history/engines/${engine}/markets/${market}/securities/${secid}.json?iss.json=extended&limit=30&board=${board}`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function getCurrentPrice(secBlock, mdBlock) {
  const sec = secBlock?.[1]?.[0];
  const md = mdBlock?.[1]?.[0];
  if (!sec || !md) return null;

  const prev = sec.PREVPRICE ?? sec.PREVWAPRICE ?? null;
  const last = md.LAST ?? md.MARKETPRICE ?? md.LCURRENTPRICE ?? md.OPEN ?? md.CLOSEPRICE ?? null;

  if (last == null) return null;
  return { last: Number(last), prev: prev != null ? Number(prev) : null };
}

function getHistory(block) {
  const rows = block?.[1];
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => Number(row.CLOSE ?? row.CLOSEPRICE ?? row.LAST))
    .filter((v) => !Number.isNaN(v));
}

function calcChange(last, prev) {
  if (!last || !prev) return null;
  return ((last - prev) / prev) * 100;
}

async function run() {
  const result = [];

  for (const s of symbols) {
    try {
      const currentJson = await fetchJson(buildUrl(s.secid, s.engine, s.market, s.board));
      const secBlock = currentJson.find((x) => x.securities)?.securities;
      const mdBlock = currentJson.find((x) => x.marketdata)?.marketdata;
      const current = getCurrentPrice(secBlock, mdBlock);

      const historyJson = await fetchJson(buildHistoryUrl(s.secid, s.engine, s.market, s.board));
      const historyBlock = historyJson.find((x) => x.history)?.history;
      const history = getHistory(historyBlock);

      const change = current ? calcChange(current.last, current.prev) : null;

      result.push({
        secid: s.secid,
        label: s.label,
        price: fmt(current?.last, s.decimals),
        change: change != null ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—',
        changeValue: change ?? 0,
        history,
      });
    } catch (err) {
      console.error(`Failed ${s.secid}:`, err.message);
      result.push({
        secid: s.secid,
        label: s.label,
        price: '—',
        change: '—',
        changeValue: 0,
        history: [],
      });
    }
  }

  const output = {
    updatedAt: new Date().toISOString(),
    items: result,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
  console.log(`Wrote ${OUT} with ${result.length} instruments`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
