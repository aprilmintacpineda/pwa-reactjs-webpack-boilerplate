/** @format */

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
String.prototype.padStart = function padStart (targetLength, padString) {
  targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
  padString = String(padString !== undefined ? padString : ' ');
  if (this.length >= targetLength) return String(this);
  targetLength = targetLength - this.length;
  if (targetLength > padString.length) {
    //append to original to ensure we are longer than needed
    padString += padString.repeat(targetLength / padString.length);
  }
  return padString.slice(0, targetLength) + String(this);
};
