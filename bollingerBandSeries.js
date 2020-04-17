const bollingerBandSeries = () => {
  const area = fc
    .seriesSvgArea()
    .mainValue((d) => d.bollinger.upper)
    .baseValue((d) => d.bollinger.lower)
    .crossValue((d) => d.date);

  const upperLine = fc
    .seriesSvgLine()
    .mainValue((d) => d.bollinger.upper)
    .crossValue((d) => d.date);

  const averageLine = fc
    .seriesSvgLine()
    .mainValue((d) => d.bollinger.average)
    .crossValue((d) => d.date);

  const lowerLine = fc
    .seriesSvgLine()
    .mainValue((d) => d.bollinger.lower)
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