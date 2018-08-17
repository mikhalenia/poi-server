const ConfigOptions = require('./constants/config-options');

class Config {
  constructor(options = {}) {
    let x = Object.assign({}, ConfigOptions.defaults);
    ConfigOptions.applyOptions(options, x);
    Object.assign(this, x);
  }
}

module.exports = Config;