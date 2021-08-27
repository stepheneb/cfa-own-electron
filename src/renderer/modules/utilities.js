/*jshint esversion: 7 */

//
// Utilities
//

let utilities = {};

utilities.isString = (x) => {
  return Object.prototype.toString.call(x) === "[object String]";
};

utilities.shortenStr = s => {
  return s.split('-').map(w => w.substr(0, 1)).reduce((a, c) => a + c);
};

utilities.containsAll = (arr1, arr2) =>
  arr2.every(arr2Item => arr1.includes(arr2Item));

utilities.sameMembers = (arr1, arr2) =>
  utilities.containsAll(arr1, arr2) && utilities.containsAll(arr2, arr1);

utilities.forLoopMinMax = (array) => {
  let min = array[0],
    max = array[0];
  for (let i = 1; i < array.length; i++) {
    let value = array[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
};

utilities.roundNumber = (value, precision = 1) => {
  return Number(Number.parseFloat(value).toPrecision(precision));
};

utilities.histogram = (array, numbuckets, min, max) => {
  let i, index, val, sval,
    range = max - min,
    bucketSize = range / numbuckets,
    scale = numbuckets / range,
    buckets = Array(numbuckets);

  for (i = 0; i < buckets.length; i++) {
    let bucketStart = utilities.roundNumber(i * bucketSize + min, 3);
    buckets[i] = [bucketStart, 0];
  }
  for (i = 0; i < array.length; i++) {
    val = array[i];
    if (val >= min && val <= max) {
      sval = (val - min) * scale;
      index = Math.floor(sval);
      if (index < 0 || index >= numbuckets) {
        // console.log(index);
      } else {
        buckets[index][1] += 1;
      }
    }
  }
  return buckets;
};

utilities.getLastItem = thePath => thePath.substring(thePath.lastIndexOf('/') + 1);

// event listener wrapper: discard events until <wait> time has passed
// https://www.joshwcomeau.com/snippets/javascript/debounce/
utilities.debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

utilities.getMonthDayStr = (d) => {
  return (d.getMonth() + 1).toString().padStart(2, '0') + (d.getDay() + 1).toString().padStart(2, '0');
};

utilities.getMonthDayStrNow = () => {
  let now = new Date();
  return utilities.getMonthDayStr(now);
};

utilities.getMonthDayNow = () => {
  let now = new Date();
  return Number.parseInt(utilities.getMonthDayStr(now));
};

utilities.bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) return `${bytes} ${sizes[i]})`;
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
};

utilities.runningInElectron = () => {
  return (typeof ELECTRON !== 'undefined');
};

utilities.notRunningInElectron = () => {
  return !utilities.runningInElectron();
};

utilities.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

utilities.UUID = (function () {
  var i, lut, self;
  self = {};
  lut = [];
  i = 0;
  while (i < 256) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16);
    i++;
  }
  self.generate = function () {
    var d0, d1, d2, d3;
    d0 = Math.random() * 0xffffffff | 0;
    d1 = Math.random() * 0xffffffff | 0;
    d2 = Math.random() * 0xffffffff | 0;
    d3 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
  };
  return self;
})();

export default utilities;
