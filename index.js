import {
  wrap,
  transferHandlers,
} from "https://unpkg.com/comlink@4.2.0/dist/esm/comlink.mjs";
import { asyncIterableTransferHandler } from "./iterableTransferHandlers.js";
import bollingerBandSeries from "./bollingerBandSeries.js";
// import { init, calculate } from "./bollingerCalculator.js";

transferHandlers.set("asyncIterable", asyncIterableTransferHandler);
const subscriptionService = wrap(new Worker("./feed.js", { type: "module" }));

const bollingerCalc = wrap(new Worker("./bollingerCalculator.js", { type: "module" }));

let data = [];

const xExtent = fc.extentDate().accessors([(d) => d.date]);

const yExtent = fc
  .extentLinear()
  .accessors([
    (d) => d.bollinger.upper,
    (d) => d.bollinger.lower,
    (d) => d.high,
    (d) => d.low,
  ]);

// create a chart
const chart = fc
  .chartCartesian(d3.scaleTime(), d3.scaleLinear());

// Create the gridlines and series
const multi = fc
  .seriesSvgMulti()
  .series([
    fc.annotationSvgGridline(),
    bollingerBandSeries(),
    fc.seriesSvgCandlestick(),
  ]);

chart.svgPlotArea(multi);

const renderChart = async () => {
  const bollingerData = await bollingerCalc.calculate(data, 10);
  const mergedData = data.map((d, i) => ({
    ...d,
    bollinger: bollingerData[i],
  }));
  chart.xDomain(xExtent(mergedData)).yDomain(yExtent(mergedData));

  d3.select("#chart").datum(mergedData).call(chart);
};

const pushUpdate = ({ date, value }) => {
  const latest = data.length > 0 ? data[data.length - 1] : null;
  if (latest && latest.date.getTime() === date.getTime()) {
    latest.close = value;
    latest.high = Math.max(value, latest.high);
    latest.low = Math.min(value, latest.low);
  } else {
    data.push({
      date: date,
      high: value,
      low: value,
      open: value,
      close: value,
    });
  }
};

const start = async () => {
  await bollingerCalc.init();
  const iterator = await subscriptionService.subscribe("ETH-USD");
  for await (const update of iterator) {
    if (Array.isArray(update)) {
      data = update;
    } else {
      pushUpdate(update);
    }
    renderChart();
  }
};

start();
