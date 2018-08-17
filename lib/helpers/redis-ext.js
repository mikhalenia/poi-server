const redis = require('redis');

function RedisClient(opts = {}, logger) {
  var config = {
    'host': opts.host || '127.0.0.1',
    'port': opts.port || 6379,
    'connect_timeout': opts.timeout || 3600000
  };
  if (opts.db) {
    config.db = opts.db;
  }
  var client = redis.createClient(config);

  function errorLog(err) {
    if (err) {
      logger.error(err.toString());
    }
  }
  client.on('error', errorLog);
  client.on('warning', errorLog);

  return client;
}

exports.createRedisClient = (opts, logger) => {
  return new RedisClient(opts, logger);
};