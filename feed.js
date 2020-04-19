const SOCKET_URL = "wss://ws-feed.pro.coinbase.com";
const GDAX_URL = "https://api.pro.coinbase.com/";

const roundToMinute = (date) =>
  new Date(Math.round(date.getTime() / 60000) * 60000);

const addMinutes = (date, minutes) =>
  new Date(date.getTime() - 1000 * 60 * minutes);

const subscribe = async (symbol, callback) => {
  const now = new Date();
  const end = now.toISOString();
  const start = addMinutes(now, 120).toISOString();
  const res = await fetch(
    `${GDAX_URL}products/${symbol}/candles?granularity=60&start=${start}&end=${end}`
  );
  let candles = await res.json();
  candles = candles
    .map((d) => ({
      date: roundToMinute(new Date(d[0] * 1000)),
      low: Number(d[1]),
      high: Number(d[2]),
      open: Number(d[3]),
      close: Number(d[4]),
    }))
    .reverse();
  callback(candles);

  const ws = new WebSocket(SOCKET_URL);
  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        type: "subscribe",
        product_ids: [symbol],
        channels: [
          {
            name: "ticker",
            product_ids: [symbol],
          },
        ],
      })
    );
  };

  ws.onmessage = (msg) => {
    const event = JSON.parse(msg.data);
    if (event.type === "ticker") {
      console.log(new Date(), Number(event.price));
      callback({
        date: roundToMinute(new Date(event.time)),
        value: Number(event.price),
      });
    }
  };
};

export default subscribe;
