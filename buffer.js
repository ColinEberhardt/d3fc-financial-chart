class ChartBuffer {
  constructor(length, ...fields) {
    this.memory = new WebAssembly.Memory({
      initial: 10,
      maximum: 100,
    });
    this.array = new Int32Array(this.memory.buffer);
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
      if (value.hasOwnProperty(field.name)) {
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

const nullValue = 0x01010101;

const FloatFieldConverter = {
  decode: (value) => {
    if (value === nullValue) {
      return null;
    }
    itof[0] = value;
    return ffromi[0];
  },
  encode: (value) => {
    if (value === null) {
      return nullValue;
    }
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
