const myModule = require("..");

// the following data results in a NaN
// 223.44,223.54,223.41,223.41,223.69,223.21,223.3,223.7,223.55,223.84,223.76,223.4,223.67,223.57,223.84,223.86,224.03,224.05,223.71,223.47,224.13,224.05,224.38,224.55,224.64,224.52,224.9,224.79,224.63,224.39,224.76,225.07,224.52,224.43,223.69,224.15,224.19,224.31,224.37,224.36,224.72,224.97,224.77,224.71,224.75,224.72,224.96,224.95,225.43,225.88,225.82,226.48,226.21,226.3,226.53,226.5,226.84,227.1,226.64,226.35,225.7,225.84,226.14,226.33,226.61,227.07,227.14,227.21,226.07,226.64,226.05,226.43,226.09,225.93,225.89,226.4,225.96,226.55,226.6,226.69,226.46,226.57,226.38,225.65,225.68,225.36,225.37,224.71,224.53,224.45,223.99,224.31,224.58,224.48,224.38,225,225.2,225.07,225.14,224.81,224.88,224.76,225,225.1,224.87,224.54,224.18,224.14,224.35,224.13,224.29,223.97,223.97,224.1,224.06,223.62,223.71,223.75,223.54,223.51,223.6

const itof = new Int32Array(1);
const ffromi = new Float32Array(itof.buffer);
const ftoi = new Float32Array(1);
const ifromf = new Int32Array(ftoi.buffer);

const FloatFieldConverter = {
  decode: (value) => {
    itof[0] = value;
    return ffromi[0];
  },
  encode: (value) => {
    ftoi[0] = value;
    return ifromf[0];
  },
};

const buffer = new Int32Array(myModule.memory.buffer);

for (var i = 0; i < 100; i++) {
  buffer[i * 4] = FloatFieldConverter.encode(23 + Math.random());
}

myModule.compute(100, 10);

console.log(FloatFieldConverter.decode(buffer[10 * 4 + 1]));
console.log(FloatFieldConverter.decode(buffer[10 * 4 + 2]));
console.log(FloatFieldConverter.decode(buffer[10 * 4 + 3]));
