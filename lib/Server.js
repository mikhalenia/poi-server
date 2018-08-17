const EventEmitter = require('events').EventEmitter;
const DbPool = require('./helpers/db-pool');
const RedisExt = require('./helpers/redis-ext');
const Graphite = require('graphite');
const Logger = require('./helpers/logger');
const ResponseBuilder = require('./ResponseBuilder');
const CategoriesStorage = require('./storages/CategoriesStorage');
const PointsStorage = require('./storages/PointsStorage');

exports.create = (options) => {
  return new Server(options);
};

let Server = (() => {
  function getModules(connectionLogger) {
    let categoriesStorage = CategoriesStorage.create(this.dbhPool, connectionLogger);
    return {
      'categoriesStorage': categoriesStorage,
      'pointsStorage': PointsStorage.create(this.dbhPool, this.redisClient, categoriesStorage, connectionLogger),
      'logger': connectionLogger
    };
  }

  function initServer(type) {
    if (this.server[type]) {
      return this.server[type];
    }

    this.server[type] = require(`./servers/${type}`).create({
      'getHttpRouter': () => ResponseBuilder.getRouter(),
      'createResponseBuilder': (connectionLogger) => new ResponseBuilder(getModules.call(this, connectionLogger)),
      'getGraphiteClient': () => this.graphiteClient,
      'getServerLogger': () => this.serverLogger,
      'createConnectionLogger': () => new Logger({
        'initArgStorage': true
      }),
      'httpHeaders': this.config.httpHeaders,
      'graphitePrefix': this.config.graphite.prefix
    });
    this.server[type].listen(this.config.listen[type].port, this.config.listen[type].host);

    return this.server[type];
  }

  function closePools() {
    if (this.dbhPool) {
      this.dbhPool.end();
    }
    if (this.redisClient) {
      this.redisClient.end(true);
    }
  }

  class Server extends EventEmitter {
    constructor(config) {
      super();
      this.serverLogger = new Logger();
      this.config = config;
      this.server = {};
      this.dbhPool = DbPool.createPool(this.config.mysql, this.serverLogger);
      this.redisClient = RedisExt.createRedisClient(this.config.redis, this.serverLogger);
      this.graphiteClient = Graphite.createClient(this.config.graphite.dsn);
      process.on('exit', () => {
        closePools.call(this);
        if (this.server.http) {
          this.server.http.emit('close');
        }
        process.exit(1);
      });
      process.on('SIGINT', () => {
        closePools.call(this);
        process.exit(2);
      });
      process.on('uncaughtException', (e) => {
        closePools.call(this);
        this.serverLogger.error(e.stack);
        process.exit(2);
      });
    }

    init_http() {
      return initServer.call(this, 'http');
    }
  }

  return Server;
})();