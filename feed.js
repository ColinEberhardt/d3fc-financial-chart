import {
  expose,
  transferHandlers,
} from "https://unpkg.com/comlink@4.2.0/dist/esm/comlink.mjs";
import { asyncIterableTransferHandler } from "./iterableTransferHandlers.js";

transferHandlers.set("asyncIterable", asyncIterableTransferHandler);

const SOCKET_URL = "wss://ws-feed.pro.coinbase.com";
const GDAX_URL = "https://api.pro.coinbase.com/";

const roundToMinute = (date) =>
  new Date(Math.round(date.getTime() / 60000) * 60000);

const addMinutes = (date, minutes) =>
  new Date(date.getTime() - 1000 * 60 * minutes);

// see: https://www.bignerdranch.com/blog/asyncing-feeling-about-javascript-generators/
const oncePromise = (emitter, event) =>
  new Promise((resolve) => {
    const handler = (...args) => {
      emitter.removeEventListener(event, handler);
      resolve(...args);
    };
    emitter.addEventListener(event, handler);
  });

async function* subscribe(symbol) {
  const now = new Date();
  const end = now.toISOString();
  const start = addMinutes(now, 120).toISOString();
  const res = await fetch(
    `${GDAX_URL}products/${symbol}/candles?granularity=60&start=${start}&end=${end}`
  );
  const candles = await res.json();
  yield candles
    .map((d) => ({
      date: roundToMinute(new Date(d[0] * 1000)),
      low: Number(d[1]),
      high: Number(d[2]),
      open: Number(d[3]),
      close: Number(d[4]),
    }))
    .reverse();

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

  while (ws.readyState !== 3) {
    const message = await oncePromise(ws, "message");
    const event = JSON.parse(message.data);
    if (event.type === "ticker") {
      yield {
        date: roundToMinute(new Date(event.time)),
        value: Number(event.price),
      };
    }
  }
}

expose({
  subscribe,
});
