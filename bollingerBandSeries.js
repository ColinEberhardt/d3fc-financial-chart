const bollingerBandSeries = () => {
  const area = fc
    .seriesSvgArea()
    .mainValue((d) => d.upper)
    .baseValue((d) => d.lower)
    .crossValue((d) => d.date);

  const upperLine = fc
    .seriesSvgLine()
    .mainValue((d) => d.upper)
    .crossValue((d) => d.date);

  const averageLine = fc
    .seriesSvgLine()
    .mainValue((d) => d.average)
    .crossValue((d) => d.date);

  const lowerLine = fc
    .seriesSvgLine()
    .mainValue((d) => d.lower)
    .crossValue((d) => d.date);

  const bollingerMulti = fc
    .seriesSvgMulti()
    .series([area, upperLine, lowerLine, averageLine])
    .decorate((g) => {
      g.enter().attr(
        "class",
        (_, i) =>
          "multi bollinger " + ["area", "upper", "lower", "average"][i]
      );
    });

  return bollingerMulti;
};

export default bollingerBandSeries;