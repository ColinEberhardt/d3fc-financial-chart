class ChartBuffer {
  constructor(length, ...fields) {
    this.buffer = new SharedArrayBuffer(length * fields.length * 4);
    this.array = new Int32Array(this.buffer);
    this.fields = fields;
    this.length = length;
  }

  getItem(index) {
    let obj = {};
    this.fields.forEach((field, fieldIndex) => {
      const offset = index * this.fields.length + fieldIndex;
      obj[field.name] = field.converter.decode(this.array[offset]);
    });
    return obj;
  }

  setItem(index, value) {
    this.fields.forEach((field, fieldIndex) => {
      const offset = index * this.fields.length + fieldIndex;
      if (value[field.name]) {
        this.array[offset] = field.converter.encode(value[field.name]);
      }
    });
  }

  map() {
    return this;
  }

  filter() {
    return this;
  }
}

const DateFieldConverter = {
  decode: (value) => new Date(value * 1000),
  encode: (value) => Math.floor(value.getTime() / 1000),
};

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

const buildBuffer = (...fields) => {
  const buffer = new ChartBuffer(...fields);

  return new Proxy(buffer, {
    get(target, name, receiver) {
      if (typeof name !== "string") {
        return Reflect.get(target, name, receiver);
      }
      const index = Number(name);
      if (Number.isNaN(index)) {
        return Reflect.get(target, name, receiver);
      }
      return target.getItem(index);
    },
    set(target, name, value, receiver) {
      if (typeof name !== "string") {
        return Reflect.set(target, name, value, receiver);
      }
      const index = Number(name);
      if (Number.isNaN(index)) {
        return Reflect.set(target, name, value, receiver);
      }
      target.setItem(index, value);
      return true;
    },
  });
};

export { buildBuffer, DateFieldConverter, FloatFieldConverter };
