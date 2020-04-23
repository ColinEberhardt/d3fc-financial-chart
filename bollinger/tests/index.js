const myModule = require("..");

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

buffer[0] = FloatFieldConverter.encode(23);
buffer[6] = FloatFieldConverter.encode(28);

myModule.compute(6, 100, 1.5, 0, 4, 5);

console.log(FloatFieldConverter.decode(buffer[0 + 6]));
console.log(FloatFieldConverter.decode(buffer[4 + 6]));
console.log(FloatFieldConverter.decode(buffer[5 + 6]));
