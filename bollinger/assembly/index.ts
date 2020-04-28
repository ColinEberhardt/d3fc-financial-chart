const BYTES_PER_VALUE = 4;

enum Slot {
  Source,
  Upper,
  Lower,
  Average
}

const SLOTS_PER_INDEX = 4; // i.e. the number of values in the Index enum

const indexForValue = (index: u32, slot: u32): u32 =>
  index * (BYTES_PER_VALUE * SLOTS_PER_INDEX) + slot * BYTES_PER_VALUE;

export function compute(
  length: u32,
  period: u32
): void {
  let averageAccumulator: f32 = 0.0,
    squaresAccumulator: f32 = 0.0;
  for (let i: u32 = 0; i < length; i++) {
    const currentValue = load<f32>(indexForValue(i, Slot.Source));
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

      store<f32>(indexForValue(i, Slot.Upper), average + 2 * sdev);
      store<f32>(indexForValue(i, Slot.Lower), average - 2 * sdev);
      store<f32>(indexForValue(i, Slot.Average), average);

      const oldValue = load<f32>(indexForValue(i - period + 1, Slot.Source));
      averageAccumulator -= oldValue;
      squaresAccumulator -= oldValue * oldValue; 
    }
  }
}
