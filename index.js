import bollingerBandSeries from "./bollingerBandSeries.js";

const stream = fc.randomFinancial().stream();
const data = stream.take(110);

const xExtent = fc.extentDate().accessors([(d) => d.date]);

const yExtent = fc
  .extentLinear()
  .accessors([
    (d) => d.bollinger.upper,
    (d) => d.high,
    (d) => d.bollinger.lower,
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

function renderChart() {
  // add a new datapoint and remove an old one
  data.push(stream.next());
  data.shift();

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
}

// re-render the chart every 200ms
setInterval(renderChart, 200);
