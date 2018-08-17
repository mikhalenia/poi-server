class PoiReject extends Error {
  constructor(status, ...args) {
    super(status, ...args);
    this.status = status;
    Error.captureStackTrace(this, PoiReject);
  }
}

module.exports = PoiReject;