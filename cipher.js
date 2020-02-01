const keys = require('./config/keys');
const skip32 = require('skip32');

var cipher = new skip32.Skip32(segmentNumber(keys.skip));

function segmentNumber(n, bits = 8) {
  let val = BigInt(n);
  const arr = [];
  const big = BigInt(Math.pow(2, bits));
  while (val > 0) {
    arr.push(Number(val % big));
    val = val / big
  }
  return arr;
}

function encode64(num) {
  return segmentNumber(num, 6).map(x =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.'[x])
    .join('');
}

function seperate(value, shift) {
  const shiftExp = Math.pow(2, shift);
  return {
    bottom: value % shiftExp,
    top: Math.floor(value / shiftExp)
  };
}

function combine(obj, shift) {
  return obj.bottom + (Math.pow(2, shift) * obj.top);
}

function encrypt(value) {
  let sep = null;

  for (let i = 0; i < 3; i++) {
    sep = seperate(value, 4);
    sep.top = cipher.encrypt(sep.top);
    sep = seperate(combine(sep, 4), 32);
    sep.bottom = cipher.encrypt(sep.bottom);
    value = combine(sep, 32);
  }

  return value;
}

function decrypt(value) {
  let sep = null;

  for (let i = 0; i < 3; i++) {
    sep = seperate(value, 32);
    sep.bottom = cipher.decrypt(sep.bottom);
    sep = seperate(combine(sep, 32), 4);
    sep.top = cipher.decrypt(sep.top);
    value = combine(sep, 4);
  }

  return value;
}

module.exports = {
  encrypt,
  decrypt,
  encode64,
};