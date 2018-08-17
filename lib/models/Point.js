const PoiStatus = require('../constants/status').status;
const PoiReject = require('../errors/PoiReject');

let Point = (() => {
  const MAX_DEGREE = 85.05112878;

  function checkPointId(pointId) {
    return typeof(pointId) === "number" && !Number.isNaN(pointId) && pointId !== 0;
  }

  function checkCategoryId(categoryId) {
    return typeof(categoryId) === "number" && !Number.isNaN(categoryId) && categoryId !== 0;
  }

  function checkName(name) {
    return typeof(name) === "string" && name.trim() !== "";
  }

  function checkAddress(adress) {
    return typeof(adress) === "string" && adress.trim() !== "";
  }

  function isValidCoordinate(coordinate) {
    return typeof(coordinate) === "number" && coordinate >= -MAX_DEGREE && coordinate <= MAX_DEGREE;
  }

  function checkGps(longitude, latitude) {
    return isValidCoordinate(longitude) && isValidCoordinate(latitude);
  }

  class Point {
    constructor(pointId, categoryId, name, address, longitude, latitude, site, workingTime, forUpdate = false) {
      if (forUpdate && !checkPointId(pointId)) {
        throw new PoiReject(PoiStatus.INCORRECT_POINT_ID);
      }

      if (!checkCategoryId(categoryId)) {
        throw new PoiReject(PoiStatus.INCORRECT_CATEGORY_ID);
      }

      if (!checkName(name)) {
        throw new PoiReject(PoiStatus.INCORRECT_POINT_NAME);
      }

      if (!checkAddress(address)) {
        throw new PoiReject(PoiStatus.INCORRECT_POINT_ADDRESS);
      }

      if (!checkGps(longitude, latitude)) {
        throw new PoiReject(PoiStatus.INCORRECT_POINT_GPS);
      }

      this.pointId = pointId;
      this.categoryId = categoryId;
      this.name = name.trim();
      this.address = address.trim();
      this.longitude = longitude;
      this.latitude = latitude;
      this.site = site || '';
      this.workingTime = workingTime || {};
    }

    static createFromPayload(payload = {}, forUpdate = false) {
      return new this(
        +payload.point_id,
        payload.category_id,
        payload.name,
        payload.address,
        payload.longitude,
        payload.latitude,
        payload.site,
        payload.working_time,
        forUpdate);
    }

    static createFromDb(row = {}) {
      return new this(
        row.point_id,
        row.category_id,
        row.name,
        row.address,
        row.longitude,
        row.latitude,
        row.site,
        JSON.parse(row.working_time));
    }
  }

  return Point;
})();

module.exports = Point;