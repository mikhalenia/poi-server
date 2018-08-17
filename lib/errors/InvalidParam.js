class InvalidParam extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, InvalidParam);
  }
}

module.exports = InvalidParam;