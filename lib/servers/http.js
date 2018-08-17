const Events = require('events');
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const uuid = require('../helpers/uuid');

class Server extends Events.EventEmitter {
  constructor(options = {}) {
    super();

    var app = new Koa(),
      router = options.getHttpRouter();

    this.logger = options.getServerLogger();
    this.connectionCount = 0;
    this.server = http.createServer(app.callback());

    app
      .use(koaBody())
      .use(async(ctx, next) => {
        let tmStart = Date.now(),
          connectionId = uuid();
        var ConnectionLogger = options.createConnectionLogger(),
          graphiteClient = options.getGraphiteClient();
        ++this.connectionCount;
        ctx.state.responseBuilder = options.createResponseBuilder(ConnectionLogger);

        ConnectionLogger.setArguments({
          connectionId,
          'ip': ctx.ip,
          'request': ctx.request.headers,
          'url': ctx.request.url
        });

        ctx.res.on('finish', () => {
          ConnectionLogger.note('Peer disconnected');
        });

        ConnectionLogger.note('Peer connected');
        this.emit('connection');

        await next();

        ctx.set({
          "Access-Control-Allow-Origin": options.httpHeaders.access_control_allow_origin,
          "Access-Control-Allow-Headers": "Content-Type, Content-Length, X-Requested-With, Accept",
          "Content-Type": "application/json; charset=utf-8"
        });

        if (ctx.status === 404) {
          ctx.body = {
            'message': 'Not found'
          };
        } else if (ctx.status === 405) {
          ctx.body = {
            'message': 'Method Not Allowed'
          };
        }

        let now = Date.now(),
        tm = ((now - tmStart) / 1000).toFixed(4);

        ConnectionLogger.setArguments({tm});

        if (ctx.state.action) {
          graphiteClient.write({
            [`${options.graphitePrefix}:${ctx.state.action}`]: tm
          }, now);
        }
      })
      .use(router.routes())
      .use(router.allowedMethods());

    this.server.on('error', (e) => {
      if (e.code == 'EADDRINUSE') {
        this.logger.error(`server error, address already in use: ${e}`);
      } else {
        this.logger.error(`server error: ${e}`);
      }
    });

    this.server.on('close', () => {
      this.logger.error(`POI server closing after handling ${this.connectionCount} connections`);
    });

    this.on('close', () => {
      this.server.emit('close');
    });
  }

  listen(port, host, callback) {
    this.logger.note(`POI server binding to port ${port} on ${host || 'all IPs'}...`);
    this.server.listen(port, host, () => {
      this.logger.note("successfully bound!");
      if (typeof(callback) == 'function') {
        callback.call(this);
      }
    });
  }
}

exports.create = function() {
  return new Server(arguments[0]);
};