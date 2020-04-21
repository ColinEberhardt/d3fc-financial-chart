import {
  buildBuffer,
  DateFieldConverter,
  FloatFieldConverter,
} from "./buffer.js";

const stream = fc.randomFinancial().stream();
const data = stream.take(100);

const buffer = buildBuffer(
  100,
  {
    name: "date",
    converter: DateFieldConverter,
  },
  {
    name: "close",
    converter: FloatFieldConverter,
  },
  {
    name: "high",
    converter: FloatFieldConverter,
  },
  {
    name: "low",
    converter: FloatFieldConverter,
  },
  {
    name: "open",
    converter: FloatFieldConverter,
  }
);

data.forEach((d, i) => {
  buffer[i] = d;
});

const xExtent = fc.extentDate().accessors([(d) => d.date]);

const yExtent = fc.extentLinear().accessors([(d) => d.high, (d) => d.low]);

const candlestick = fc.seriesSvgCandlestick();
const chart = fc
  .chartCartesian(d3.scaleTime(), d3.scaleLinear())
  .svgPlotArea(candlestick)
  .xDomain(xExtent(buffer))
  .yDomain(yExtent(buffer));

d3.select("#chart").datum(buffer).call(chart);
