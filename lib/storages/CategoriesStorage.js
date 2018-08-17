const PoiStatus = require('../constants/status').status;
const PoiReject = require('../errors/PoiReject');
const InvalidParam = require('../errors/InvalidParam');
const Response = require('../Response');
const Category = require('../models/Category');

let CategoriesStorage = (() => {
  var dbhPool, logger;

  function saveToDb(category) {
    return new Promise((resolve, reject) => {
      dbhPool.getConnection((err, conn) => {
        if (err) {
          conn.release();
          logger.error('Can\'t get MySQL connection...');
          return reject(new PoiReject(PoiStatus.DB_CONNECTION_FAILED));
        }
        conn.query(`INSERT IGNORE INTO categories SET name = LOWER(${conn.escape(category.name.trim())})`,
        (err, result) => {
          conn.release();
          if (err) {
            logger.error(`Can 't insert category. Err: ${err}, result: ${result}`);
            return reject(new PoiReject(PoiStatus.DB_QUERY_FAILED));
          } else if (!result.insertId) {
            logger.error(`Duplicate category ${category.name}`);
            return reject(new PoiReject(PoiStatus.CATEGORY_DUPLICATE));
          }

          category.categoryId = result.insertId;

          return resolve(category);
        });
      });
    });
  }

  function getCategoryById(categoryId) {
    return new Promise((resolve, reject) => {
      dbhPool.getConnection((err, conn) => {
        if (err) {
          conn.release();
          logger.error('Can\'t get MySQL connection...');
          return reject(new PoiReject(PoiStatus.DB_CONNECTION_FAILED));
        }
        conn.query(`SELECT * FROM categories WHERE category_id = ${conn.escape(categoryId)}`,
        (err, rows) => {
          conn.release();
          if (err) {
            logger.error(`Can 't pick any category. Err: ${err}`);
            return reject(new PoiReject(PoiStatus.DB_QUERY_FAILED));
          } else if (rows.length === 0) {
            logger.error(`Can't find any category`);
            return reject(new PoiReject(PoiStatus.CATEGORY_NOT_EXISTS));
          }

          return resolve(Category.createFromDb(rows[0]));
        });
      });
    });
  }

  class CategoriesStorage {
    constructor( /* dbhPool, logger */ ) {
      dbhPool = arguments[0];
      logger = arguments[1];
    }

    async addNewCategory(category) {
      if (!(category instanceof Category)) {
        return Promise.reject(new InvalidParam('Need to send a valid Category'));
      }
      await saveToDb(category);

      return Promise.resolve(new Response(PoiStatus.CATEGORY_SUCCESSFUL_SAVED, {category}));
    }

    async checkIfCategoryExists(categoryId) {
      await getCategoryById(categoryId);

      return Promise.resolve(true);
    }
  }

  return CategoriesStorage;
})();

exports.create = (dbhPool, logger) => {
  return new CategoriesStorage(dbhPool, logger);
};