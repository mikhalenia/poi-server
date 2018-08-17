const PoiStatus = require('../constants/status').status;
const PoiReject = require('../errors/PoiReject');
const InvalidParam = require('../errors/InvalidParam');
const Response = require('../Response');
const Point = require('../models/Point');
const PointsSearchFilter = require('../models/PointsSearchFilter');

let PointsStorage = (() => {
  var dbhPool, redisClient, categoriesStorage, logger;

  function save(point) {
    return new Promise((resolve, reject) => {
      dbhPool.getConnection((err, conn) => {
        if (err) {
          conn.release();
          logger.error('Can\'t get MySQL connection...');
          return reject(new PoiReject(PoiStatus.DB_CONNECTION_FAILED));
        }
        conn.query(`
INSERT IGNORE INTO points(category_id, name, address, longitude, latitude, site, working_time)
VALUES(
  ${conn.escape(point.categoryId)},
  ${conn.escape(point.name)},
  ${conn.escape(point.address)},
  ${conn.escape(point.longitude)},
  ${conn.escape(point.latitude)},
  ${conn.escape(point.site)},
  ${conn.escape(JSON.stringify(point.workingTime))}
 )`,
        (err, result) => {
          conn.release();
          if (err) {
            logger.error(`Can 't insert point. Err: ${err}, result: ${result}`);
            return reject(new PoiReject(PoiStatus.DB_QUERY_FAILED));
          } else if (!result.insertId) {
            logger.error(`Duplicate point ${point.name}`);
            return reject(new PoiReject(PoiStatus.POINT_DUPLICATE));
          }

          point.pointId = result.insertId;

          return resolve(result.insertId);
        });
      });
    });
  }

  function update(point) {
    return new Promise((resolve, reject) => {
      dbhPool.getConnection((err, conn) => {
        if (err) {
          conn.release();
          logger.error('Can\'t get MySQL connection...');
          return reject(new PoiReject(PoiStatus.DB_CONNECTION_FAILED));
        }
        conn.query(`
UPDATE points
SET
  category_id = ${conn.escape(point.categoryId)},
  name = ${conn.escape(point.name)},
  address = ${conn.escape(point.address)},
  longitude = ${conn.escape(point.longitude)},
  latitude = ${conn.escape(point.latitude)},
  site = ${conn.escape(point.site)},
  working_time = ${conn.escape(JSON.stringify(point.workingTime))}
WHERE point_id = ${conn.escape(point.pointId)}`,
        (err, result) => {
          conn.release();
          if (err) {
            logger.error(`Can 't update point. Err: ${err}, result: ${result}`);
            return err.code === 'ER_DUP_ENTRY'
              ? reject(new PoiReject(PoiStatus.POINT_DUPLICATE_UPDATE))
              : reject(new PoiReject(PoiStatus.DB_QUERY_FAILED));
          }

          return resolve(true);
        });
      });
    });
  }

  function getPointsByIds(ids) {
    return new Promise((resolve, reject) => {
      if (ids.length === 0) {
        return resolve([]);
      }
      dbhPool.getConnection((err, conn) => {
        if (err) {
          conn.release();
          logger.error('Can\'t get MySQL connection...');
          return reject(new PoiReject(PoiStatus.DB_CONNECTION_FAILED));
        }
        conn.query(`SELECT * FROM points WHERE point_id IN(${ids.map(id => conn.escape(id)).join(',')})`,
        (err, rows) => {
          conn.release();
          if (err) {
            logger.error(`Can 't pick any points. Err: ${err}`);
            return reject(new PoiReject(PoiStatus.DB_QUERY_FAILED));
          }

          return resolve(rows.map(row => Point.createFromDb(row)));
        });
      });
    });
  }

  function cache(point) {
    return new Promise((resolve, reject) => {
      redisClient.geoadd(`category:${point.categoryId}`, [
        point.longitude,
        point.latitude,
        point.pointId
      ], err => (err ? reject(err) : resolve(true)));
    });
  }

  function searchPointsByFilter(pointsSearchFilter) {
    return new Promise((resolve, reject) => {
      redisClient.georadius(`category:${pointsSearchFilter.categoryId}`, [
        pointsSearchFilter.longitude,
        pointsSearchFilter.latitude,
        pointsSearchFilter.radius,
        'km',
        'COUNT',
        pointsSearchFilter.limit,
        'ASC'
      ], (err, result) => (err ? reject(err) : resolve(result)));
    });
  }

  class PointsStorage
  {
    constructor(/* dbhPool, redisClient, categoriesStorage, logger */) {
      dbhPool = arguments[0];
      redisClient = arguments[1];
      categoriesStorage = arguments[2];
      logger = arguments[3];
    }

    async addNewPoint(point) {
      if (!(point instanceof Point)) {
        return Promise.reject(new InvalidParam('Need to send a valid Point'));
      }
      await categoriesStorage.checkIfCategoryExists(point.categoryId);
      await save(point);
      await cache(point);

      return Promise.resolve(new Response(PoiStatus.POINT_SUCCESSFUL_SAVED, {point}));
    }

    async changePoint(point) {
      if (!(point instanceof Point)) {
        return Promise.reject(new InvalidParam('Need to send a valid Point'));
      }
      await this.checkIfPointExists(point.pointId);
      await categoriesStorage.checkIfCategoryExists(point.categoryId);
      await update(point);
      await cache(point);

      return Promise.resolve(new Response(PoiStatus.POINT_SUCCESSFUL_UPDATED));
    }

    async checkIfPointExists(pointId) {
      let points = await getPointsByIds([pointId]);

      return points.length === 0
        ? Promise.reject(new PoiReject(PoiStatus.POINT_NOT_EXISTS))
        : Promise.resolve(true);
    }

    async findNearbyPoints(pointsSearchFilter) {
      if (!(pointsSearchFilter instanceof PointsSearchFilter)) {
        return Promise.reject(new InvalidParam('Need to send a valid PointsSearchFilter'));
      }
      await categoriesStorage.checkIfCategoryExists(pointsSearchFilter.categoryId);
      let pointIds = await searchPointsByFilter(pointsSearchFilter);
      let points = await getPointsByIds(pointIds);

      return Promise.resolve(new Response(PoiStatus.SUCCESS, {points}));
    }
  }

  return PointsStorage;
})();

exports.create = (dbhPool, redisClient, categoriesStorage, logger) => {
  return new PointsStorage(dbhPool, redisClient, categoriesStorage, logger);
};