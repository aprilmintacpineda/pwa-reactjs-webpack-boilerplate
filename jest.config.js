/** @format */

const path = require('path');

module.exports = {
  moduleNameMapper: {
    'root/(.*)': path.join(__dirname, 'src/frontend/$1')
  }
};
