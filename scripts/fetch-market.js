import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('src/data/market.json');

const symbols = [
  { secid: 'IMOEX', engine: 'stock', market: 'index', board: 'SNDX', label: 'Индекс Мосбиржи', decimals: 2 },
  { secid: 'USD000UTSTOM', engine: 'currency', market: 'selt', board: 'CETS', label: 'USD/RUB', decimals: 4 },
  { secid: 'EUR_RUB__TOM', engine: 'currency', market: 'selt', board: 'CETS', label: 'EUR/RUB', decimals: 4 },
  { secid: 'SBER', engine: 'stock', market: 'shares', board: 'TQBR', label: 'Сбербанк', decimals: 2 },
  { secid: 'YDEX', engine: 'stock', market: 'shares', board: 'TQBR', label: 'Яндекс', decimals: 2 },
  { secid: 'GLDRUB_TOM', engine: 'currency', market: 'selt', board: 'CNGD', label: 'Золото', decimals: 2 },
  { secid: 'PLDRUB_TOM', engine: 'currency', market: 'selt', board: 'CETS', label: 'Палладий', decimals: 2 },
];

function fmt(num, decimals) {
  if (num == null) return '—';
  return Number(num).toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function buildUrl(secid, engine, market) {
  return `https://iss.moex.com/iss/engines/${engine}/markets/${market}/securities/${secid}.json?iss.json=extended`;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function buildHistoryUrl(secid, engine, market, board) {
  const till = new Date();
  const from = new Date();
  from.setDate(till.getDate() - 45);
  return `https://iss.moex.com/iss/history/engines/${engine}/markets/${market}/securities/${secid}.json?iss.json=extended&from=${formatDate(from)}&till=${formatDate(till)}&board=${board}`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function getCurrentPrice(secBlock, mdBlock) {
  const sec = secBlock?.[1]?.[0];
  const mdRows = mdBlock?.[1];
  if (!sec || !Array.isArray(mdRows) || mdRows.length === 0) return null;

  const md = mdRows.find((row) => {
    const price = row.LAST ?? row.MARKETPRICE ?? row.LCURRENTPRICE ?? row.OPEN ?? row.CLOSEPRICE ?? row.CURRENTVALUE ?? null;
    return price != null;
  }) ?? mdRows[0];

  const prev = sec.PREVPRICE ?? sec.PREVWAPRICE ?? null;
  const last = md.LAST ?? md.MARKETPRICE ?? md.LCURRENTPRICE ?? md.OPEN ?? md.CLOSEPRICE ?? md.CURRENTVALUE ?? null;

  if (last == null) return null;

  if (md.LASTCHANGEPRC != null) {
    return { last: Number(last), prev: prev != null ? Number(prev) : null, changePrc: Number(md.LASTCHANGEPRC) };
  }
  return { last: Number(last), prev: prev != null ? Number(prev) : null, changePrc: null };
}

function getHistory(block) {
  const rows = block?.[1];
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row) => Number(row.NUMTRADES ?? 0) > 0 || Number(row.CLOSE ?? row.CLOSEPRICE ?? row.LAST ?? 0) > 0)
    .map((row) => Number(row.CLOSE ?? row.CLOSEPRICE ?? row.LAST))
    .filter((v) => !Number.isNaN(v) && v > 0);
}

function calcChange(last, prev) {
  if (last == null || prev == null || prev === 0) return null;
  return ((last - prev) / prev) * 100;
}

async function run() {
  const result = [];

  for (const s of symbols) {
    try {
      const currentJson = await fetchJson(buildUrl(s.secid, s.engine, s.market));
      const secBlock = currentJson.find((x) => x.securities)?.securities;
      const mdBlock = currentJson.find((x) => x.marketdata)?.marketdata;
      const current = getCurrentPrice(secBlock, mdBlock);

      const historyJson = await fetchJson(buildHistoryUrl(s.secid, s.engine, s.market, s.board));
      const historyBlock = historyJson.find((x) => x.history)?.history;
      const history = getHistory(historyBlock);

      let change = null;
      if (current) {
        change = current.changePrc ?? calcChange(current.last, current.prev);
      }

      result.push({
        secid: s.secid,
        label: s.label,
        price: fmt(current?.last, s.decimals),
        priceValue: current?.last ?? null,
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
        priceValue: null,
        change: '—',
        changeValue: 0,
        history: [],
      });
    }
  }

  const usdItem = result.find((i) => i.secid === 'USD000UTSTOM');
  const usdRate = parseFloat(String(usdItem?.priceValue ?? '').replace(/\s/g, '').replace(',', '.')) || null;
  if (usdRate) {
    for (const item of result) {
      if (['GLDRUB_TOM', 'PLDRUB_TOM'].includes(item.secid) && item.priceValue != null) {
        item.priceUsd = `$${fmt(item.priceValue / usdRate, 2)}`;
      }
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
