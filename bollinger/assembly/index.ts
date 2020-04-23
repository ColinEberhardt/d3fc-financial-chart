const BYTES_PER_VALUE = 4;

const indexForValue = (index: u32, slots: u32, slot: u32): u32 =>
  index * (BYTES_PER_VALUE * slots) + slot * BYTES_PER_VALUE;

export function compute(
  slots: u8,
  length: u32,
  period: u32,
  delta: f32,
  sourceIndex: u8,
  upperIndex: u8,
  lowerIndex: u8,
  averageIndex: u8
): void {
  let averageAccumulator: f32 = 0.0,
    squaresAccumulator: f32 = 0.0;
  for (let i: u32 = 0; i < length; i++) {
    const currentValue = load<f32>(indexForValue(i, slots, sourceIndex));
    averageAccumulator += currentValue;
    squaresAccumulator += currentValue * currentValue;
    if (i >= (period - 1)) {

      const fperiod = period as f32;
      const average = averageAccumulator / fperiod;
      const sdev = sqrt(
        (squaresAccumulator -
          (averageAccumulator * averageAccumulator) / fperiod) /
          fperiod
      );

      store<f32>(indexForValue(i, slots, upperIndex), average + 2 * sdev);
      store<f32>(indexForValue(i, slots, lowerIndex), average - 2 * sdev);
      store<f32>(indexForValue(i, slots, averageIndex), average);

      const oldValue = load<f32>(indexForValue(i - period + 1, slots, sourceIndex));
      averageAccumulator -= oldValue;
      squaresAccumulator -= oldValue * oldValue;
      
    }
  }
}
