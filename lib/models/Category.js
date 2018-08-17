const PoiStatus = require('../constants/status').status;
const PoiReject = require('../errors/PoiReject');

let Category = (() => {
  function checkName(name) {
    return typeof(name) === "string" && name.trim() !== "";
  }

  class Category {
    constructor(categoryId, name) {
      if (!checkName(name)) {
        throw new PoiReject(PoiStatus.INCORRECT_CATEGORY_NAME);
      }
      this.categoryId = categoryId;
      this.name = name.trim();
    }

    static createFromPayload(payload = {}) {
      return new Category(
        payload.category_id,
        payload.name);
    }

    static createFromDb(row = {}) {
      return new Category(
        row.category_id,
        row.name);
    }
  }

  return Category;
})();

module.exports = Category;