const PoiStatus = require('../constants/status').status;
const PoiReject = require('../errors/PoiReject');

let PointsSearchFilter = (() => {
  const MAX_RADIUS_KM = 3;
  const MAX_LIMIT = 1000;
  const MAX_DEGREE = 85.05112878;

  function checkCategoryId(categoryId) {
    return typeof(categoryId) === "number" && !Number.isNaN(categoryId) && categoryId !== 0;
  }

  function isValidCoordinate(coordinate) {
    return typeof(coordinate) === "number" && coordinate >= -MAX_DEGREE && coordinate <= MAX_DEGREE;
  }

  function checkGps(longitude, latitude) {
    return isValidCoordinate(longitude) && isValidCoordinate(latitude);
  }

  function isValidRadius(radius) {
    return typeof(radius) === "number" && radius !== 0 && radius < MAX_RADIUS_KM;
  }

  function isValidLimit(limit) {
    return typeof(limit) === "number" && limit !== 0 && limit < MAX_LIMIT;
  }

  class PointsSearchFilter {
    constructor(categoryId, longitude, latitude, radius, limit) {
      if (!checkCategoryId(categoryId)) {
        throw new PoiReject(PoiStatus.INCORRECT_CATEGORY_ID);
      }

      if (!checkGps(longitude, latitude)) {
        throw new PoiReject(PoiStatus.INCORRECT_POINT_GPS);
      }

      this.categoryId = categoryId;
      this.longitude = longitude;
      this.latitude = latitude;
      this.radius = isValidRadius(radius) ? radius : MAX_RADIUS_KM;
      this.limit = isValidLimit(limit) ? limit : MAX_LIMIT;
    }

    static createFromPayload(payload = {}) {
      return new this(+payload.category_id, +payload.longitude, +payload.latitude, +payload.radius, +payload.limit);
    }
  }

  return PointsSearchFilter;
})();

module.exports = PointsSearchFilter;