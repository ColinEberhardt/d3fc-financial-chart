import {
  buildBuffer,
  DateFieldConverter,
  FloatFieldConverter,
} from "./buffer.js";
import bollingerBandSeries from "./bollingerBandSeries.js";

(async () => {
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
    },
    {
      name: "upper",
      converter: FloatFieldConverter,
    },
    {
      name: "lower",
      converter: FloatFieldConverter,
    },
    {
      name: "average",
      converter: FloatFieldConverter,
    }
  );

  data.forEach((d, i) => {
    buffer[i] = {
      ...d,
      upper: null,
      lower: null,
      average: null,
    };
  });

  console.log(buffer[0])

  const { instance } = await WebAssembly.instantiateStreaming(
    fetch("bollinger/build/untouched.wasm"),
    {
      env: { trace: () => {}, abort: () => {}, memory: buffer.memory },
    }
  );

  const exports = instance.exports;

  exports.compute(buffer.fields.length, buffer.length, 10, 2.0, 1, 5, 6, 7);

  const xExtent = fc.extentDate().accessors([(d) => d.date]);

  const yExtent = fc
    .extentLinear()
    .accessors([(d) => d.high, (d) => d.low, (d) => d.upper, (d) => d.lower]);

  const multi = fc
    .seriesSvgMulti()
    .series([
      fc.annotationSvgGridline(),
      bollingerBandSeries(),
      fc.seriesSvgCandlestick(),
    ]);
  const chart = fc
    .chartCartesian(d3.scaleTime(), d3.scaleLinear())
    .svgPlotArea(multi)
    .xDomain(xExtent(buffer))
    .yDomain(yExtent(buffer));

  d3.select("#chart").datum(buffer).call(chart);
})();
