import bollingerBandSeries from "./bollingerBandSeries.js";
import feed from "./feed.js";

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
  .chartCartesian(d3.scaleTime(), d3.scaleLinear())
  .chartLabel("Streaming Idempotent Chart");

// Create the gridlines and series
const gridlines = fc.annotationSvgGridline();
const candlestick = fc.seriesSvgCandlestick();
const bollingerBands = bollingerBandSeries();

const multi = fc
  .seriesSvgMulti()
  .series([gridlines, bollingerBands, candlestick]);

chart.svgPlotArea(multi);

const renderChart = () => {
  // Create and apply the bollinger algorithm
  const bollingerAlgorithm = fc.indicatorBollingerBands().value((d) => d.close);
  const bollingerData = bollingerAlgorithm(data);
  const mergedData = data.map((d, i) => ({
    ...d,
    bollinger: bollingerData[i],
  }));

  // update domain
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
  for await (const update of feed("ETH-USD")) {
    if (Array.isArray(update)) {
      data = update;
    } else {
      pushUpdate(update);
    }
    renderChart();
  }
};

start();
