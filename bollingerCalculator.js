import { expose } from "https://unpkg.com/comlink@4.2.0/dist/esm/comlink.mjs";

let memory, compute;

const init = async () => {
  const {
    instance: { exports },
  } = await WebAssembly.instantiateStreaming(
    fetch("bollinger/build/untouched.wasm"),
    {
      env: { trace: () => {}, abort: () => {} },
    }
  );
  memory = exports.memory;
  compute = exports.compute;
};

const calculate = (data, period) => {
  const buffer = new Float32Array(memory.buffer, 0, data.length * 4);
  data.forEach((d, i) => {
    buffer[i * 4] = d.close;
  });

  compute(data.length, period);

  const output = new Array(data.length);

  data.forEach((_, i) => {
    if (i < period) {
      output[i] = {};
    } else {
      output[i] = {
        upper: buffer[i * 4 + 1],
        lower: buffer[i * 4 + 2],
        average: buffer[i * 4 + 3],
      };
    }
  });

  return output;
};

expose({ calculate, init });
