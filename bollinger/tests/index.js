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

for (var i = 0; i < 100; i++) {
  buffer[i * 4] = FloatFieldConverter.encode(23 + Math.random());
}

myModule.compute(100, 10);

console.log(FloatFieldConverter.decode(buffer[10 * 4 + 1]));
console.log(FloatFieldConverter.decode(buffer[10 * 4 + 2]));
console.log(FloatFieldConverter.decode(buffer[10 * 4 + 3]));
