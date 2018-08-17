const Protocol = require('./constants/http-protocol');
const Router = require('koa-router');
const Response = require('./Response');
const PoiReject = require('./errors/PoiReject');
const InvalidParam = require('./errors/InvalidParam');
const Category = require('./models/Category');
const Point = require('./models/Point');
const PointsSearchFilter = require('./models/PointsSearchFilter');

let ResponseBuilder = (() => {
  var getRouter = (() => {
    var router;

    return () => {
      if (typeof(router) !== "undefined") {
        return router;
      }

      router = new Router();
      router
        .use(async(ctx, next) => {
            try {
              await next()
            } catch (err) {
              if (err instanceof PoiReject) {
                return setResponse(new Response(err.status), ctx);
              } else if (err instanceof InvalidParam) {
                ctx.state.responseBuilder.logger.error(err.stack);
                return setResponse(new Response(Protocol.status.INVALID_PARAM_SENT), ctx);
              } else {
                ctx.state.responseBuilder.logger.error(err.stack);
                return setResponse(new Response(Protocol.status.UNKNOWN_ERROR), ctx);
              }
            }
        })

        .post(Protocol.objectPath.CATEGORY, async(ctx) => {
          ctx.state.action = `${Protocol.objectPath.CATEGORY}:POST`;
          let builderCtx = ctx.state.responseBuilder;
          await runAction.call(
            builderCtx,
            builderCtx.categoriesStorage,
            builderCtx.categoriesStorage.addNewCategory,
            [Category.createFromPayload(await getPayload(ctx))],
            ctx);
        })

        .post(Protocol.objectPath.POINT, async(ctx) => {
          ctx.state.action = `${Protocol.objectPath.POINT}:POST`;
          let builderCtx = ctx.state.responseBuilder;
          await runAction.call(
            builderCtx,
            builderCtx.pointsStorage,
            builderCtx.pointsStorage.addNewPoint,
            [Point.createFromPayload(await getPayload(ctx))],
            ctx);
        })

        .put(`${Protocol.objectPath.POINT}/:point_id`, async (ctx) => {
          ctx.state.action = `${Protocol.objectPath.POINT}:PUT`;
          let builderCtx = ctx.state.responseBuilder;
          await runAction.call(
            builderCtx,
            builderCtx.pointsStorage,
            builderCtx.pointsStorage.changePoint,
            [Point.createFromPayload(await getPayload(ctx), true)],
            ctx
          );
        })

        .get(Protocol.objectPath.POINT, async (ctx) => {
          ctx.state.action = `${Protocol.objectPath.POINT}:GET`;
          let builderCtx = ctx.state.responseBuilder;
          await runAction.call(
            builderCtx,
            builderCtx.pointsStorage,
            builderCtx.pointsStorage.findNearbyPoints,
            [PointsSearchFilter.createFromPayload(await getPayload(ctx))],
            ctx
          );
        });

      return router;
    };
  })();

  function getPayload(koaCtx) { return new Promise((resolve, reject) => {
    var payload;

    try {
      payload = typeof(koaCtx.request.body) === "string" ? JSON.parse(koaCtx.request.body) : {};
    } catch(err) {
      return reject(new PoiReject(Protocol.status.INCORRECT_BODY), koaCtx);
    }

    if (typeof(payload) !== "object") {
      return reject(new PoiReject(Protocol.status.INCORRECT_BODY), koaCtx);
    }

    return resolve(Object.assign(payload, koaCtx.params, koaCtx.query));
  }); }

  function setResponse(response, koaCtx) {
    let code = typeof(Protocol.message[response.status]) === "undefined"
      ? Protocol.status.UNKNOWN_ERROR
      : response.status,
      body = {code};

    if (typeof(response.result) !== "undefined") {
      body.result = response.result;
    }
    body.message = Protocol.message[code];

    koaCtx.status = Protocol.httpStatus[code];
    koaCtx.body = body;
  }

  function runAction(actionCtx, actionMethod, actionArgs, koaCtx) {
    return actionMethod.apply(actionCtx, actionArgs)
      .then(response => setResponse(response, koaCtx));
  }

  class ResponseBuilder
  {
    constructor(bus = {}) {
      this.logger = bus.logger;
      this.categoriesStorage = bus.categoriesStorage;
      this.pointsStorage = bus.pointsStorage;
    }

    static getRouter() {
      return getRouter();
    }
  }

  return ResponseBuilder;
})();

module.exports = ResponseBuilder;